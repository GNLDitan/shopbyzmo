using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ByzmoApi.Models;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.DataAccess.Applcation;
using ByzmoApi.Helpers;


namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LoyaltyController : Controller
    {

        private readonly ILoyaltyService _loyaltyDiscountService;
        private readonly IOrderService _orderService;
        private readonly IProductService _productService;

        public LoyaltyController(ILoyaltyService loyaltyDiscountService,
         IOrderService orderService,
         IProductService productService)
        {
            this._loyaltyDiscountService = loyaltyDiscountService;
            this._orderService = orderService;
            this._productService = productService;
        }


        [AllowAnonymous]
        [HttpPost("getloyaltydiscountlistrange")]
        public async Task<IActionResult> GetLoyaltyDiscountListRangeAsync([FromBody] Filter filter)
        {
            try
            {
                var loyaltyDiscount = await _loyaltyDiscountService.GetLoyaltyDiscountListRangeAsync(filter);
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpGet("getloyaltydiscountbyid/{id}")]
        public async Task<IActionResult> GetLoyaltyDiscountById(int id)
        {
            try
            {
                var loyaltyDiscount = await _loyaltyDiscountService.GetLoyaltyDiscountByIdAsync(id);
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("createloyaltydiscount")]
        public async Task<IActionResult> CreateLoyaltyDiscount([FromBody] LoyaltyDiscount discount)
        {
            try
            {
                var loyaltyDiscount = await _loyaltyDiscountService.CreateLoyaltyDiscountAsync(discount);
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPatch("updateloyaltydiscount")]
        public async Task<IActionResult> UpdateLoyaltyDiscount([FromBody] LoyaltyDiscount discount)
        {
            try
            {
                var loyaltyDiscount = await _loyaltyDiscountService.UpdateLoyaltyDiscountAsync(discount);
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpDelete("deleteloyaltydiscount/{id}")]
        public async Task<IActionResult> DeleteLoyaltyDiscount(int id)
        {
            try
            {
                var loyaltyDiscount = await _loyaltyDiscountService.DeleteLoyaltyDiscountAsync(id);
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("getloyalvoucherbyuser")]
        public async Task<IActionResult> GenerateLoyaltyVoucher(User user)
        {
            try
            {
                var voucher = await _loyaltyDiscountService.GetAllLoyaltyVoucherAsync(user.Id, user.Email);

                foreach (var vr in voucher)
                {
                    if (vr.LoyaltyDiscountId > 0)
                        vr.LoyaltyDiscount = _loyaltyDiscountService.GetLoyaltyDiscountById(vr.LoyaltyDiscountId);
                }

                return Ok(voucher);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("claimvoucher")]
        public async Task<IActionResult> ClaimVoucher(LoyaltyVoucher voucher)
        {
            try
            {
                var result = await _loyaltyDiscountService.ClaimVoucherAsync(voucher);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("getactiveloyaltyvoucher")]
        public async Task<IActionResult> GetActiveLoyaltyVoucher(LoyaltyVoucher voucher)
        {
            try
            {
                var filter = new Filter()
                {
                    Limit = 999,
                    Offset = 0
                };

                var qualified = new LoyaltyQualified();
                var userLoyalty = await _loyaltyDiscountService.GetLoyaltyPaymentByUserIdAndEmailAsync(voucher.UserId, voucher.Email);
                var loyaltyDiscount = await _loyaltyDiscountService.GetLoyaltyDiscountListRangeAsync(filter);
                var amount = userLoyalty.Sum(x => x.Amount);
                var lastDiscount = loyaltyDiscount.Max(x => x.RangeFrom);
                var lastTier = loyaltyDiscount.Where(x => x.RangeFrom == lastDiscount).First();

                qualified.AccumulatedPurchaseAmount = amount;

                if (amount < lastDiscount)
                {
                    foreach (var discount in loyaltyDiscount)
                    {
                        if (amount > discount.RangeFrom && amount < discount.RangeTo)
                        {
                            qualified.QualifiedDiscount = discount.TierLevel;
                            qualified.QualifiedDiscountId = discount.Id;
                            break;
                        }
                    }
                }
                else
                {
                    qualified.QualifiedDiscount = lastTier.TierLevel;
                    qualified.QualifiedDiscountId = lastTier.Id;
                }


                return Ok(qualified);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }




        [HttpPost("generateloyaltydiscount")]
        public async Task<IActionResult> PaymentPreOrderSchedule(Order order)
        {
            try
            {

                var filter = new Filter()
                {
                    Limit = 999,
                    Offset = 0
                };
                var orderCart = await _orderService.GetCartByOrderIdAsync(order.Id);
                var activeLoyalty = await _loyaltyDiscountService.GetAllLoyaltyVoucherAsync(order.ShippingDetails.UserId, order.ShippingDetails.Email);
                var loyaltyDiscount = await _loyaltyDiscountService.GetLoyaltyDiscountListRangeAsync(filter);
                var loyaltyPaymentAll = await _loyaltyDiscountService.GetLoyaltyPaymentByUserIdAndEmailAsync(order.ShippingDetails.UserId, order.ShippingDetails.Email);
                var isAlreadyPosted = loyaltyPaymentAll.Where(x => x.OrderId == order.Id
                                                                && x.Email == order.ShippingDetails.Email).Count() > 0;
                var hasPreOrder = orderCart.Where(x => x.PreOrder).Count() > 0;

                var totalAmount = 0m;
                var salesAmount = 0m;
                if (!isAlreadyPosted)
                {
                    if (hasPreOrder)
                    {
                        foreach (var cart in orderCart)
                        {
                            var product = await _productService.GetProductByIdAsync(cart.ProductId);
                            totalAmount += product.Price * cart.Quantity;
                        }
                        totalAmount -= order.ShippingDetails.DiscountAmount;
                        totalAmount += order.ShippingDetails.ShippingAmount;
                    }
                    else totalAmount = order.ShippingDetails.Total;

                    //minus sales amount
                    if (!hasPreOrder)
                    {
                        foreach (var cart in orderCart)
                        {
                            if (cart.OnSale)
                            {
                                salesAmount += cart.SalesPrice * cart.Quantity;
                            }

                        }
                        totalAmount = totalAmount - salesAmount;
                    }

                    // *Loyalty Voucher* //
                    var loyaltyPayment = new LoyaltyPayment()
                    {
                        Email = order.ShippingDetails.Email,
                        OrderId = order.Id,
                        UserId = order.ShippingDetails.UserId,
                        PostDate = new DateTimeOffset(),
                        Amount = totalAmount
                    };
                    await _loyaltyDiscountService.CreateLoyaltyPaymentAsync(loyaltyPayment);

                    loyaltyPaymentAll = await _loyaltyDiscountService.GetLoyaltyPaymentByUserIdAndEmailAsync(order.ShippingDetails.UserId, order.ShippingDetails.Email);
                    var totalPayment = loyaltyPaymentAll.Sum(x => x.Amount);
                    var activeVoucher = activeLoyalty.Where(x => !x.IsClaimed);

                    foreach (var discount in loyaltyDiscount)
                    {

                        if (totalPayment > discount.RangeFrom && (totalPayment < discount.RangeTo || discount.RangeTo == 0))
                        {
                            var hasExist = activeLoyalty.Where(x => x.LoyaltyDiscountId == discount.Id).Count() > 0;

                            if (!hasExist)
                            {
                                /* Claim All Active */
                                foreach (var voucher in activeVoucher)
                                {
                                    await _loyaltyDiscountService.ClaimVoucherAsync(voucher);
                                }

                                var random = new RandomGenerator().RandomString(7);
                                var generateDiscount = new LoyaltyVoucher()
                                {
                                    UserId = order.ShippingDetails.UserId,
                                    Email = order.ShippingDetails.Email,
                                    IsActive = true,
                                    LoyaltyDiscountId = discount.Id,
                                    DiscountCode = random
                                };
                                await _loyaltyDiscountService.CreateLoyaltyVoucherAsync(generateDiscount);
                            }

                        }
                    }
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


    }
}
