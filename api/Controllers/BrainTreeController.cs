
using System;
using System.Threading.Tasks;
using Braintree;
using ByzmoApi.DataAccess.Applcation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BrainTreeController : ControllerBase
    {
        public IBrainTreeService _braintreeGateway;

        public BrainTreeController(IBrainTreeService braintreeGateway)
        {
            this._braintreeGateway = braintreeGateway;
        }


        [HttpGet("getclienttoken")]
        public async Task<IActionResult> GetClientToken()
        {
            try
            {
                var clientToken = await _braintreeGateway.GetClientTokenAsync();
                return Ok(clientToken);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("createpurchase")]
        public async Task<IActionResult> CreatePurchase([FromBody] NonceKey nonce)
        {

            var request = await _braintreeGateway.CreatePurchaseAsync(nonce);
            return Ok(request);
        }
    }

}