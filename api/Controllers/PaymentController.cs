using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using ByzmoApi.DataAccess.Applcation;
using ByzmoApi.DataAccess.Common;
using System;
using static ByzmoApi.Enum.Payment;
using static ByzmoApi.Enum.PaymongoStatus;
using System.Text;

namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderService _orderService;
        private readonly IShippingService _shippingService;
        private readonly ILoyaltyService _loyaltyService;
        private readonly IProductService _iProductService;
        private readonly IAppSettings _appSettings;
        private readonly IEmailService _emailService;

        public PaymentController(IPaymentService paymentService,
            IOrderService orderService,
            IShippingService shippingService,
            ILoyaltyService loyaltyService,
            IProductService iProductService,
            IAppSettings appSettings,
            IEmailService emailService)
        {
            _paymentService = paymentService;
            _orderService = orderService;
            _shippingService = shippingService;
            _loyaltyService = loyaltyService;
            _iProductService = iProductService;
            _appSettings = appSettings;
            _emailService = emailService;
        }
        [AllowAnonymous]
        [HttpPost("getpaymentmethodlistrange")]
        public async Task<IActionResult> GetPaymentMethodListRange(Filter filter)
        {
            try
            {
                var paymentMethods = await _paymentService.GetPaymentMethodListRangeAsync(filter);
                foreach (var paymentMethod in paymentMethods)
                    paymentMethod.TransactionFee = await _paymentService.GetTransactionFeesBPaymentMethodIdAsync(paymentMethod.Id);

                return Ok(paymentMethods);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("getcheckoutpaymentmethodlistrange")]
        public async Task<IActionResult> GetCheckoutPaymentMethodListRange(Filter filter)
        {
            try
            {
                var paymentMethods = await _paymentService.GetPaymentMethodListRangeAsync(filter);
                foreach (var paymentMethod in paymentMethods)
                    paymentMethod.TransactionFee = await _paymentService.GetTransactionFeesBPaymentMethodIdAsync(paymentMethod.Id);

                return Ok(paymentMethods.Where(item => item.IsEnable));
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpGet("getcreditcardmethod")]
        public async Task<IActionResult> GetCreditCardMethod()
        {
            try
            {
                var creditCardMethod = await _paymentService.GetCreditCardMethodAsync();

                // await _paymentService.AddIsPaymongoAsync();
                
                return Ok(creditCardMethod);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        
        [HttpPost("createpaymentmethod")]
        public async Task<IActionResult> CreatePaymentMethod([FromBody] PaymentMethod paymentMethod)
        {
            try
            {
                if (paymentMethod == null) return BadRequest();
                paymentMethod.IsActive = true;
                var paymentMethodData = await _paymentService.CreatePaymentMethodAsync(paymentMethod);

                foreach (var paymentAccount in paymentMethod.PaymentMethodAccounts)
                {
                    paymentAccount.PaymentMethodId = paymentMethodData.Id;
                    await _paymentService.CreatePaymentMethodAccountAsync(paymentAccount);

                }

                return Ok(paymentMethodData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpGet("getpaymentmethodbyid/{id}")]
        public async Task<IActionResult> GetPaymentMethodById(int id)
        {
            try
            {
                var paymentMethod = await _paymentService.GetPaymentMethodByIdAsync(id);
                paymentMethod.PaymentMethodAccounts = await _paymentService.GetPaymentMethodAccountByMethodIdAsync(paymentMethod.Id);
                paymentMethod.TransactionFee = await _paymentService.GetTransactionFeesBPaymentMethodIdAsync(paymentMethod.Id);
                return Ok(paymentMethod);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPatch("updatepaymentmethod")]
        public async Task<IActionResult> UpdatePaymentMethod([FromBody] PaymentMethod paymentMethod)
        {
            try
            {
                if (paymentMethod == null) return BadRequest();
                var paymentMethodData = await _paymentService.UpdatePaymentMethodAsync(paymentMethod);
                foreach (var account in paymentMethod.PaymentMethodAccounts)
                {
                    account.PaymentMethodId = paymentMethodData.Id;
                    if (account.IsDeleted)
                    {
                        await _paymentService.DeletePaymentMethodAccountByIdAsync(account.Id);
                    }
                    else
                    {
                        var paymentMethodAccount = account.IsNew ? await _paymentService.CreatePaymentMethodAccountAsync(account) :
                                       await _paymentService.UpdatePaymentMethodAccountAsync(account);
                        account.Id = paymentMethodAccount.Id;
                    }

                }
                return Ok(paymentMethodData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPost("deletepaymentmethodbyid")]
        public async Task<IActionResult> DeletePaymentMethodById([FromBody] int id)
        {
            try
            {
                var isDeleted = await _paymentService.DeletePaymentMethodByIdAsync(id);

                if (!isDeleted)
                    return NotFound(new { message = "Internal error in deleting payment method!" });

                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("paymentlayawayschedule")]
        public async Task<IActionResult> PaymentLayAwaySchedule(PaymentDetails details)
        {
            try
            {

                var layaway = await _orderService.GetLayAwayScheduleByIdAsync(details.LayAwayId);
                var order = await _orderService.GetOrderByIdAsync(details.OrderId);
                var paymentDetails = await _paymentService.CreatePaymentDetailsAsync(details);
                var OrderCart = await _orderService.GetCartByOrderIdAsync(order.Id);
                var shipping = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                var hasPendingLayAway = false;
                order.ShippingDetails = shipping;

                // *Paypal Details* //
                if (details.PaypalPayment != null)
                {
                    details.PaypalPayment.paymentDetailsId = paymentDetails.Id;
                    await _paymentService.CreatePaypalPaymentAsync(details.PaypalPayment);
                }


                if (!details.IsTotal)
                {
                    var result = await _orderService.UpdateLayawayScheduleByIdAsync(details.LayAwayId);

                    if (!result)
                    {
                        return BadRequest();
                    }
                    // *Post Payment* //
                    var orderPayment = new OrderPayment();
                    orderPayment.Amount = details.AmountPaid;
                    orderPayment.OrderId = details.OrderId;
                    orderPayment.PaymentDetailsId = paymentDetails.Id;
                    await _paymentService.CreateOrderPaymentAsync(orderPayment);
                }
                else
                {
                    var orderLayaway = await _orderService.GetLayAwayScheduleAsync(order.Id, details.ProductId);
                    var remaining = orderLayaway.Where(x => !x.IsCleared && !x.IsNonRefundDeposit);

                    foreach (var item in remaining)
                    {
                        var result = await _orderService.UpdateLayawayScheduleByIdAsync(item.Id);

                        // *Post Payment* //
                        var orderPayment = new OrderPayment();
                        orderPayment.Amount = details.AmountPaid;
                        orderPayment.OrderId = details.OrderId;
                        orderPayment.PaymentDetailsId = paymentDetails.Id;
                        await _paymentService.CreateOrderPaymentAsync(orderPayment);
                    }
                }

                // *Check Paid* //
                foreach (var cart in OrderCart)
                {
                    if (cart.isLayAway)
                    {
                        var orderLayaway = await _orderService.GetLayAwayScheduleAsync(order.Id, cart.ProductId);
                        hasPendingLayAway = orderLayaway.Where(x => !x.IsCleared).Count() > 0;
                        if (hasPendingLayAway)
                            break;
                    }
                }
                if (!hasPendingLayAway)
                {
                    order.PaymentStatusId = 3;
                    await _orderService.UpdateOrderDetailAsync(order);

                    var template = _appSettings.AdminNotificationTemplate;
                    var filePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Templates", template);
                    var adminLink = _appSettings.ByzmoWebLink + "/administration/orders/" + order.Id.ToString();
                    var Subject = string.Format("Payment Completed Order#{0}", order.Id.ToString());

                    var sbBody = new StringBuilder();
                    sbBody.Append(filePath.ReadAllText());
                    sbBody.Replace("{OrderNumber}", order.Id.ToString());
                    sbBody.Replace("{ClientOrderLink}", adminLink);
                    sbBody.Replace("{ImageLogo}", _appSettings.ImageLogo);
                    var EmailContent = sbBody.ToString();
                    
                    await _emailService.SendEmailAsync(_appSettings.AdminEmail, "Shopbyzmo", Subject, EmailContent);
                 
                }

                if (details.WithTransactionFee)
                {
                    await _paymentService.CreateLayawayTransactionFeeAsync(details.LayawayTransactionFee);
                }

                // *Loyalty Voucher* //


                // var loyaltyPayment = new LoyaltyPayment()
                // {
                //     Email = shipping.Email,
                //     OrderId = order.Id,
                //     UserId = shipping.UserId,
                //     PostDate = new DateTimeOffset(),
                //     Amount = shipping.AmountToPay
                // };
                // var filter = new Filter()
                // {
                //     Limit = 999,
                //     Offset = 0
                // };
                // var generateDiscount = new LoyaltyVoucher()
                // {
                //     UserId = shipping.UserId,
                //     Email = shipping.Email,
                //     IsActive = true
                // };

                // await _loyaltyService.CreateLoyaltyPaymentAsync(loyaltyPayment);
                // var userLoyalty = await _loyaltyService.GetLoyaltyPaymentByUserIdAndEmailAsync(shipping.UserId, shipping.Email);
                // var loyaltyDiscount = await _loyaltyService.GetLoyaltyDiscountListRangeAsync(filter);
                // var lastDiscount = loyaltyDiscount.Max(x => x.RangeFrom);
                // var activeLoyalty = await _loyaltyService.GetAllLoyaltyVoucherAsync(shipping.UserId, shipping.Email);
                // var total = userLoyalty.Sum(x => x.Amount);
                // var lastTier = loyaltyDiscount.Where(x => x.RangeFrom == lastDiscount).First();
                // var hasMeetLastTier = activeLoyalty.Where(x => x.LoyaltyDiscountId == lastTier.Id).Count() > 0;

                // if (!hasMeetLastTier)
                // {
                //     foreach (var discount in loyaltyDiscount)
                //     {
                //         if (details.AmountPaid > discount.RangeFrom && details.AmountPaid < discount.RangeTo || lastDiscount == discount.RangeFrom)
                //         {
                //             generateDiscount.LoyaltyDiscountId = discount.Id;
                //             break;
                //         }
                //     }
                //     if (generateDiscount.LoyaltyDiscountId > 0)
                //     {
                //         var isExist = activeLoyalty.Where(x => x.LoyaltyDiscountId == generateDiscount.LoyaltyDiscountId).Count() >= 1;
                //         if (!isExist)
                //         {
                //             var random = new RandomGenerator().RandomString(7);
                //             generateDiscount.DiscountCode = random;
                //             await _loyaltyService.CreateLoyaltyVoucherAsync(generateDiscount);
                //         }
                //     }

                // }

                return Ok(paymentDetails);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("completepayment")]
        public async Task<IActionResult> CompletePayment([FromBody] PaymentDetails details)
        {
            try
            {
                var paymentDetails = await _paymentService.CreatePaymentDetailsAsync(details);

                var order = await _orderService.GetOrderByIdAsync(details.OrderId);
                var shipping = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                var orderCart = await _orderService.GetCartByOrderIdAsync(order.Id);
                var hasLayAway = orderCart.Where(x => x.isLayAway).Count() > 0;
                var hasPreOrder = false;


                foreach (var cart in orderCart)
                {
                    var product = await _iProductService.GetProductByIdAsync(cart.ProductId);
                    hasPreOrder = product.PreOrder ? product.PreOrder : (cart.PreOrderLayaway && !cart.isLayAway);

                    if (hasPreOrder)
                        break;
                }


                // *Post Payment* //
                var orderPayment = new OrderPayment();
                orderPayment.Amount = details.AmountPaid;
                orderPayment.OrderId = details.OrderId;
                orderPayment.PaymentDetailsId = paymentDetails.Id;
                await _paymentService.CreateOrderPaymentAsync(orderPayment);

                // *Paypal Details* //
                if (details.PaypalPayment != null)
                {
                    details.PaypalPayment.paymentDetailsId = paymentDetails.Id;
                    await _paymentService.CreatePaypalPaymentAsync(details.PaypalPayment);
                }


                // *Payment Status* //
                order.ShippingDetails = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                order.PaymentStatusId = hasLayAway ? 2 : hasPreOrder ? 2 : 3;
                order.PaymentMethodDescription = details.PaymentMethod;
                await _orderService.UpdateOrderDetailAsync(order);


                // *Pre Order Sched* //
                if (hasPreOrder)
                {
                    var product = await _orderService.UpdatePreOrderDPByOrderAsync(order.Id);
                }

                // *LayAway Sched* //
                if (hasLayAway)
                {
                    foreach (var cart in orderCart)
                    {
                        if (cart.isLayAway)
                        {
                            var sched = await _orderService.GetLayAwayScheduleAsync(order.Id, cart.ProductId);
                            var refundId = sched.Where(x => x.IsNonRefundDeposit).First().Id;
                            await _orderService.UpdateLayawayScheduleByIdAsync(refundId);
                        }
                    }
                }
                // // *Loyalty Voucher* //
                // var loyaltyPayment = new LoyaltyPayment()
                // {
                //     Email = shipping.Email,
                //     OrderId = order.Id,
                //     UserId = shipping.UserId,
                //     PostDate = new DateTimeOffset(),
                //     Amount = details.AmountPaid
                // };

                // var filter = new Filter()
                // {
                //     Limit = 999,
                //     Offset = 0
                // };

                // var generateDiscount = new LoyaltyVoucher()
                // {
                //     UserId = shipping.UserId,
                //     Email = shipping.Email,
                //     IsActive = true
                // };


                // await _loyaltyService.CreateLoyaltyPaymentAsync(loyaltyPayment);
                // var userLoyalty = await _loyaltyService.GetLoyaltyPaymentByUserIdAndEmailAsync(shipping.UserId, shipping.Email);
                // var loyaltyDiscount = await _loyaltyService.GetLoyaltyDiscountListRangeAsync(filter);
                // var activeLoyalty = await _loyaltyService.GetAllLoyaltyVoucherAsync(shipping.UserId, shipping.Email);
                // var lastDiscount = loyaltyDiscount.Max(x => x.RangeFrom);
                // var total = userLoyalty.Sum(x => x.Amount);
                // var lastTier = loyaltyDiscount.Where(x => x.RangeFrom == lastDiscount).First();
                // var hasMeetLastTier = activeLoyalty.Where(x => x.LoyaltyDiscountId == lastTier.Id).Count() > 0;

                // if (!hasMeetLastTier)
                // {
                //     foreach (var discount in loyaltyDiscount)
                //     {
                //         if (total > discount.RangeFrom && total < discount.RangeTo || lastDiscount == discount.RangeFrom)
                //         {
                //             generateDiscount.LoyaltyDiscountId = discount.Id;
                //             break;
                //         }
                //     }

                //     if (generateDiscount.LoyaltyDiscountId > 0)
                //     {
                //         var isExist = activeLoyalty.Where(x => x.LoyaltyDiscountId == generateDiscount.LoyaltyDiscountId).Count() >= 1;
                //         if (!isExist)
                //         {
                //             var random = new RandomGenerator().RandomString(7);
                //             generateDiscount.DiscountCode = random;
                //             await _loyaltyService.CreateLoyaltyVoucherAsync(generateDiscount);
                //         }
                //     }
                // }


                return Ok(paymentDetails);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("updatepaymentlayawayschedule")]
        public async Task<IActionResult> UpdatePaymentLayAwaySchedule(LayAwaySchedule sched)
        {
            try
            {
                var layaway = await _orderService.UpdateLayawayScheduleAsync(sched);

                return Ok(layaway);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("updatepaymentpreorderschedule")]
        public async Task<IActionResult> UpdatePaymentPreOrderSchedule(PreOrderSchedule sched)
        {
            try
            {
                var preOrder = await _orderService.UpdatePreOrderScheduleAsync(sched);

                return Ok(preOrder);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("paymentpreorderschedule")]
        public async Task<IActionResult> PaymentPreOrderSchedule(PaymentDetails details)
        {
            try
            {

                var order = await _orderService.GetOrderByIdAsync(details.OrderId);
                var paymentDetails = await _paymentService.CreatePaymentDetailsAsync(details);
                var OrderCart = await _orderService.GetCartByOrderIdAsync(order.Id);
                var shipping = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                var hasPendingPayment = false;
                order.ShippingDetails = shipping;

                // *Paypal Details* //
                if (details.PaypalPayment != null)
                {
                    details.PaypalPayment.paymentDetailsId = paymentDetails.Id;
                    await _paymentService.CreatePaypalPaymentAsync(details.PaypalPayment);
                }

                if (!details.IsTotal)
                {
                    var preOrderDetails = await _orderService.GetPreOrderScheduleByIdAsync(details.PreOrderId);
                    // *Paid Tag* //
                    preOrderDetails.IsCleared = true;
                    var result = await _orderService.UpdatePreOrderScheduleAsync(preOrderDetails);

                    // *Post Payment* //
                    var orderPayment = new OrderPayment();
                    orderPayment.Amount = details.AmountPaid;
                    orderPayment.OrderId = details.OrderId;
                    orderPayment.PaymentDetailsId = paymentDetails.Id;
                    await _paymentService.CreateOrderPaymentAsync(orderPayment);

                }
                else
                {
                    var preOrder = await _orderService.GetPreOrderScheduleAsync(order.Id, details.ProductId);
                    var remaining = preOrder.Where(x => !x.IsCleared && x.PaymentTerm != "DP");
                    foreach (var item in remaining)
                    {
                        // *Paid Tag* //
                        item.IsCleared = true;
                        var result = await _orderService.UpdatePreOrderScheduleAsync(item);

                        // *Post Payment* //
                        var orderPayment = new OrderPayment();
                        orderPayment.Amount = item.Amount;
                        orderPayment.OrderId = details.OrderId;
                        orderPayment.PaymentDetailsId = paymentDetails.Id;
                        await _paymentService.CreateOrderPaymentAsync(orderPayment);
                    }
                }


                // *Check Paid* //
                foreach (var cart in OrderCart)
                {
                    if (cart.PreOrder)
                    {
                        var preOrder = await _orderService.GetPreOrderScheduleAsync(order.Id, cart.ProductId);
                        hasPendingPayment = preOrder.Where(x => !x.IsCleared).Count() > 0;
                        if (hasPendingPayment)
                            break;
                    }
                }
                if (!hasPendingPayment)
                {
                    order.PaymentStatusId = 3;
                    await _orderService.UpdateOrderDetailAsync(order);
                }

                if (details.WithTransactionFee)
                {
                    if (details.PreOrderTransactionFee != null)
                    {
                        await _paymentService.CreatePreOrderLayawayTransactionFeeAsync(details.PreOrderTransactionFee);
                    }
                    if (details.LayawayTransactionFee != null)
                    {
                        await _paymentService.CreateLayawayTransactionFeeAsync(details.LayawayTransactionFee);
                    }
                }

                // // *Loyalty Voucher* //
                // var loyaltyPayment = new LoyaltyPayment()
                // {
                //     Email = shipping.Email,
                //     OrderId = order.Id,
                //     UserId = shipping.UserId,
                //     PostDate = new DateTimeOffset(),
                //     Amount = details.AmountPaid
                // };
                // var filter = new Filter()
                // {
                //     Limit = 999,
                //     Offset = 0
                // };
                // var generateDiscount = new LoyaltyVoucher()
                // {
                //     UserId = shipping.UserId,
                //     Email = shipping.Email,
                //     IsActive = true
                // };

                // await _loyaltyService.CreateLoyaltyPaymentAsync(loyaltyPayment);
                // var loyaltyDiscount = await _loyaltyService.GetLoyaltyDiscountListRangeAsync(filter);
                // var activeLoyalty = await _loyaltyService.GetAllLoyaltyVoucherAsync(shipping.UserId, shipping.Email);
                // var lastDiscount = loyaltyDiscount.Max(x => x.RangeFrom);
                // var lastTier = loyaltyDiscount.Where(x => x.RangeFrom == lastDiscount).First();
                // var hasMeetLastTier = activeLoyalty.Where(x => x.LoyaltyDiscountId == lastTier.Id).Count() > 0;

                // if (!hasMeetLastTier)
                // {
                //     foreach (var discount in loyaltyDiscount)
                //     {
                //         if (details.AmountPaid > discount.RangeFrom && details.AmountPaid < discount.RangeTo || lastDiscount == discount.RangeFrom)
                //         {
                //             generateDiscount.LoyaltyDiscountId = discount.Id;
                //             break;
                //         }
                //     }

                //     if (generateDiscount.LoyaltyDiscountId > 0)
                //     {
                //         var isExist = activeLoyalty.Where(x => x.LoyaltyDiscountId == generateDiscount.LoyaltyDiscountId).Count() >= 1;
                //         if (!isExist)
                //         {
                //             var random = new RandomGenerator().RandomString(7);
                //             generateDiscount.DiscountCode = random;
                //             await _loyaltyService.CreateLoyaltyVoucherAsync(generateDiscount);
                //         }
                //     }
                // }



                return Ok(paymentDetails);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("getpaymenttotal")]
        public async Task<IActionResult> GetPaymentTotal(PaymentTotal paymentTotal)
        {
            try
            {
                var order = await _orderService.GetOrderBySecurityIdAsync(paymentTotal.SecurityId);
                var product = await _iProductService.GetProductByIdAsync(paymentTotal.ProductId);
                paymentTotal.OrderId = order.Id;
                paymentTotal.ProductName = product.ProductName;

                if (paymentTotal.ProductType == 1)
                {

                    var loyalty = await _orderService.GetLayAwayScheduleAsync(paymentTotal.OrderId, paymentTotal.ProductId);
                    paymentTotal.Amount = loyalty.Where(x => !x.IsCleared && !x.IsNonRefundDeposit).Sum(x => x.Monthly);
                }
                if (paymentTotal.ProductType == 2)
                {
                    var preOrders = await _orderService.GetPreOrderScheduleAsync(paymentTotal.OrderId, paymentTotal.ProductId);

                    paymentTotal.Amount = preOrders.Where(x => !x.IsCleared && x.PaymentTerm != "DP").Sum(x => x.Amount);
                }
                var shipping = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                paymentTotal.PaymentMethod = await _paymentService.GetPaymentMethodByIdAsync(shipping.PaymentMethod);
                if (paymentTotal.PaymentMethod.WithTransactionFee)
                {
                    paymentTotal.PaymentMethod.TransactionFee = await _paymentService.GetTransactionFeesBPaymentMethodIdAsync(paymentTotal.PaymentMethod.Id);
                }

                return Ok(paymentTotal);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("gettransactionfeesbypaymentmethodid/{paymentmethodid}")]
        public async Task<IActionResult> UpdateTransactionFees(int paymentmethodid)
        {
            try
            {
                var result = await _paymentService.GetTransactionFeesBPaymentMethodIdAsync(paymentmethodid);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("createtransactionfees")]
        public async Task<IActionResult> CreateTransactionFees([FromBody] TransactionFees transactionFees)
        {
            try
            {
                var result = await _paymentService.CreateTransactionFeesAsync(transactionFees);
                var resultTransactionFees = await _paymentService.GetTransactionFeesBPaymentMethodIdAsync(transactionFees.PaymentMethodId);
                return Ok(resultTransactionFees);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("createtransactionfeesbulk")]
        public async Task<IActionResult> CreateTransactionFeesBulk([FromBody] IEnumerable<TransactionFees> transactionFees)
        {
            try
            {
                if (transactionFees.Count() > 0)
                {
                    foreach (var item in transactionFees)
                    {
                        var result = await _paymentService.CreateTransactionFeesAsync(item);
                    }

                }
                return Ok(transactionFees);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPatch("updatetransactionfees")]
        public async Task<IActionResult> UpdateTransactionFees([FromBody] TransactionFees transactionFees)
        {
            try
            {
                var result = await _paymentService.UpdateTransactionFeesAsync(transactionFees);
                var resultTransactionFees = await _paymentService.GetTransactionFeesBPaymentMethodIdAsync(transactionFees.PaymentMethodId);
                return Ok(resultTransactionFees);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("deletetransactionfees")]
        public async Task<IActionResult> DeleteTransactionFees([FromBody] TransactionFees transactionFees)
        {
            try
            {
                var result = await _paymentService.DeleteTransactionFeesAsync(transactionFees.Id);
                var resultTransactionFees = await _paymentService.GetTransactionFeesBPaymentMethodIdAsync(transactionFees.PaymentMethodId);
                return Ok(resultTransactionFees);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("creategcashpayment")]
        public async Task<IActionResult> CreateGCashPayment([FromBody] GCashPayment gcashPayment)
        {
            try
            {
                var result = await _paymentService.CreateGCashPaymentAsync(gcashPayment);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("updatestatussource")]
        public async Task<IActionResult> UpdateStatusSource([FromBody] GCashPayment gcashPayment)
        {
            try
            {
                var result = new GCashPayment();

                await _paymentService.UpdateStatusSourcetAsync(gcashPayment.SourceId, gcashPayment.Status);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }
}