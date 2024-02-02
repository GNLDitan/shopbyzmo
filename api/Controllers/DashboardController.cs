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
    public class DashboardController : Controller
    {

        IDashboardService _iDashboardService;

        public DashboardController(IDashboardService iDashboardService)
        {
           this._iDashboardService = iDashboardService;
        }

    
        [HttpGet("getoutofstock")]
        public async Task<IActionResult> GetOutOfStock()
        {
            try
            {
                var loyaltyDiscount = await _iDashboardService.GetOutOfStockAsync();
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpGet("getdelayedpayment")]
        public async Task<IActionResult> GetDelayedPayment()
        {
            try
            {
                var loyaltyDiscount = await _iDashboardService.GetDelayedPaymentAsync();
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


         [HttpGet("getmonthneworder")]
        public async Task<IActionResult> GetMonthNewOrder()
        {
            try
            {
                var loyaltyDiscount = await _iDashboardService.GetMonthNewOrderAsync();
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

         [HttpGet("getusersubscription")]
        public async Task<IActionResult> GetUserSubscription()
        {
            try
            {
                var loyaltyDiscount = await _iDashboardService.GetUserSubscriptionAsync();
                return Ok(loyaltyDiscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpGet("getblognotification")]
        public async Task<IActionResult> GetBlogNotification()
        {
            try
            {
                var dashboard = await _iDashboardService.GetBlogNotificationAsync();
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("getmostorderedproduct")]
        public async Task<IActionResult> GetMostOrderedProduct()
        {
            try
            {
                var dashboard = await _iDashboardService.GetMostOrderedProductAsync();
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("getmostloyaltyuser")]
        public async Task<IActionResult> GetMostLoyaltyUser()
        {
            try
            {
                var dashboard = await _iDashboardService.GetMostLoyaltyUserAsync();
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }



        [HttpGet("getorderstatus")]
        public async Task<IActionResult> GetOrderStatus()
        {
            try
            {
                var firstDay = new DateTime(DateTime.Now.Year, 1, 1);
                var lastDay = new DateTime(DateTime.Now.Year, 12, 31);

                var filter = new Filter();
                filter.StartDate = firstDay;
                filter.EndDate = lastDay;

                var dashboard = await _iDashboardService.GetOrderStatusAsync(filter);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


       [HttpGet("getorderscount")]
        public async Task<IActionResult> GetOrderCount()
        {
            try
            {
                var firstDay = new DateTime(DateTime.Now.Year - 1, 1, 1);
                var lastDay = new DateTime(DateTime.Now.Year, 12, 31);

                var filter = new Filter();
                filter.StartDate = firstDay;
                filter.EndDate = lastDay;

                var dashboard = await _iDashboardService.GetOrderCountAsync(filter);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


    }
}
