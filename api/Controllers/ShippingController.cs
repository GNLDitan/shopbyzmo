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

namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ShippingController : ControllerBase
    {
        private readonly IShippingService _shippingService;

        public ShippingController(IShippingService shippingService)
        {
            _shippingService = shippingService;
        }

        [HttpPost("createshipping")]
        public async Task<IActionResult> CreateShipping([FromBody] Shipping shipping)
        {
            try
            {
                if (shipping == null) return BadRequest();
                shipping.IsActive = true;
                var shippingData = await _shippingService.CreateShippingAsync(shipping);

                return Ok(shippingData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpPost("getshippinglistrange")]
        public async Task<IActionResult> GetShippingListRange(Filter filter)
        {
            try
            {
                var shippings = await _shippingService.GetShippingListRangeAsync(filter);
                foreach (var ship in shippings)
                {
                    ship.ShippingSpecialItemCost = await _shippingService.GetShippingSpecialItemCostByShippingIdAsync(ship.Id);

                }
                return Ok(shippings);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [HttpPost("deleteshippingbyid")]
        public async Task<IActionResult> DeleteShippingById([FromBody] int id)
        {
            try
            {
                var isDeleted = await _shippingService.DeleteShippingByIdAsync(id);

                if (!isDeleted)
                    return NotFound(new { message = "Internal error in deleting shipping!" });

                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpGet("getshippingbyid/{id}")]
        public async Task<IActionResult> GetShippingById(int id)
        {
            try
            {
                var shipping = await _shippingService.GetShippingByIdAsync(id);
                shipping.ShippingSpecialItemCost = await _shippingService.GetShippingSpecialItemCostByShippingIdAsync(shipping.Id);
                return Ok(shipping);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPatch("updateshipping")]
        public async Task<IActionResult> UpdateShipping([FromBody] Shipping shipping)
        {
            try
            {
                if (shipping == null) return BadRequest();
                var shippingData = await _shippingService.UpdateShippingAsync(shipping);

                return Ok(shipping);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpPost("createshippingdetails")]
        public async Task<IActionResult> CreateShippingDetails([FromBody] ShippingDetails shippingDetails)
        {
            try
            {
                var result = await _shippingService.CreateShippingDetailsAsync(shippingDetails);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpPatch("updateshippingdetails")]
        public async Task<IActionResult> UpdateShippingDetails([FromBody] ShippingDetails shippingDetails)
        {
            try
            {
                var result = await _shippingService.UpdateShippingDetailsAsync(shippingDetails);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [AllowAnonymous]
        [HttpGet("getshippingdetailsbyid/{id}")]
        public async Task<IActionResult> GetShippingDetailsByid(int id)
        {
            try
            {
                var result = await _shippingService.GetShippingDetailsByIdAsync(id);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [AllowAnonymous]
        [HttpGet("getshippingspecialitemcost/{shippingid}")]
        public async Task<IActionResult> GetShippingSpecialItemCost(int shippingid)
        {
            try
            {
                var result = await _shippingService.GetShippingSpecialItemCostByShippingIdAsync(shippingid);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("createshippingspecialitemcost")]
        public async Task<IActionResult> CreateShippingSpecialItemCost(ShippingSpecialItemCost shippingSpecialItemCost)
        {
            try
            {
                var result = await _shippingService.CreateShippingSpecialItemCostAsync(shippingSpecialItemCost);
                var ShippingSpecialItemCost = await _shippingService.GetShippingSpecialItemCostByShippingIdAsync(result.ShippingId);
                return Ok(ShippingSpecialItemCost);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("createshippingspecialitemcostbulk")]
        public async Task<IActionResult> CreateShippingSpecialItemCostBulk(IEnumerable<ShippingSpecialItemCost> shippingSpecialItemCost)
        {
            try
            {
                var result = new ShippingSpecialItemCost();
                foreach (var item in shippingSpecialItemCost)
                {
                    result = await _shippingService.CreateShippingSpecialItemCostAsync(item);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPatch("updateshippingspecialitemcost")]
        public async Task<IActionResult> UpdateShippingSpecialItemCost([FromBody] ShippingSpecialItemCost shippingSpecialItemCost)
        {
            try
            {
                var result = await _shippingService.UpdateShippingSpecialItemCostAsync(shippingSpecialItemCost);
                var ShippingSpecialItemCost = await _shippingService.GetShippingSpecialItemCostByShippingIdAsync(result.ShippingId);
                return Ok(ShippingSpecialItemCost);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("deleteshippingspecialitemcost")]
        public async Task<IActionResult> DeleteShippingSpecialItemCost([FromBody] ShippingSpecialItemCost shippingSpecialItemCost)
        {
            try
            {
                var result = await _shippingService.DeleteShippingSpecialItemCostByIdAsync(shippingSpecialItemCost.Id);
                var ShippingSpecialItemCost = await _shippingService.GetShippingSpecialItemCostByShippingIdAsync(shippingSpecialItemCost.ShippingId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


    }
}