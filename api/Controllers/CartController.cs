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
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly IProductService _productService;

        public CartController(ICartService cartService, IProductService productService)
        {
            _cartService = cartService;
            _productService = productService;
        }
        [AllowAnonymous]
        [HttpPost("createcart")]
        public async Task<IActionResult> CreateCart([FromBody] Cart cart)
        {
            try
            {
                if (cart == null) return BadRequest();
                cart.IsActive = true;
                var cartData = await _cartService.CreateCartAsync(cart);
                cartData.Product = await _productService.GetProductByIdAsync(cart.Product.Id);
                cartData.Product.ProductImages = await _productService.GetProductImagesByIdAsync(cart.Product.Id);
                return Ok(cartData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [AllowAnonymous]
        [HttpGet("getcartbyuseridandip/{userIp}")]
        public async Task<IActionResult> GetCartByUserId(string userIp)
        {
            try
            {
                string[] userInfo = userIp.Split("-");
                int userId = int.Parse(userInfo[0]);

                var carts = await _cartService.GetCartByUserIdAndIpAsync(userId, userInfo[1]);
                foreach (var crt in carts)
                {
                    crt.Product = await _productService.GetProductByIdAsync(crt.ProductId);
                    crt.Product.ProductImages = await _productService.GetProductImagesByIdAsync(crt.ProductId);
                }
                return Ok(carts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [AllowAnonymous]
        [HttpPatch("updatecart")]
        public async Task<IActionResult> UpdateCart([FromBody] Cart cart)
        {
            try
            {
                if (cart == null) return BadRequest();
                var cartData = await _cartService.UpdateCartAsync(cart);
                cartData.Product = await _productService.GetProductByIdAsync(cart.Product.Id);
                cartData.Product.ProductImages = await _productService.GetProductImagesByIdAsync(cart.Product.Id);
                // Returning user that has been created 
                return Ok(cartData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpPost("deletecartbyid")]
        public async Task<IActionResult> DeleteCartById([FromBody] int id)
        {
            try
            {
                var isDeleted = await _cartService.DeleteCartByIdAsync(id);

                if (!isDeleted)
                    return NotFound(new { message = "Internal error in deleting cart!" });

                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [AllowAnonymous]
        [HttpDelete("deleteitemincartbyemail/{email}")]
        public async Task<IActionResult> DeleteItemInCartByEmail(string email)
        {
            try
            {
                var isDeleted = await _cartService.DeleteItemInCartByEmailAsync(email);
                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpPost("validatecartbyuserid")]
        public async Task<IActionResult> ValidateCartByUserId([FromBody] int id)
        {
            try
            {
                var isValid = await _cartService.ValidateCartByUserIdAsync(id);

                // if (!isDeleted)
                //     return NotFound(new { message = "Internal error in deleting cart!" });

                return Ok(isValid);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [AllowAnonymous]
        [HttpPatch("updatecartuser")]
        public async Task<IActionResult> UpdateCartUser([FromBody] User user)
        {
            try
            {
                if (user == null) return BadRequest();
                var isUpdated = await _cartService.UpdateCartUserAsync(user.Id, user.IpAddress);
                // Returning user that has been created 
                return Ok(isUpdated);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpPost("validateproduct")]
        public async Task<IActionResult> ValidateProduct([FromBody] int id)
        {
            try
            {
                var isValid = await _cartService.ValidateProductAsync(id);

                // if (!isDeleted)
                //     return NotFound(new { message = "Internal error in deleting cart!" });

                return Ok(isValid);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

    }
}