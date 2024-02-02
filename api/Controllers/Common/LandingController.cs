
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.DataAccess.Common;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using System.Text;

namespace ByzmoApi.Controllers.Common
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LandingController : ControllerBase
    {
        private readonly ILandingService _landingService;

        public LandingController(ILandingService landingService)
        {
            _landingService = landingService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetLandingImages()
        {
            try
            {
                var landings = await _landingService.GetLandingImagesAsync();
                return Ok(landings);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("moveorderid")]
        public async Task<IActionResult> MoveOrderId([FromBody] FileMapper landings)
        {
            try
            {
                var isMoved = await _landingService.MoveOrderIdAsync(landings.Id, landings.OrderId, landings.MoveTypeId);

                if (!isMoved)
                    return NotFound(new { message = "Internal error in moving order id!" });

                return Ok(isMoved);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [HttpPost("createlanding")]
        public async Task<IActionResult> CreateLanding([FromBody] FileMapper landing)
        {
            try
            {
                if (landing == null) return BadRequest();
                var landingData = await _landingService.CreateLandingImageAsync(landing);

                return Ok(landing);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpGet("getlandingimagebyid/{id}")]
        public async Task<IActionResult> GetLandingImageById(int id)
        {
            try
            {
                var landing = await _landingService.GetLandingImageByIdAsync(id);
                return Ok(landing);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPatch("updatelanding")]
        public async Task<IActionResult> UpdateLanding([FromBody] FileMapper landing)
        {
            try
            {
                if (landing == null) return BadRequest();
                var landingData = await _landingService.UpdateLandingImageAsync(landing);
                return Ok(landing);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPost("deletelandingimagebyid")]
        public async Task<IActionResult> DeleteLandingImageById([FromBody] int id)
        {
            try
            {
                var isDeleted = await _landingService.DeleteLandingImageByIdAsync(id);

                if (!isDeleted)
                    return NotFound(new { message = "Internal error in deleting landing image!" });

                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

    }
}