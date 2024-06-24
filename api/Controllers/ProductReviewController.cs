using System;
using System.Threading.Tasks;
using ByzmoApi.DataAccess.Applcation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductReviewController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public ProductReviewController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("getprojectreviewbyid/{id}")]
        public async Task<IActionResult> GetProjectReviewById(int id)
        {
            try
            {
                if (id == 0) return BadRequest();

                var orderProductRates = await _orderService.GetOrderProductRatesByProductIdAsync(id);

                return Ok(orderProductRates);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
    }
}