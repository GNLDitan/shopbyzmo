using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.DataAccess.Common;
using ByzmoApi.Models;
using ByzmoApi.DataAccess.Applcation;

namespace ByzmoApi.Controllers.Common
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IResetTokenService _resetTokenService;
        private readonly IProductService _productService;
        public UserController(IUserService userService, IResetTokenService resetTokenService,
            IProductService productService)
        {
            this._userService = userService;
            this._resetTokenService = resetTokenService;
            this._productService = productService;
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        public IActionResult Authenticate([FromBody] User user)
        {
            try
            {
                if (user == null) return BadRequest();

                var userData = !user.IsSocialMediaLogin ? _userService.Authenticate(user.Email, user.Password) : _userService.GetUserByEmail(user.Email);

                if (userData == null)
                {
                    return BadRequest(new { message = "Email or password is incorrect" });
                }

                string tokenString = _userService.CreateToken(user);

                // return basic user info and token to store in client side
                return Ok(new
                {
                    userData.Name,
                    userData.Email,
                    userData.IsAdmin,
                    userData.IsActive,
                    token = tokenString
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [AllowAnonymous]
        [HttpPost("checkemailvalidity")]
        public async Task<IActionResult> CheckEmailValidity([FromBody] User user)
        {
            try
            {
                if (user == null) return BadRequest();

                var validity = await _userService.CheckEmailValidityAsync(user);

                // return basic user info and token to store in client side
                return Ok(validity);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("createuser")]
        public IActionResult Create([FromBody] User newUser)
        {
            try
            {
                if (!newUser.IsSocialMediaLogin)
                {
                    // Validation before registering
                    if (newUser == null || string.IsNullOrWhiteSpace(newUser.Email) || string.IsNullOrWhiteSpace(newUser.Password))
                        return BadRequest(new { message = "Email or password required!" });

                    // Create passwordhash and passwordsalt of user
                    var userDataWithHash = _userService.CreatePasswordHash(newUser);
                    if (userDataWithHash == null)
                        return BadRequest(new { message = "Internal hashing error" });

                    // Insert user into database
                    userDataWithHash.IsActive = true;
                    newUser = _userService.CreateUser(userDataWithHash);
                }
                else
                {
                    // Validation before registering
                    if (newUser == null)
                        return BadRequest(new { message = "Email required!" });

                    newUser.IsActive = true;
                    newUser = _userService.CreateUser(newUser);
                }


                if (newUser == null)
                    return BadRequest(new { message = "Internal creation error" });

                // Returning user that has been created 
                return Ok(newUser);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPatch("updateuser")]
        public IActionResult Update([FromBody] User user)
        {
            try
            {
                if (!string.IsNullOrEmpty(user.Password))
                {
                    // Create passwordhash and passwordsalt of user
                    var userDataWithHash = _userService.CreatePasswordHash(user);
                    if (userDataWithHash == null)

                        return BadRequest(new { message = "Internal hashing error" });
                    user = _userService.UpdateUserPassword(userDataWithHash);
                    if (user == null)
                        return BadRequest(new { message = "Internal hashing error" });
                }

                // Validation before registering
                if (user == null || string.IsNullOrWhiteSpace(user.Email))
                    return BadRequest(new { message = "Invalid parameter!" });

                var userData = _userService.UpdateUser(user);

                if (userData == null)
                    return BadRequest(new { message = "Internal update error" });

                return Ok(userData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("getuserbyemail")]
        public IActionResult GetUserByEmail([FromBody] User user)
        {
            try
            {
                if (user.Email == "") return BadRequest("Invalid Parameter");

                var userData = _userService.GetUserByEmail(user.Email);
                userData.Addresses = _userService.GetUserAddressByUserId(userData.Id);

                return Ok(userData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPatch("updateuserpassword")]
        [AllowAnonymous]
        public IActionResult UpdateUserPassword([FromBody] User user)
        {
            try
            {
                // Validation before registering
                if (user == null || string.IsNullOrWhiteSpace(user.Email))
                    return BadRequest();

                // Get User Token
                var UserToken = _userService.GetUserToken(user.Email, user.ResetToken);

                // Validate token if valid
                if (!this._resetTokenService.IsTokenValid(UserToken))
                    return BadRequest(new { message = "Your request is invalid." });

                // Create passwordhash and passwordsalt of user
                var userDataWithHash = _userService.CreatePasswordHash(user);
                var userData = _userService.GetUserByEmail(user.Email);
                userData.PasswordHash = userDataWithHash.PasswordHash;
                userData.PasswordSalt = userDataWithHash.PasswordSalt;

                // Update user password into database
                var passwordResult = _userService.UpdateUserPassword(userData);

                // Update token claimed
                _userService.UpdateConfirmationToken(UserToken.Id);

                if (passwordResult == null)
                    return BadRequest(new { message = "User doesn't exist!" });

                // Returning user that has been created 
                return Ok(new
                {
                    passwordResult.Email,
                    passwordResult.Name,
                    user.Password
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("createuseraddress")]
        public IActionResult CreateUserAddress([FromBody] UserAddress userAddress)
        {
            try
            {
                if (userAddress == null || string.IsNullOrWhiteSpace(userAddress.Address) ||
                    string.IsNullOrWhiteSpace(userAddress.City) ||
                    string.IsNullOrWhiteSpace(userAddress.Province))
                    return BadRequest(new { message = "Invalid parameter" });

                var userData = _userService.GetUserById(userAddress.UserId);
                userData = _userService.CreateUserAddress(userAddress);

                userData.Addresses = _userService.GetUserAddressByUserId(userData.Id);

                return Ok(userData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("deleteuseraddress")]
        public IActionResult DeleteUserAddress([FromBody] UserAddress userAddress)
        {
            try
            {
                if (userAddress == null || string.IsNullOrWhiteSpace(userAddress.Address) ||
                    string.IsNullOrWhiteSpace(userAddress.City) ||
                    string.IsNullOrWhiteSpace(userAddress.Province))
                    return BadRequest(new { message = "Invalid parameter" });

                var userData = _userService.GetUserById(userAddress.UserId);
                userData = _userService.DeleteUserAddress(userAddress);

                userData.Addresses = _userService.GetUserAddressByUserId(userData.Id);

                return Ok(userData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPatch("updateuseraddress")]
        public IActionResult UpdateUserAddress([FromBody] UserAddress userAddress)
        {
            try
            {
                if (userAddress == null || string.IsNullOrWhiteSpace(userAddress.Address) ||
                string.IsNullOrWhiteSpace(userAddress.City) ||
                string.IsNullOrWhiteSpace(userAddress.Province))
                    return BadRequest(new { message = "Invalid parameter" });

                var userData = _userService.GetUserById(userAddress.UserId);
                userData = _userService.UpdateUserAddress(userAddress);

                userData.Addresses = _userService.GetUserAddressByUserId(userData.Id);

                return Ok(userData);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("getalluseradmin")]
        public IActionResult GetAllUserAdmin()
        {
            try
            {
                var userData = _userService.GetAllUserAdmin();

                return Ok(userData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("getuserbyid/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var userData = await _userService.GetUserByIdAsync(id);

                return Ok(userData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpDelete("deleteuserbyid/{id}")]
        public async Task<IActionResult> DeleteUserById(int id)
        {
            try
            {
                var userData = await _userService.DeleteUserByIdAsync(id);

                return Ok(userData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("loginguesttoken")]
        [AllowAnonymous]
        public IActionResult LoginGuestToken(int id)
        {
            try
            {
                User user = new User()
                {
                    Id = 0,
                    Email = "guest@admin.com"
                };
                string tokenString = _userService.CreateToken(user);

                return Ok(new
                {
                    token = tokenString
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("getuseraddressbyid/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> getUserAddressById(int id)
        {
            try
            {
                var addresses = await _userService.GetUserAddressByIdAsync(id);

                return Ok(addresses);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("getuseraddressbyuserid/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> getUserAddressByUserId(int id)
        {
            try
            {
                var addresses = await _userService.GetUserAddressByUserIdAsync(id);

                return Ok(addresses);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }



        [HttpGet("getuserwishlishbyemail/{email}")]
        public async Task<IActionResult> GetUserWishlishByUserid(string email)
        {
            try
            {
                var wishlist = await _userService.GetUserWishlistByEmailAsync(email);

                foreach (var wish in wishlist)
                {
                    wish.Product = await _productService.GetProductByIdAsync(wish.ProductId);
                    wish.Product.ProductImages = await _productService.GetProductImagesByIdAsync(wish.ProductId);
                }

                return Ok(wishlist);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("createwishlist")]
        public async Task<IActionResult> CreateWishlist([FromBody] UserWishlist userWishlist)
        {
            try
            {
                var wishlist = await _userService.CreateUserWishlistdAsync(userWishlist);

                return Ok(wishlist);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("deleteWishlishbyemailandproductid")]
        public async Task<IActionResult> DeleteWishlist([FromBody] UserWishlist userWishlist)
        {
            try
            {
                var wishlist = await _userService.DeleteUserWishlistByEmailAndProductIdAsync(userWishlist.Email, userWishlist.ProductId);

                return Ok(wishlist);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("getuserwishlishbyemailandproductid")]
        public async Task<IActionResult> GetUserWishlishByEmailAndProductid([FromBody] UserWishlist userWishlist)
        {
            try
            {
                var wishlist = await _userService.GetUserWishlistByEmailAndProductIdAsync(userWishlist);

                foreach (var wish in wishlist)
                {
                    wish.Product = await _productService.GetProductByIdAsync(wish.ProductId);
                }

                return Ok(wishlist);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpGet("getuserproductnotificationbyemail/{email}")]
        public async Task<IActionResult> GetUserProductNotificationByEmail(string email)
        {
            try
            {
                var notif = await _userService.GetUserProductNotificationByEmailAsync(email);
                
                return Ok(notif);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("getuserproductnotificationbyemailandproduct")]
        public async Task<IActionResult> GetUserProductNotificationByEmailAndProduct([FromBody] UserProductNotification notif)
        {
            try
            {
                var notification = await _userService.GetUserProductNotificationByEmailAndProductAsync(notif);
                
                return Ok(notification);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("createuserproductnotification")]
        public async Task<IActionResult> GetUserProductNotificationByEmail([FromBody] UserProductNotification notif)
        {
            try
            {
                var userNotif = await _userService.CreateUserProductNotificationAsync(notif);
                
                return Ok(userNotif);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("deleteuserproductnotificationbyemailandproduct")]
        public async Task<IActionResult> DeleteUserProductNotificationByEmailAndProduct([FromBody] UserProductNotification notif)
        {
            try
            {
                var userNotif = await _userService.DeleteUserProductNotificationByEmailAndProductAsync(notif);
                
                return Ok(userNotif);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("getuserproductnotificationbyproduct/{productid}")]
        public async Task<IActionResult> GetUserProductNotificationByProduct(int productid)
        {
            try
            {
                var notif = await _userService.GetUserProductNotificationByProductAsync(productid);
                
                return Ok(notif);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("createusersubscription")]
        public async Task<IActionResult> GetUserProductNotificationByProduct(UserSubscription sub)
        {
            try
            {
                var extsubs = await _userService.GetUserSubscriptionByEmailAsync(sub.Email);

                if(extsubs != null && extsubs.Id > 0)
                    return BadRequest("Email is already subscribed.");

                var subs = await _userService.CreateUserSubscriptionByEmailAsync(sub.Email);
                
                return Ok(subs);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpDelete("deleteusersubscription/{email}")]
        public async Task<IActionResult> DeleteUserSubscription(string email)
        {
            try
            {
                var sb = await _userService.DeleteUserSubscriptionByEmailAsync(email);

                return Ok(sb);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpGet("getusersubscriptionbyemail/{email}")]
        public async Task<IActionResult> GetUserSubscriptionByEmail(string email)
        {
            try
            {
                var extsubs = await _userService.GetUserSubscriptionByEmailAsync(email);
                return Ok(extsubs);
              }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        

    }
}