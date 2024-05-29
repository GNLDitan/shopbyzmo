using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.DataAccess.Applcation;
using System;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using ByzmoApi.DataAccess.Common;

namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IShippingService _shippingService;
        private readonly ICartService _cartService;
        private readonly IProductService _productService;
        private readonly ILoyaltyService _iLoyaltyService;
        private readonly IAppSettings _iAppSettings;
        private readonly IPaymentService _iPaymentMethod;
        private readonly IUserService _iUserService;
        
        public OrderController(IOrderService paymentService,
                                IShippingService shippingService,
                                ICartService cartService,
                                IProductService productService,
                                ILoyaltyService iLoyaltyService,
                                IAppSettings iAppSettings,
                                IPaymentService iPaymentMethod,
                                IUserService iUserService)
        {
            this._orderService = paymentService;
            this._shippingService = shippingService;
            this._cartService = cartService;
            this._productService = productService;
            this._iLoyaltyService = iLoyaltyService;
            this._iAppSettings = iAppSettings;
            this._iPaymentMethod = iPaymentMethod;
            this._iUserService = iUserService;
        }


        [AllowAnonymous]
        [HttpPost("getorderlistrange")]
        public async Task<IActionResult> GetOrderListRange([FromBody] Filter filter)
        {
            try
            {
                var orders = await _orderService.GetOrderListRangeAsync(filter);
                foreach (var ord in orders)
                {
                    // if (ord.ShippingId > 0)
                    // {
                    //     ord.ShippingDetails = await _shippingService.GetShippingDetailsByIdAsync(ord.ShippingId);

                    // }
                    ord.OrderCart = await _orderService.GetCartByOrderIdAsync(ord.Id);
                    foreach (var crt in ord.OrderCart)
                    {
                        if (crt.ProductId > 0)
                        {
                            crt.Product = await _productService.GetProductByIdAsync(crt.ProductId);
                            crt.Product.ProductImages = await _productService.GetProductImagesByIdAsync(crt.ProductId);
                        }
                    }

                }
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }


        }
        [AllowAnonymous]
        [HttpGet("getorderbyid/{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                var order = await _orderService.GetOrderByIdAsync(id);
                order.ShippingDetails = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                order.OrderCart = await _orderService.GetCartByOrderIdAsync(order.Id);
                order.OrderReason = new OrderReason();
                order.OrderAttachment = await _orderService.GetOrderAttachmentByOrderIdAsync(order.Id);
                order.OrderEmailStatus = await _orderService.GetOrderEmailStatusByOrderIdAsync(order.Id);
                order.OrderEmailHeader = await _orderService.GetOrderEmailHeaderAsync();
                foreach (var crt in order.OrderCart)
                {
                    crt.Product = await _productService.GetProductByIdAsync(crt.ProductId);

                    if (crt.ProductId > 0)
                    {
                        crt.Product.ProductImages = await _productService.GetProductImagesByIdAsync(crt.ProductId);
                    }

                    if (crt.isLayAway)
                    {
                        crt.LayAwaySchedule = await _orderService.GetLayAwayScheduleAsync(order.Id, crt.ProductId);
                    }
                    if (crt.PreOrder)
                    {
                        crt.PreOrderSchedule = await _orderService.GetPreOrderScheduleAsync(order.Id, crt.ProductId);

                    }
                    if (crt.PreOrderLayaway && !crt.isLayAway)
                    {
                        crt.PreOrderSchedule = await _orderService.GetPreOrderScheduleAsync(order.Id, crt.ProductId);
                    }
                }

                if (!String.IsNullOrEmpty(order.ShippingDetails.DiscountCode))
                {
                    var discount = await _productService.GetDiscountByCodeAsync(order.ShippingDetails.DiscountCode);
                    if (discount == null)
                    {
                        var loyalty = await _iLoyaltyService.GetLoyaltyVoucherByCodeAsync(order.ShippingDetails.DiscountCode);
                        var voucher = await _iLoyaltyService.GetLoyaltyDiscountByIdAsync(loyalty.LoyaltyDiscountId);
                        discount = new Discount()
                        {
                            Id = loyalty.Id,
                            Code = loyalty.DiscountCode,
                            Amount = voucher.Discount,
                            AmountTypeId = voucher.DiscountAmountType,
                            StartDate = DateTime.Now,
                            EndDate = DateTime.Now.AddDays(1),
                            IsActive = loyalty.IsActive
                        };
                    }
                    order.ShippingDetails.Discount = discount;
                }


                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpGet("getorderbyshippingid/{id}")]
        public async Task<IActionResult> GetOrderByShippingId(int id)
        {
            try
            {
                var shipping = await _orderService.GetOrderByShippingIdAsync(id);
                return Ok(shipping);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpPost("createorder")]
        public async Task<IActionResult> CreateOrder([FromBody] Order Order)
        {
            try
            {
                var secureId = new RandomGenerator().RandomString(_iAppSettings.Secret.Count());
                Order.SecurityId = secureId;
                var orderData = await _orderService.CreateOrderDetailAsync(Order);
                var cnt = 0;
                if (Order.OrderCart.Count() > 0)
                {
                    foreach (var cart in Order.OrderCart)
                    {
                        await _orderService.CreateOrderCartAsync(cart, orderData.Id);
                        await _cartService.DeleteCartByIdAsync(cart.Id);
                        if (cart.Product.PreOrder || (cart.PreOrderLayaway && !cart.isLayAway))
                        {
                            if (cnt == 0)
                            {
                                if (Order.ShippingDetails.ShippingAmount > 0)
                                {
                                    var sched = new PreOrderSchedule()
                                    {
                                        OrderId = orderData.Id,
                                        ProductId = cart.ProductId,
                                        Amount = Order.ShippingDetails.ShippingAmount,
                                        PaymentTerm = "SH",
                                        IsCleared = false
                                    };

                                    cart.PreOrderSchedule = cart.PreOrderSchedule.Append(sched).Select(x => x);
                                }
                                if (Order.ShippingDetails.InsuranceFee > 0)
                                {
                                    var sched = new PreOrderSchedule()
                                    {
                                        OrderId = orderData.Id,
                                        ProductId = cart.ProductId,
                                        Amount = Order.ShippingDetails.InsuranceFee,
                                        PaymentTerm = "IN",
                                        IsCleared = false
                                    };

                                    cart.PreOrderSchedule = cart.PreOrderSchedule.Append(sched).Select(x => x);
                                }

                            }
                            foreach (var sched in cart.PreOrderSchedule)
                            {
                                sched.OrderId = orderData.Id;
                                await _orderService.CreatePreOrderScheduleAsync(sched);
                            }

                            cnt++;
                        }

                        if (cart.isLayAway)
                        {
                            if (cnt == 0)
                            {
                                if (Order.ShippingDetails.ShippingAmount > 0)
                                {
                                    var layaway = new LayAwaySchedule()
                                    {
                                        Date = cart.LayAwaySchedule.Max(x => x.Date),
                                        ProductId = cart.ProductId,
                                        OrderId = orderData.Id,
                                        Monthly = Order.ShippingDetails.ShippingAmount,
                                        IsNonRefundDeposit = false,
                                        IsCleared = false,
                                        IsShipping = true,
                                        IsSendEmail = false,
                                        IsInsurance = false
                                    };

                                    cart.LayAwaySchedule = cart.LayAwaySchedule.Append(layaway).Select(x => x);
                                }

                                if (Order.ShippingDetails.InsuranceFee > 0)
                                {
                                    var layaway = new LayAwaySchedule()
                                    {
                                        Date = cart.LayAwaySchedule.Max(x => x.Date),
                                        ProductId = cart.ProductId,
                                        OrderId = orderData.Id,
                                        Monthly = Order.ShippingDetails.InsuranceFee ,
                                        IsNonRefundDeposit = false,
                                        IsCleared = false,
                                        IsShipping = false,
                                        IsSendEmail = false,
                                        IsInsurance = true
                                    };

                                    cart.LayAwaySchedule = cart.LayAwaySchedule.Append(layaway).Select(x => x);
                                }

                            }
                            foreach (var sched in cart.LayAwaySchedule)
                            {
                                sched.OrderId = orderData.Id;
                                await _orderService.CreateLayAwayScheduleAsync(sched);
                            }
                            cnt++;
                        }

                    }
                    if (!String.IsNullOrEmpty(Order.ShippingDetails.DiscountCode))
                    {
                        // var loyaltyVoucher = await _iLoyaltyService.GetLoyaltyVoucherByCodeAsync(Order.ShippingDetails.DiscountCode);
                        // if (loyaltyVoucher != null)
                        // {
                        //     if (loyaltyVoucher.Id > 0)
                        //     {
                        //         var vaucher = await _iLoyaltyService.ClaimVoucherAsync(new LoyaltyVoucher()
                        //         {
                        //             DiscountCode = Order.ShippingDetails.DiscountCode
                        //         });
                        //     }
                        // }

                        var discount = await _productService.GetDiscountByCodeAsync(Order.ShippingDetails.DiscountCode);
                        if (discount != null)
                        {
                            if (discount.IsOneTimeUse)
                            {
                                discount.IsActive = false;
                                await _productService.ClaimDiscountAsync(Order.ShippingDetails.DiscountCode);
                            }

                        }


                    }
                }
                orderData.OrderEmailHeader = await _orderService.GetOrderEmailHeaderAsync();

                if(Order.IsEmailSubscribe) 
                {
                     await _iUserService.CreateUserSubscriptionByEmailAsync(orderData.Email);
                }

                return Ok(orderData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPatch("updateorder")]
        public async Task<IActionResult> UpdateOrder([FromBody] Order Order)
        {
            try
            {
                if (Order.StatusId == 5)
                {
                    var cancelOrder = await _orderService.CreateReasonForCancellationAsync(Order.OrderReason);
                }
                var orders = await _orderService.UpdateOrderDetailAsync(Order);
                var isDeleted = await _orderService.DeleteOrderAttachmentByOrderIdAsync(orders.Id);
                foreach (var atc in Order.OrderAttachment)
                {
                    atc.OrderId = orders.Id;
                    atc.Key = atc.Id > 0 ? atc.FileStorageId : atc.Key;
                    await _orderService.CreateOrderAttachementAsync(atc);
                }

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("completeorder")]
        public async Task<IActionResult> CompleteOrder([FromBody] Order Order)
        {
            try
            {

                Order.StatusId = 2;
                var paymentMethods = await _orderService.UpdateOrderDetailAsync(Order);

                return Ok(paymentMethods);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("getordersbyuserid")]
        public async Task<IActionResult> GetOrdersByUserId([FromBody] Filter filter)
        {
            try
            {
                string[] userInfo = filter.SearchInput.Split("-");
                int userId = int.Parse(userInfo[0]);

                var orders = await _orderService.GetOrdersByUserIdAsync(userId, userInfo[1], filter);
                foreach (var ord in orders)
                {
                    ord.ShippingDetails = await _shippingService.GetShippingDetailsByIdAsync(ord.ShippingId);
                    ord.OrderCart = await _orderService.GetCartByOrderIdAsync(ord.Id);
                    foreach (var crt in ord.OrderCart)
                    {
                        if (crt.ProductId > 0)
                        {
                            crt.Product = await _productService.GetProductByIdAsync(crt.ProductId);
                            crt.Product.ProductImages = await _productService.GetProductImagesByIdAsync(crt.ProductId);
                        }
                    }
                }

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [HttpGet("getlayawayschedulebyid/{id}")]
        public async Task<IActionResult> GetLayAwayScheduleById(int id)
        {
            try
            {
                var result = await _orderService.GetLayAwayScheduleByIdAsync(id);
                var order = await _orderService.GetOrderByIdAsync(result.OrderId);
                var shipping = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                result.PaymentMethod = await _iPaymentMethod.GetPaymentMethodByIdAsync(shipping.PaymentMethod);
                if (result.PaymentMethod.WithTransactionFee)
                {
                    result.PaymentMethod.TransactionFee = await _iPaymentMethod.GetTransactionFeesBPaymentMethodIdAsync(result.PaymentMethod.Id);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpGet("getorderbysecurityid/{securityid}")]
        public async Task<IActionResult> GetOrderBySecurityId(string securityid)
        {
            try
            {
                var order = await _orderService.GetOrderBySecurityIdAsync(securityid);

                order.ShippingDetails = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                order.OrderCart = await _orderService.GetCartByOrderIdAsync(order.Id);
                order.OrderReason = new OrderReason();
                order.OrderAttachment = await _orderService.GetOrderAttachmentByOrderIdAsync(order.Id);
                foreach (var crt in order.OrderCart)
                {
                    crt.Product = await _productService.GetProductByIdAsync(crt.ProductId);

                    if (crt.ProductId > 0)
                    {
                        crt.Product.ProductImages = await _productService.GetProductImagesByIdAsync(crt.ProductId);
                    }

                    if (crt.isLayAway)
                    {
                        crt.LayAwaySchedule = await _orderService.GetLayAwayScheduleAsync(order.Id, crt.ProductId);
                    }
                    if (crt.PreOrder)
                    {
                        crt.PreOrderSchedule = await _orderService.GetPreOrderScheduleAsync(order.Id, crt.ProductId);
                    }
                    if (crt.PreOrderLayaway && !crt.isLayAway)
                    {
                        crt.PreOrderSchedule = await _orderService.GetPreOrderScheduleAsync(order.Id, crt.ProductId);
                    }
                }

                if (!String.IsNullOrEmpty(order.ShippingDetails.DiscountCode))
                {
                    var discount = await _productService.GetDiscountByCodeAsync(order.ShippingDetails.DiscountCode);
                    if (discount == null)
                    {
                        var loyalty = await _iLoyaltyService.GetLoyaltyVoucherByCodeAsync(order.ShippingDetails.DiscountCode);
                        var voucher = await _iLoyaltyService.GetLoyaltyDiscountByIdAsync(loyalty.LoyaltyDiscountId);
                        discount = new Discount()
                        {
                            Id = loyalty.Id,
                            Code = loyalty.DiscountCode,
                            Amount = voucher.Discount,
                            AmountTypeId = voucher.DiscountAmountType,
                            StartDate = DateTime.Now,
                            EndDate = DateTime.Now.AddDays(1),
                            IsActive = loyalty.IsActive
                        };
                    }
                    order.ShippingDetails.Discount = discount;
                }


                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [AllowAnonymous]
        [HttpGet("getorderbyclientid/{securityid}")]
        public async Task<IActionResult> GetProductReviewByclientid(string securityid)
        {
            try
            {
                var order = await _orderService.GetOrderBySecurityIdAsync(securityid);

                order.ShippingDetails = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                order.OrderCart = await _orderService.GetCartByOrderIdAsync(order.Id);
                order.OrderReason = new OrderReason();
                order.OrderAttachment = await _orderService.GetOrderAttachmentByOrderIdAsync(order.Id);
                foreach (var crt in order.OrderCart)
                {
                    crt.Product = await _productService.GetProductByIdAsync(crt.ProductId);

                    if (crt.ProductId > 0)
                    {
                        crt.Product.ProductImages = await _productService.GetProductImagesByIdAsync(crt.ProductId);
                    }

                    if (crt.isLayAway)
                    {
                        crt.LayAwaySchedule = await _orderService.GetLayAwayScheduleAsync(order.Id, crt.ProductId);
                    }
                    if (crt.PreOrder)
                    {
                        crt.PreOrderSchedule = await _orderService.GetPreOrderScheduleAsync(order.Id, crt.ProductId);
                    }
                    if (crt.PreOrderLayaway && !crt.isLayAway)
                    {
                        crt.PreOrderSchedule = await _orderService.GetPreOrderScheduleAsync(order.Id, crt.ProductId);
                    }
                }

                if (!String.IsNullOrEmpty(order.ShippingDetails.DiscountCode))
                {
                    var discount = await _productService.GetDiscountByCodeAsync(order.ShippingDetails.DiscountCode);
                    if (discount == null)
                    {
                        var loyalty = await _iLoyaltyService.GetLoyaltyVoucherByCodeAsync(order.ShippingDetails.DiscountCode);
                        var voucher = await _iLoyaltyService.GetLoyaltyDiscountByIdAsync(loyalty.LoyaltyDiscountId);
                        discount = new Discount()
                        {
                            Id = loyalty.Id,
                            Code = loyalty.DiscountCode,
                            Amount = voucher.Discount,
                            AmountTypeId = voucher.DiscountAmountType,
                            StartDate = DateTime.Now,
                            EndDate = DateTime.Now.AddDays(1),
                            IsActive = loyalty.IsActive
                        };
                    }
                    order.ShippingDetails.Discount = discount;
                }


                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        


        [HttpGet("getpreorderschedulebyid/{id}")]
        public async Task<IActionResult> GetPreOrderScheduleById(int id)
        {
            try
            {
                var result = await _orderService.GetPreOrderScheduleByIdAsync(id);
                var order = await _orderService.GetOrderByIdAsync(result.OrderId);
                var shipping = await _shippingService.GetShippingDetailsByIdAsync(order.ShippingId);
                result.PaymentMethod = await _iPaymentMethod.GetPaymentMethodByIdAsync(shipping.PaymentMethod);
                if (result.PaymentMethod.WithTransactionFee)
                {
                    result.PaymentMethod.TransactionFee = await _iPaymentMethod.GetTransactionFeesBPaymentMethodIdAsync(result.PaymentMethod.Id);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [HttpPost("createorderproductrate")]
        public async Task<IActionResult> AddOrderProductRate([FromBody] OrderProductRate productRate)
        {
            try
            {
                var result = await _orderService.CreateOrderProductReviewAsync(productRate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        
    }


}