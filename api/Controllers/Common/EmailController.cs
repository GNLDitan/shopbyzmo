using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.DataAccess.Common;
using ByzmoApi.DataAccess.Applcation;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using System.Text;
using static ByzmoApi.Enum.SendEmail;

namespace ByzmoApi.Controllers.Common
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IUserService _userService;
        private readonly IAppSettings _appSettings;
        private readonly IResetTokenService _resetTokenService;
        private readonly IOrderService _orderService;
        private readonly IProductService _productService;
        private readonly IShippingService _shippingService;

        public EmailController(IEmailService emailService,
            IResetTokenService resetTokenService,
            IAppSettings appSettings,
            IUserService userService,
            IOrderService orderService,
            IShippingService shippingService,
            IProductService productService)
        {
            this._emailService = emailService;
            this._appSettings = appSettings;
            this._resetTokenService = resetTokenService;
            this._userService = userService;
            this._orderService = orderService;
            this._productService = productService;
            this._shippingService = shippingService;
        }

        [AllowAnonymous]
        [HttpPost("sendresetpasswordlink")]
        public IActionResult SendResetLink([FromBody] User user)
        {
            try
            {
                // Validation before registering
                if (user.Email == null || string.IsNullOrWhiteSpace(user.Email))
                    return BadRequest();

                // Get user Record
                var resetUser = _userService.GetUserByEmail(user.Email);

                // Validate if user exists
                if (resetUser == null)
                    return BadRequest(new { message = "User doesn't exist!" });

                // Get Templates Directory
                var template = _appSettings.ResetPasswordTemplate;
                var filePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Templates", template);

                // Set Token Data
                var resetToken = new ResetToken
                {
                    RecipientEmail = user.Email,
                    Token = _resetTokenService.GenerateToken(128),
                    ExpirationDate = DateTimeOffset.UtcNow.AddDays(7),
                    IsClaimed = false,
                    TokenType = (int)TokenType.ForgotPassword
                };

                // Append Data to Template
                var sbBody = new StringBuilder();
                sbBody.Append(filePath.ReadAllText());
                sbBody.Replace("{UserFullName}", resetUser.Name);
                sbBody.Replace("{ResetPasswordLink}",
                    $"{_appSettings.ResetPasswordLink}?email={user.Email}&token={resetToken.Token}");
                resetToken.EmailContent = sbBody.ToString();

                // Send Email
                _emailService.SendEmail(user.Email, user.Name, "Request for reset password", resetToken.EmailContent);

                //Create Token Record
                var confirmationToken = _userService.CreateConfirmationToken(resetToken);

                // Validate Token is create
                if (confirmationToken == null)
                    return BadRequest(new { message = "An error occurred while creating your request" });

                // Returning user that has been created 
                return Ok(new
                {
                    resetUser.Email,
                    resetUser.Name
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("sendorderemail")]
        public async Task<IActionResult> SendOrderEmail([FromBody] Order order)
        {
            try
            {
                // Validation before registering
                if (order.ShippingDetails == null)
                {
                    return BadRequest(new { message = "An error occurred while creating your request" });
                }

                if (order.ShippingDetails.Email == null || string.IsNullOrWhiteSpace(order.ShippingDetails.Email))
                    return BadRequest(new { message = "An error occurred while creating your request" });

                // Get Templates Directory
                var template = _appSettings.OrderTemplate;
                var filePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Templates", template);


                OrderEmailHeader emailHeader = new OrderEmailHeader();

                string EmailContent;
                string Subject = "";

                // Append Data to Template
                var sbBody = new StringBuilder();
                sbBody.Append(filePath.ReadAllText());
                sbBody.Replace("{OrderNumber}", order.Id.ToString());
                sbBody.Replace("{CustomerName}", order.ShippingDetails.CompleteName);
                sbBody.Replace("{MobileNumber}", order.ShippingDetails.NumCode + order.ShippingDetails.MobileNumber.ToString());

                StringBuilder headContent = new StringBuilder();
                if (!order.ForLayAway && !order.ForPreOrder && !order.ForPr && !order.ForPreOrderNotif)
                {
                    if (order.StatusId != 5)
                    {
                        emailHeader = order.OrderEmailHeader.FirstOrDefault(i => i.StatusId == order.StatusId
                                           && i.PaymentStatusId == order.PaymentStatusId
                                           && i.WithPreOrder == order.WithPreOrder && i.LayAway == order.LayAway
                                           && i.ForPr == order.ForPr);
                        headContent.Append(emailHeader.HeaderContent);
                    }
                    else if (order.StatusId == 5)
                    {
                        headContent.Append(
                                       "<span>" + "We've received your request to cancel order #" + order.Id.ToString() + "." + "</span>" +
                                       "<br>" +
                                         "<br>" +
                                      "<span>" + "We're sorry this order didn’t work out for you, but we hope to see you again soon!." + "</span>" +
                                       "<br>" +
                                         "<br>" +
                                      "<span>" + "If you already paid for this order, no worries! We’ll be in touch when your refund has been processed." + "</span>" +
                                       "<br>"
                                    );
                        sbBody.Replace("{Content}", headContent.ToString());
                    }

                }
                else if (order.ForPr)
                {
                    headContent.Append(
                                 "<span>" + "This is a reminder for your Balance Due Payment." + "</span>" +
                                 "<br>" +
                                   "<br>" +
                                 "<span>" + "See Order Details below." + "</span>" +
                                  "<br>" +
                                 "<br>" +
                                 "<span>" + "For Bank Deposit/Bank Transfer/other manual payments, please send as a copy of proof of payment in this email. Indicate the Order No. and attachment details." + "</span>" +
                                 "<br>" +
                                  "<br>" +
                                 "<span>" + "For Credit Card/Debit Card/Paypal payments, please settle amount by logging in to your account and in View Orders, select the order with balance. Click the Pay Now button to pay for the amounts of your scheduled payment date."
                             );
                    sbBody.Replace("{Content}", headContent.ToString());
                }
                else if (order.ForPreOrderNotif)
                {
                    headContent.Append(
                                 "<span>" + "Your Pre Order Item " + order.NotifProduct.ProductName + " for Order No. " +  order.Id + " has arrived!" + "</span>" +
                                 "<br>" +
                                 "<br>" +
                                 "<span>" + "You can now pay for the remaining Balance and shipping fee so we can process your order for shipping. " + "</span>" +
                                  "<br>" +
                                  "<br>" +
                                 "<span>" + "For Pre Order Layaway payment terms, you have the option to follow your scheduled payment date or settle the remaining balance and pay in full. The order will be shipped once order is fully paid." + "</span>" +
                                  "<br>" +
                                 "<br>" +
                                  "<span>" + "Login to your account to view your balance in View Orders." + "</span>" +
                                  "<br>" +
                                 "<br>" +
                                 "<span>" + "For Bank Deposit/Bank Transfer/other manual payments, please send as a copy of proof of payment in this email. Indicate the Order No. and attachment details." + "</span>" +
                                 "<br>" +
                                  "<br>" +
                                 "<span>" + "For Credit Card/ Paypal/Gcash/Grabpay payments, please settle amount by logging in to your account and in View Orders, select the order with balance. Click the Pay Now button to pay for the amounts of your scheduled payment date. Click Pay in Full if you want to pay all remaining balance."
                             );
                    sbBody.Replace("{Content}", headContent.ToString());
                }
                else
                {
                    headContent.Append(
                                         "<span>" + "We have received your payment.  Kindly check the details below. " + "</span>" +
                                          "<br>" +
                                         "<span>" + "If you paid more than what is listed below, kindly reply to this email with the deposit slip so that we may acknowledge your payment Thank you very much!" + "</span>" +
                                          "<br>"
                                       );

                    sbBody.Replace("{Content}", headContent.ToString());
                }

                sbBody.Replace("{Content}", headContent.ToString());


                sbBody.Replace("{ClientOrderLink}",
                    $"{_appSettings.ClientOrderLink}/{order.SecurityId}");
                sbBody.Replace("{ByzmoLink}", $"{_appSettings.ByzmoLink}");
                sbBody.Replace("{ImageLogo}", _appSettings.ImageLogo);
                sbBody.Replace("{SubTotal}", $"{order.ShippingDetails.BaseCurrency + " " + order.ShippingDetails.SubTotal.ToString("N2"):0.00}");
                sbBody.Replace("{ShippingMethod}", order.ShippingDetails.ShippingName);
                StringBuilder Discount = new StringBuilder();
                Discount.Append(
                    "<td style='padding:5px 0'>" +
                        "<p style='color:#777;line-height:1.2em;font-size:16px;margin:0'> " +
                        "<span style='font-size:16px'>" +
                            "Discount Amount" +
                        "</span>" +
                         "</p> " +
                     "</td> " +
                     "<td style='padding:5px 0' align='right'>" +
                      "<strong style='font-size:16px;color:#555'>" + "( " +
                        $"PHP {order.DiscountAmount.ToString("N2"):0.00}" + " )" +
                        "</strong> " +
                    "</td>"
                );

                if (order.DiscountAmount > 0)
                {
                    sbBody.Replace("{DiscountAmount}", Discount.ToString());
                }
                else
                {
                    sbBody.Replace("{DiscountAmount}", "");
                }



                if (order.LayAway)
                {
                    if (order.ForLayAway)
                    {
                        if(!order.ForPreOrderNotif)
                            Subject = order.ForPr ? "Order # " + order.Id.ToString() + " Payment Reminder" : "Order # " + order.Id.ToString() + " Payment Confirmation";
                        else
                            Subject = "Order #" + order.Id.ToString() + " Pre Order Item Arrived!";
                       
                        sbBody.Replace("{PaymentNote}", "");
                    }
                    else
                    {
                        if(order.ForPreOrderNotif)
                        {
                            Subject = "Order #" + order.Id.ToString() + " Pre Order Item Arrived!";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                        else if (order.StatusId == 1)
                        {
                            Subject = "Order # " + order.Id.ToString() + " Confirmation & Layaway Payment Details";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                        else if (order.StatusId == 2)
                        {
                            Subject = "Order # " + order.Id.ToString() + " Processing";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                        else if (order.StatusId == 3)
                        {
                            Subject = "Order # " + order.Id.ToString() + " Shipped";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                        else if (order.StatusId == 5)
                        {
                            Subject = "Order # " + order.Id.ToString() + " Cancellation Confirmation";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                    }


                    StringBuilder layAway = new StringBuilder();
                    // StringBuilder AmountToPayNote = new StringBuilder();
                    layAway.AppendLine(
                       "<tr>" +
                        "<td style='padding:5px 0'>" +
                        "<p style='color:#777;line-height:1.2em;font-size:16px;margin:0'>" +
                        "<span style='font-size:16px'>" +
                         "Amount To Pay" +
                         "</span>" +
                         "</p>" +
                         "</td>" +
                         "<td style='padding:5px 0' align='right'>" +
                        "<strong style='font-size:16px;color:#555'>" +
                        $"{order.ShippingDetails.BaseCurrency + " " + order.AmountToPay.ToString("N2"):0.00}" +
                        "</strong>" +
                        "</td>" +
                         "</tr>"
                       );

                    //  AmountToPayNote.AppendLine(

                    //   "<tr>" +
                    //   "<td style='text-align:left'>" +
                    //   "<span style='font-size:16px'>" +
                    //    "For Layaway items, only the amount in Non refundable deposit will be included in Amount to Pay. Installment amount and Shipping will be paid on scheduled payment date. " +
                    //   "</span>" +
                    //   "</td>" +
                    //   "</tr>"
                    //   );
                    if (!order.ForLayAway)
                    {
                        sbBody.Replace("{AmountToPay}", layAway.ToString());
                    }
                    else
                    {
                        sbBody.Replace("{AmountToPay}", "");
                    }

                    // sbBody.Replace("{AmountToPayNote}", AmountToPayNote.ToString());
                }
                else
                {
                    if (order.ForPreOrder)
                    {
                        Subject = order.ForPr ? "Order # " + order.Id.ToString() + " Payment Reminder" : "Order # " + order.Id.ToString() + " Payment Confirmation";
                        sbBody.Replace("{PaymentNote}", "");
                    }
                    else
                    {
                        if (order.ForPreOrderNotif)
                        {
                            Subject = "Order #" + order.Id.ToString() + " Pre Order Item Arrived!";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                        else if (order.StatusId == 1)
                        {
                            Subject = "Order # " + order.Id.ToString() + " Confirmation";
                            sbBody.Replace("{PaymentNote}", @"Again, Just a gentle reminder. non-payment of orders within
                                                        three (3) days of order submission will automatically cancel
                                                        your ENTIRE order. You are welcome to re-order the items subject
                                                        to stock availability.");
                        }
                        else if (order.StatusId == 2)
                        {
                            Subject = "Order # " + order.Id.ToString() + " Processing";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                        else if (order.StatusId == 3)
                        {
                            Subject = "Order # " + order.Id.ToString() + " Shipped";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                        else if (order.StatusId == 5)
                        {
                            Subject = "Order # " + order.Id.ToString() + " Cancellation Confirmation";
                            sbBody.Replace("{PaymentNote}", "");
                        }
                    }

                    sbBody.Replace("{AmountToPay}", "");
                    sbBody.Replace("{AmountToPayNote}", "");
                }

                sbBody.Replace("{SumTotalPrice}", $"{order.ShippingDetails.BaseCurrency + " " + order.TotalPrice.ToString("N2"):0.00}");
                sbBody.Replace("{ShippingAddress}", order.ShippingAddress);
                sbBody.Replace("{BillingAddress}", order.ShippingDetails.BillingAddress);
                sbBody.Replace("{PaymentMethodName}", order.PaymentMethodName);


                if (order.StatusId == 1 || order.ForPreOrderNotif)
                {
                    sbBody.Replace("{CourierTrackingLink}", "");
                }
                else if (order.StatusId == 2)
                {
                    sbBody.Replace("{PaymentNote}", "");
                    sbBody.Replace("{CourierTrackingLink}", "");
                }
                else if (order.StatusId == 3 && !order.ForLayAway)
                {
                    StringBuilder TrackingUrl = new StringBuilder();
                    string trackingNumber = "";
                    trackingNumber = order.TrackingNumber != null ? order.TrackingNumber.ToString() : "";
                    TrackingUrl.Append(
                        "Tracking No. " +
                        "<a style='text-decoration:none;color:#1990c6'" +
                        "href='" + order.ShippingDetails.TrackingUrl + "'" +
                        "target='blank'>" + trackingNumber +
                        "</a>"
                    );
                    sbBody.Replace("{CourierTrackingLink}", TrackingUrl.ToString());
                    sbBody.Replace("{PaymentNote}", "");
                }
                else
                {
                    sbBody.Replace("{EmailInstruction}", "");
                    sbBody.Replace("{PaymentNote}", "");
                    sbBody.Replace("{CourierTrackingLink}", "");
                }


                if (order.StatusId == 1 || order.ForPreOrderNotif)
                {

                    if (order.PaymentMethodName.Contains("Bank") || order.PaymentMethodName.Contains("Credit") || 
                        order.PaymentMethodName.Contains("PayPal") || order.PaymentMethodName.Contains("GCash") || 
                        order.PaymentMethodName.Contains("GrabPay") || order.PaymentMethodName.Contains("OTC"))
                    {
                        StringBuilder emailInstruct = new StringBuilder();
                        emailInstruct.Append(
                              order.ShippingDetails.EmailInstruction
                        );
                        sbBody.Replace("{EmailInstruction}", emailInstruct.ToString());
                    }
                    else
                    {
                        sbBody.Replace("{EmailInstruction}", "");
                    }
                }
                else
                {
                    sbBody.Replace("{EmailInstruction}", "");
                }

                StringBuilder sbOrderItems = new StringBuilder();

                foreach (var orderItem in order.OrderCart)
                {
                    string productImage = _appSettings.ProductImageLink + orderItem.Product.CurrentImageUrl;
                    sbOrderItems.AppendLine(
                        "<table style='width:100%;border-spacing:0;border-collapse:collapse'>" +
                            "<tbody>" +
                                "<tr style ='width:100%'>" +
                                    "<td>" +
                                    "<table style='border-spacing:0;border-collapse:collapse'>" +
                                        "<tbody>" +
                                            "<tr>" +
                                                "<td>" +
                                                    "<img style='margin-right:15px;border-radius:8px;border:1px solid #e5e5e5' align='left' width='60' height='60' src='" + productImage + "' />" +
                                                "</td>" +
                                                "<td style='width:100%'>" +
                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    orderItem.Product.ProductName + " X " + orderItem.Quantity.ToString() +
                                                "</span>" +
                                                "<br>" +
                                                "</td>" +
                                                "<td style='white-space:nowrap'>" +
                                                    "<p style = 'color:#555;line-height:150%;font-size:16px;font-weight:600;margin:0 0 0 15px' align='right'>" +
                                                       $"{order.ShippingDetails.BaseCurrency + " " + orderItem.TotalAmount.ToString("N2"):0.00}" +
                                                    "</p>" +
                                                "</td>" +
                                            "</tr>" +
                                        "</tbody>" +
                                    "</table>" +
                                    "</td>" +
                                "</tr>" +
                            "</tbody>" +
                        "</table>"
                        );

                    //for layaway
                    if (orderItem.isLayAway)
                    {
                        sbOrderItems.Append(
                        "<table style='width:100%;border-spacing:0;border-collapse:collapse'>" +
                        "<tbody>" +
                        "<tr style ='width:100%'>" +
                            "<td>" +
                                "<table style='border-spacing:0;border-collapse:collapse'>" +
                                        "<tbody>" +
                                            "<tr>" +
                                                "<td width='50%'>" +
                                                    "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    "Number of Installment : " +
                                                "</span>" +
                                                "</td>" +
                                                "<td style='width:100%'>" +
                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    orderItem.NumberOfInstallment.ToString() +
                                                "</span>" +
                                                "<br>" +
                                                "</td>" +
                                            "</tr>" +
                                        "</tbody>" +
                                "</table>" +
                                 "<table style='border-spacing:0;border-collapse:collapse'>" +
                                        "<tbody>" +
                                            "<tr>" +
                                                "<td width='50%'>" +
                                                    "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    "Date of Payment :" +
                                                "</span>" +
                                                "</td>" +
                                                "<td style='width:100%'>" +
                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    orderItem.PaymentDates.ToString() +
                                                "</span>" +
                                                "<br>" +
                                                "</td>" +
                                            "</tr>" +
                                        "</tbody>" +
                                "</table>" +
                            "</td>" +
                         "</tr>" +
                        "</tbody>" +
                        "</table>"
                        );


                        foreach (var layAwaySched in orderItem.LayAwaySchedule)
                        {
                            string PaidStatus = "";
                            PaidStatus = layAwaySched.IsCleared ? "Paid" : "Unpaid";
                            string Term = "";
                            Term = layAwaySched.IsNonRefundDeposit ? "Non Refundable Deposit :" : layAwaySched.Date.ToString("MM/dd/yyyy");

                            if (!layAwaySched.IsShipping && !layAwaySched.IsInsurance)
                            {
                                sbOrderItems.Append(
                                    "<table style='width:100%;border-spacing:0;border-collapse:collapse;'>" +
                                        "<tbody>" +
                                        "<tr style ='width:100%'>" +
                                            "<td>" +
                                                "<table style='border-spacing:0;border-collapse:collapse'>" +
                                                        "<tbody>" +
                                                            "<tr>" +
                                                                "<td width='40%'>" +
                                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                    Term +
                                                                "</span>" +
                                                                "</td>" +
                                                                "<td style='width:100%'>" +
                                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                    $"{order.ShippingDetails.BaseCurrency + " " + layAwaySched.Monthly.ToString("N2"):0.00}" +
                                                                "</span>" +
                                                                "<br>" +
                                                                "</td>" +
                                                                "<td style='width:100%'>" +
                                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                    PaidStatus +
                                                                "</span>" +
                                                                "<br>" +
                                                                "</td>" +
                                                            "</tr>" +
                                                        "</tbody>" +
                                                "</table>" +
                                            "</td>" +
                                        "</tr>" +
                                        "</tbody>" +
                                    "</table>"

                                );
                            }

                        }
                    }

                    if (orderItem.PreOrder || (orderItem.PreOrderLayaway && !orderItem.isLayAway))
                    {
                        foreach (var preOrderSched in orderItem.PreOrderSchedule)
                        {
                            string PreOrderPaidStatus = "";
                            string PaymentTerm = "";
                            PreOrderPaidStatus = preOrderSched.IsCleared ? "Paid" : "Unpaid";
                            PaymentTerm = preOrderSched.PaymentTerm == "DP" ? "Downpayment :" : "Remaining Balance :";

                            if (preOrderSched.PaymentTerm != "SH" && preOrderSched.PaymentTerm != "IN")
                            {
                            //    if(orderItem.RushFee > 0 && preOrderSched.PaymentTerm == "DP") 
                            //    {
                            //         preOrderSched.Amount += orderItem.RushFee;
                            //    }

                                sbOrderItems.Append(
                                "<table style='width:100%;border-spacing:0;border-collapse:collapse;'>" +
                                    "<tbody>" +
                                    "<tr style ='width:100%'>" +
                                        "<td>" +
                                            "<table style='border-spacing:0;border-collapse:collapse'>" +
                                                    "<tbody>" +
                                                        "<tr>" +
                                                            "<td width='38%'>" +
                                                            "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                PaymentTerm +
                                                            "</span>" +
                                                            "</td>" +
                                                            "<td style='width:100%'>" +
                                                            "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                $"{order.ShippingDetails.BaseCurrency + " " + preOrderSched.Amount.ToString("N2"):0.00}" +
                                                            "</span>" +
                                                            "<br>" +
                                                            "</td>" +
                                                            "<td style='width:100%'>" +
                                                            "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                PreOrderPaidStatus +
                                                            "</span>" +
                                                            "<br>" +
                                                            "</td>" +
                                                        "</tr>" +
                                                    "</tbody>" +
                                            "</table>" +
                                        "</td>" +
                                    "</tr>" +
                                    "</tbody>" +
                                "</table>"
                                );
                            }

                        }
                    }
                    sbOrderItems.Append("<br>");
                }


                // Paynow
                StringBuilder payNow = new StringBuilder();
                if ((order.PaymentMethodName.Contains("Credit") || order.PaymentMethodName.Contains("PayPal") || order.PaymentMethodName.Contains("GCash") || order.PaymentMethodName.Contains("GrabPay"))
                    && order.PaymentStatusId != 3 && order.StatusId != 5
                    )
                {
                    // var link = order.PaymentMethodName.Contains("Credit") ? order.SecurityId + "/" + "credit-card"
                    //           : order.SecurityId + "/" + "paypal";

                    var pmethod = order.PaymentMethodName.Contains("Credit") ? "credit-card" :
                                  order.PaymentMethodName.Contains("PayPal") ? "paypal" :
                                  order.PaymentMethodName.Contains("GCash") ? "gcash" :
                                  "grabpay";

                    var link = order.SecurityId + "/" + pmethod;

                    payNow.Append(
                        "<a style='font-size:16px;text-decoration:none;display:block;'" +
                        "target='_blank'" +
                         "href='" + _appSettings.PaynowLink + link + "'" + ">" + "Pay Now" + "</a> "

                    );
                    sbBody.Replace("{PayNow}", payNow.ToString());
                }
                else
                {
                    sbBody.Replace("{PayNow}", "");
                }


                StringBuilder insuranceFee = new StringBuilder();
                insuranceFee.AppendLine("<tr>" +
                    "<td style='padding:5px 0'>" +
                    "<p style='color:#777;line-height:1.2em;font-size:16px;margin:0'>" +
                    "<span tyle='font-size:16px'>" +
                        "Shipping Insurance Fee" +
                     "</span>" +
                     "</p>" +
                     "</td>" +
                    "<td style='padding:5px 0' align='right'>" +
                    "<strong style='font-size:16px;color:#555'>" +
                     $"{order.ShippingDetails.BaseCurrency + " " + order.InsuranceFee.ToString("N2"):0.00}" +
                    "</strong>" +
                    "</td>" +
                    "</tr>"
                );

                sbBody.Replace("{ShippingAmount}", $"{order.ShippingDetails.BaseCurrency + " " + order.ShippingAmount.ToString("N2"):0.00}");
                if (order.InsuranceFee > 0)
                {
                    sbBody.Replace("{InsuranceFee}", insuranceFee.ToString());
                }
                else sbBody.Replace("{InsuranceFee}", "");

                sbBody.Replace("{OrderItems}", sbOrderItems.ToString());
                EmailContent = sbBody.ToString();
                
               
                // Send Email
                if(!order.ForPreOrderNotif) 
                {
                  await _orderService.UpdateOrderSendEmailAsync(order.Id, order.ForLayAway, order.LayAwayId, order.ShippingDetails.Email, order.StatusId, order.IsSendEmail, order.IsPrSend, order.ForPreOrder, order.PreOrderId);
                }
                else  
                {
                     var notif = new PreOrderNotification();
                     notif.OrderId = order.Id;
                     notif.ProductId = order.NotifProduct.Id;
                     await _orderService.UpdatePreOrderNotificationAsync(notif);
                }
                await _emailService.SendEmailAsync(order.ShippingDetails.Email, order.ShippingDetails.CompleteName, Subject, EmailContent);
                // Returning user that has been created 
                return Ok(new
                {
                    order.ShippingDetails.Email,
                    order.ShippingDetails.CompleteName
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("sendadminorder")]
        public async Task<IActionResult> SendAdminOrder([FromBody] Order order)
        {
            try
            {

                // Get Templates Directory
                var template = _appSettings.OrderAdminTemplate;
                var filePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Templates", template);

                var EmailContent = "";
                // Append Data to Template
                var sbBody = new StringBuilder();
                var orderNumber = new StringBuilder();
                sbBody.Append(filePath.ReadAllText());

                sbBody.Replace("{CustomerName}", order.ShippingDetails.CompleteName);
                sbBody.Replace("{EmailAddress}", order.Email);
                sbBody.Replace("{MobileNumber}", order.ShippingDetails.NumCode + order.ShippingDetails.MobileNumber.ToString());
                sbBody.Replace("{ShippingAddress}", order.ShippingAddress);
                sbBody.Replace("{BillingAddress}", order.ShippingDetails.BillingAddress);
                sbBody.Replace("{ShippingVia}", order.ShippingDetails.ShippingName);
                sbBody.Replace("{PaymentVia}", order.PaymentMethodName);

                StringBuilder sbOrderItems = new StringBuilder();

                foreach (var orderItem in order.OrderCart)
                {
                    string productImage = _appSettings.ProductImageLink + orderItem.Product.CurrentImageUrl;
                    sbOrderItems.AppendLine(
                        "<table style='width:100%;border-spacing:0;border-collapse:collapse'>" +
                            "<tbody>" +
                                "<tr style ='width:100%'>" +
                                    "<td>" +
                                    "<table style='border-spacing:0;border-collapse:collapse'>" +
                                        "<tbody>" +
                                            "<tr>" +
                                                "<td>" +
                                                    "<img style='margin-right:15px;border-radius:8px;border:1px solid #e5e5e5' align='left' width='60' height='60' src='" + productImage + "' />" +
                                                "</td>" +
                                                "<td style='width:100%'>" +
                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    orderItem.Product.ProductName + " X " + orderItem.Quantity.ToString() +
                                                "</span>" +
                                                "<br>" +
                                                "</td>" +
                                                "<td style='white-space:nowrap'>" +
                                                    "<p style = 'color:#555;line-height:150%;font-size:16px;font-weight:600;margin:0 0 0 15px' align='right'>" +
                                                       $"{order.ShippingDetails.BaseCurrency + " " + orderItem.TotalAmount.ToString("N2"):0.00}" +
                                                    "</p>" +
                                                "</td>" +
                                            "</tr>" +
                                        "</tbody>" +
                                    "</table>" +
                                    "</td>" +
                                "</tr>" +
                            "</tbody>" +
                        "</table>"
                        );

                    //for layaway
                    if (orderItem.isLayAway)
                    {
                        sbOrderItems.Append(
                        "<table style='width:100%;border-spacing:0;border-collapse:collapse'>" +
                        "<tbody>" +
                        "<tr style ='width:100%'>" +
                            "<td>" +
                                "<table style='border-spacing:0;border-collapse:collapse'>" +
                                        "<tbody>" +
                                            "<tr>" +
                                                "<td width='50%'>" +
                                                    "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    "Number of Installment : " +
                                                "</span>" +
                                                "</td>" +
                                                "<td style='width:100%'>" +
                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    orderItem.NumberOfInstallment.ToString() +
                                                "</span>" +
                                                "<br>" +
                                                "</td>" +
                                            "</tr>" +
                                        "</tbody>" +
                                "</table>" +
                                 "<table style='border-spacing:0;border-collapse:collapse'>" +
                                        "<tbody>" +
                                            "<tr>" +
                                                "<td width='50%'>" +
                                                    "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    "Date of Payment :" +
                                                "</span>" +
                                                "</td>" +
                                                "<td style='width:100%'>" +
                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                    orderItem.PaymentDates.ToString() +
                                                "</span>" +
                                                "<br>" +
                                                "</td>" +
                                            "</tr>" +
                                        "</tbody>" +
                                "</table>" +
                            "</td>" +
                         "</tr>" +
                        "</tbody>" +
                        "</table>"
                        );


                        foreach (var layAwaySched in orderItem.LayAwaySchedule)
                        {
                            string PaidStatus = "";
                            PaidStatus = layAwaySched.IsCleared ? "Paid" : "Unpaid";
                            string Term = "";
                            Term = layAwaySched.IsNonRefundDeposit ? "Non Refundable Deposit :" : layAwaySched.Date.ToString("MM/dd/yyyy");

                            if (!layAwaySched.IsShipping && !layAwaySched.IsInsurance)
                            {
                                sbOrderItems.Append(
                                    "<table style='width:100%;border-spacing:0;border-collapse:collapse;'>" +
                                        "<tbody>" +
                                        "<tr style ='width:100%'>" +
                                            "<td>" +
                                                "<table style='border-spacing:0;border-collapse:collapse'>" +
                                                        "<tbody>" +
                                                            "<tr>" +
                                                                "<td width='40%'>" +
                                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                    Term +
                                                                "</span>" +
                                                                "</td>" +
                                                                "<td style='width:100%'>" +
                                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                    $"{order.ShippingDetails.BaseCurrency + " " + layAwaySched.Monthly.ToString("N2"):0.00}" +
                                                                "</span>" +
                                                                "<br>" +
                                                                "</td>" +
                                                                "<td style='width:100%'>" +
                                                                "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                    PaidStatus +
                                                                "</span>" +
                                                                "<br>" +
                                                                "</td>" +
                                                            "</tr>" +
                                                        "</tbody>" +
                                                "</table>" +
                                            "</td>" +
                                        "</tr>" +
                                        "</tbody>" +
                                    "</table>"

                                );
                            }

                        }
                    }

                    if (orderItem.PreOrder || (orderItem.PreOrderLayaway && !orderItem.isLayAway))
                    {
                        foreach (var preOrderSched in orderItem.PreOrderSchedule)
                        {
                            string PreOrderPaidStatus = "";
                            string PaymentTerm = "";
                            PreOrderPaidStatus = preOrderSched.IsCleared ? "Paid" : "Unpaid";
                            PaymentTerm = preOrderSched.PaymentTerm == "DP" ? "Downpayment :" : "Remaining Balance :";

                            if (preOrderSched.PaymentTerm != "SH" && preOrderSched.PaymentTerm != "IN")
                            {
                                sbOrderItems.Append(
                                "<table style='width:100%;border-spacing:0;border-collapse:collapse;'>" +
                                    "<tbody>" +
                                    "<tr style ='width:100%'>" +
                                        "<td>" +
                                            "<table style='border-spacing:0;border-collapse:collapse'>" +
                                                    "<tbody>" +
                                                        "<tr>" +
                                                            "<td width='38%'>" +
                                                            "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                PaymentTerm +
                                                            "</span>" +
                                                            "</td>" +
                                                            "<td style='width:100%'>" +
                                                            "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                $"{order.ShippingDetails.BaseCurrency + " " + preOrderSched.Amount.ToString("N2"):0.00}" +
                                                            "</span>" +
                                                            "<br>" +
                                                            "</td>" +
                                                            "<td style='width:100%'>" +
                                                            "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                                PreOrderPaidStatus +
                                                            "</span>" +
                                                            "<br>" +
                                                            "</td>" +
                                                        "</tr>" +
                                                    "</tbody>" +
                                            "</table>" +
                                        "</td>" +
                                    "</tr>" +
                                    "</tbody>" +
                                "</table>"
                                );
                            }

                        }
                    }
                    sbOrderItems.Append("<br>");
                }

                var Discount = new StringBuilder();
                Discount.Append(
                   "<td style='padding:5px 0'>" +
                       "<p style='color:#777;line-height:1.2em;font-size:16px;margin:0'> " +
                       "<span style='font-size:16px'>" +
                           "Discount Amount" +
                       "</span>" +
                        "</p> " +
                    "</td> " +
                    "<td style='padding:5px 0' align='right'>" +
                     "<strong style='font-size:16px;color:#555'>" + "( " +
                       $"PHP {order.DiscountAmount.ToString("N2"):0.00}" + " )" +
                       "</strong> " +
                   "</td>"
               );

                if (order.DiscountAmount > 0)
                {
                    sbBody.Replace("{DiscountAmount}", Discount.ToString());
                }
                else
                {
                    sbBody.Replace("{DiscountAmount}", "");
                }

                StringBuilder layAway = new StringBuilder();
                if (order.LayAway)
                {
                    layAway.AppendLine(
                    "<tr>" +
                    "<td style='padding:5px 0'>" +
                    "<p style='color:#777;line-height:1.2em;font-size:16px;margin:0'>" +
                    "<span style='font-size:16px'>" +
                        "Amount To Pay" +
                        "</span>" +
                        "</p>" +
                        "</td>" +
                        "<td style='padding:5px 0' align='right'>" +
                    "<strong style='font-size:16px;color:#555'>" +
                    $"{order.ShippingDetails.BaseCurrency + " " + order.AmountToPay.ToString("N2"):0.00}" +
                    "</strong>" +
                    "</td>" +
                        "</tr>"
                    );

                    if (!order.ForLayAway)
                    {
                        sbBody.Replace("{AmountToPay}", layAway.ToString());
                    }
                    else
                    {
                        sbBody.Replace("{AmountToPay}", "");
                    }
                }
                else
                {
                    sbBody.Replace("{AmountToPay}", "");
                }



                StringBuilder insuranceFee = new StringBuilder();
                insuranceFee.AppendLine("<tr>" +
                    "<td style='padding:5px 0'>" +
                    "<p style='color:#777;line-height:1.2em;font-size:16px;margin:0'>" +
                    "<span tyle='font-size:16px'>" +
                        "Shipping Insurance Fee" +
                     "</span>" +
                     "</p>" +
                     "</td>" +
                    "<td style='padding:5px 0' align='right'>" +
                    "<strong style='font-size:16px;color:#555'>" +
                     $"{order.ShippingDetails.BaseCurrency + " " + order.InsuranceFee.ToString("N2"):0.00}" +
                    "</strong>" +
                    "</td>" +
                    "</tr>"
                );
                if (order.InsuranceFee > 0)
                {
                    sbBody.Replace("{InsuranceFee}", insuranceFee.ToString());
                }
                else sbBody.Replace("{InsuranceFee}", "");


                sbBody.Replace("{SumTotalPrice}", $"{order.ShippingDetails.BaseCurrency + " " + order.TotalPrice.ToString("N2"):0.00}");
                sbBody.Replace("{SubTotal}", $"{order.ShippingDetails.BaseCurrency + " " + order.ShippingDetails.SubTotal.ToString("N2"):0.00}");
                sbBody.Replace("{ShippingAmount}", $"{order.ShippingDetails.BaseCurrency + " " + order.ShippingAmount.ToString("N2"):0.00}");
                sbBody.Replace("{ShippingAddress}", order.ShippingAddress);
                sbBody.Replace("{BillingAddress}", order.ShippingDetails.BillingAddress);
                sbBody.Replace("{PaymentMethodName}", order.ShippingDetails.ShippingName);
                sbBody.Replace("{OrderItems}", sbOrderItems.ToString());


                orderNumber.Append(
                        "<a " +
                        "target='_blank'" +
                         "href='" + _appSettings.ByzmoWebLink + "/administration/orders/" + order.Id + "'" + ">" + order.Id + "</a>" +
                         "<span> (" + DateTime.Now.ToString("dddd, dd MMMM yyyy") + ") </span>"

                );
                sbBody.Replace("{OrderNumber}", orderNumber.ToString());

                EmailContent = sbBody.ToString();
                await _emailService.SendEmailAsync(_appSettings.AdminEmail, "Shop Byzmo", "New Customer Order - Order#" + order.Id, EmailContent);
                return Ok(new
                {
                    order.ShippingDetails.Email,
                    order.ShippingDetails.CompleteName
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }


        }


        [AllowAnonymous]
        [HttpPost("sendproductnotification")]
        public async Task<IActionResult> SendResetLink([FromBody] UserProductNotification notif)
        {
            try
            {
                // Validation before registering
                if (notif.Email == null || string.IsNullOrWhiteSpace(notif.Email))
                    return BadRequest();

                // Get user Record
                var user = _userService.GetUserByEmail(notif.Email);

                // Validate if user exists
                if (user == null)
                    return BadRequest(new { message = "User doesn't exist!" });

                // Get user Record
                var product = await _productService.GetProductByIdAsync(notif.ProductId);
                var images = await _productService.GetProductImagesByIdAsync(notif.ProductId);
                if (images.Count() > 0)
                {
                    var CurrentImageUrl = images.Where(x => x.IsDefaultImage).FirstOrDefault();
                    if (CurrentImageUrl == null)
                    {
                        CurrentImageUrl = images.FirstOrDefault();
                    }
                    product.CurrentImageUrl = CurrentImageUrl.FileName;
                }

                string productImage = _appSettings.ProductImageLink + product.CurrentImageUrl;

                // Get Templates Directory
                var template = _appSettings.UserProductNotificationTemplate;
                var filePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Templates", template);

                // Append Data to Template
                var sbBody = new StringBuilder();
                var pBody = new StringBuilder();
                sbBody.Append(filePath.ReadAllText());
                sbBody.Replace("{CustomerName}", user.Name);
                sbBody.Replace("{ImageLogo}", _appSettings.ImageLogo);
                sbBody.Replace("{ViewLink}", _appSettings.ByzmoWebLink + "/product/" + product.LinkName);
                pBody.Append("<table style='width:100%;border-spacing:0;border-collapse:collapse'>" +
                            "<tbody>" +
                                "<tr style ='width:100%'>" +
                                    "<td>" +
                                    "<table style='border-spacing:0;border-collapse:collapse;width:100%;'>" +
                                        "<tbody>" +
                                            "<tr>" +
                                                "<td style='vertical-align: middle; text-align: left;'>" +
                                                    "<img style='margin-right:15px;border-radius:8px;border:1px solid #e5e5e5;width: inherit;height: 180px;object-fit: cover;' src='" + productImage + "' />" +
                                                "</td>" +
                                            "</tr>" +
                                            "<tr>" +
                                                "<td style='width:100%; vertical-align: middle; text-align: left'>" +
                                                    "<span style='font-size:16px;font-weight:600;line-height:1.4;color:#555'>" +
                                                        product.ProductName +
                                                    "</span>" +
                                                "</td>" +
                                             "</tr>" +
                                        "</tbody>" +
                                    "</table>" +
                                    "</td>" +
                                "</tr>" +
                            "</tbody>" +
                        "</table>");
                sbBody.Replace("{product}", pBody.ToString());
                string title = "Back in Stock (" + product.ProductName + ")";
                // Send Email
                _emailService.SendEmail(user.Email, user.Name, title, sbBody.ToString());


                // Returning user that has been created 
                return Ok(new
                {
                    notif.Email,
                    notif.ProductId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("sendpreordernotification")]
        public IActionResult SendPreOrderNotification([FromBody] PreOrderNotification notif)
        {
            try
            {
               // Get Templates Directory
                var template = _appSettings.PreOrderNotificationTemplate;
                var filePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Templates", template);
                var title = String.Format("Order #{0} Pre Order Item Arrived!", notif.OrderId.ToString());

                // Append Data to Template
                var sbBody = new StringBuilder();
                sbBody.Append(filePath.ReadAllText());
                sbBody.Replace("{OrderNumber}", notif.OrderId.ToString());
                sbBody.Replace("{CustomerName}", notif.CustomerName);
                sbBody.Replace("{ProductName}", notif.ProductName);

                _emailService.SendEmail(notif.Email, notif.CustomerName, title, sbBody.ToString());
                var res = _orderService.UpdatePreOrderNotification(notif);

                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("sendpaymentnotification")]
        public async Task<IActionResult> SendPaymentNotification(PaymentDetails details)
        {
            try
            {
                // Get Templates Directory
                var order = await _orderService.GetOrderByIdAsync(details.OrderId);
                var shipping = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                
                var template = _appSettings.AdminPaymentTemplate;
                var filePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Templates", template);
                var title = String.Format("Payment in Order #{0}", details.OrderId.ToString());

                // Append Data to Template
                var sbBody = new StringBuilder();
                sbBody.Append(filePath.ReadAllText());
                sbBody.Replace("{OrderNumber}", details.OrderId.ToString());
                sbBody.Replace("{CustomerName}", shipping.CompleteName);
                sbBody.Replace("{PaymentMethod}", shipping.PaymentMethodDescription.ToString());
                sbBody.Replace("{AdminOrderLink}", _appSettings.ByzmoWebLink + "/administration/orders/" + details.OrderId.ToString());
                
                _emailService.SendEmail(_appSettings.AdminEmail, shipping.CompleteName, title, sbBody.ToString());

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }

}