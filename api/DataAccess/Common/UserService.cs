using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ByzmoApi.Helpers;
using ByzmoApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using Npgsql;

namespace ByzmoApi.DataAccess.Common
{
    public interface IUserService
    {
        User Authenticate(string email, string password);
        string CreateToken(User user);
        User GetUserByEmail(string email);
        Task<User> GetUserByEmailAsync(string email);
        User CreateUser(User newUser);
        Task<User> CreateUserAsync(User newUser);
        User UpdateUser(User newUser);
        Task<User> UpdateUserAsync(User newUser);
        User CreatePasswordHash(User user);
        Validity CheckEmailValidity(User user);
        Task<Validity> CheckEmailValidityAsync(User user);
        User GetUserById(int id);
        Task<User> GetUserByIdAsync(int id);
        ResetToken CreateConfirmationToken(ResetToken resetToken);
        Task<ResetToken> CreateConfirmationTokenAsync(ResetToken resetToken);
        ResetToken GetUserToken(string email, string token);
        Task<ResetToken> GetUserTokenAsync(string email, string token);
        User UpdateUserPassword(User user);
        Task<User> UpdateUserPasswordAsync(User user);
        ResetToken UpdateConfirmationToken(int tokenId);
        Task<ResetToken> UpdateConfirmationTokenAsync(int tokenId);
        IEnumerable<UserAddress> GetUserAddressByUserId(int userId);
        Task<IEnumerable<UserAddress>> GetUserAddressByUserIdAsync(int userId);
        User CreateUserAddress(UserAddress userAddress);
        Task<User> CreateUserAddressAsync(UserAddress userAddress);
        User DeleteUserAddress(UserAddress userAddress);
        Task<User> DeleteUserAddressAsync(UserAddress userAddress);
        User UpdateUserAddress(UserAddress userAddress);
        Task<User> UpdateUserAddressAsync(UserAddress userAddress);
        IEnumerable<User> GetAllUserAdmin();
        Task<IEnumerable<User>> GetAllUserAdminAsync();
        bool DeleteUserById(int id);
        Task<bool> DeleteUserByIdAsync(int id);
        UserAddress GetUserAddressById(int id);
        Task<UserAddress> GetUserAddressByIdAsync(int id);
        IEnumerable<UserWishlist> GetUserWishlistByEmail(string email);
        Task<IEnumerable<UserWishlist>> GetUserWishlistByEmailAsync(string email);
        UserWishlist CreateUserWishlist(UserWishlist wishlist);
        Task<UserWishlist> CreateUserWishlistdAsync(UserWishlist wishlist);
        bool DeleteUserWishlistByEmailAndProductId(string email, int productid);
        Task<bool> DeleteUserWishlistByEmailAndProductIdAsync(string email, int productid);
        IEnumerable<UserWishlist> GetUserWishlistByEmailAndProductId(UserWishlist wishlist);
        Task<IEnumerable<UserWishlist>> GetUserWishlistByEmailAndProductIdAsync(UserWishlist wishlist);
        IEnumerable<UserProductNotification> GetUserProductNotificationByEmail(string email);
        Task<IEnumerable<UserProductNotification>> GetUserProductNotificationByEmailAsync(string email);
        IEnumerable<UserProductNotification> GetUserProductNotificationByEmailAndProduct(UserProductNotification notif);
        Task<IEnumerable<UserProductNotification>> GetUserProductNotificationByEmailAndProductAsync(UserProductNotification notif);
        UserProductNotification CreateUserProductNotification(UserProductNotification notif);
        Task<UserProductNotification> CreateUserProductNotificationAsync(UserProductNotification notif);
        bool DeleteUserProductNotificationByEmailAndProduct(UserProductNotification notif);
        Task<bool> DeleteUserProductNotificationByEmailAndProductAsync(UserProductNotification notif);
        IEnumerable<UserProductNotification> GetUserProductNotificationByProduct(int productid);
        Task<IEnumerable<UserProductNotification>> GetUserProductNotificationByProductAsync(int productid);

        UserSubscription GetUserSubscriptionByEmail(string email);
        Task<UserSubscription> GetUserSubscriptionByEmailAsync(string email);
        IEnumerable<UserSubscription> GetUserSubscription();
        Task<IEnumerable<UserSubscription>> GetUserSubscriptionAsync();
        UserSubscription CreateUserSubscriptionByEmail(string email);
        Task<UserSubscription> CreateUserSubscriptionByEmailAsync(string email);
        bool DeleteUserSubscriptionByEmail(string email);
        Task<bool> DeleteUserSubscriptionByEmailAsync(string email);
        
    }

    public class UserService : BaseNpgSqlServerService, IUserService
    {
        public UserService(INpgSqlServerRepository npgSqlServerRepository,
            IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }
        public User Authenticate(string email, string password)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                return null;

            var user = GetUserByEmail(email);

            if (user == null)
                return null;

            // check if password is correct
            if (!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
                return null;

            user.Password = null;
            user.PasswordHash = null;
            user.PasswordSalt = null;

            // authentication successful
            return user;
        }

        public string CreateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(this._appSettings.TokenExpiration),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            return tokenString;
        }
        private static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            if (password == null) throw new ArgumentNullException(nameof(password));
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");

            if (storedHash != null && storedSalt != null)
            {
                if (storedHash.Length != 64)
                    throw new ArgumentException("Invalid length of password hash (64 bytes expected).", "passwordHash");
                if (storedSalt.Length != 128)
                    throw new ArgumentException("Invalid length of password salt (128 bytes expected).", "passwordHash");

                using (var hmac = new System.Security.Cryptography.HMACSHA512(storedSalt))
                {
                    var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                    for (int i = 0; i < computedHash.Length; i++)
                    {
                        if (computedHash[i] != storedHash[i]) return false;
                    }
                }
            }
            else
            {
                return false;
            }

            return true;
        }
        public User GetUserByEmail(string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<User>("application.getuserbyemail", new
                {
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await Task.Run(() => GetUserByEmail(email));
        }
        public User CreateUser(User newUser)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<User>("application.createuser", new
                {
                    p_name = newUser.Name,
                    p_email = newUser.Email,
                    p_mobilenumber = newUser.MobileNumber,
                    p_passwordhash = newUser.PasswordHash,
                    p_passwordsalt = newUser.PasswordSalt,
                    p_isadmin = newUser.IsAdmin,
                    p_isactive = newUser.IsActive,
                    p_issocialmedialogin = newUser.IsSocialMediaLogin
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<User> CreateUserAsync(User newUser)
        {
            return await Task.Run(() => CreateUser(newUser));
        }
        public User UpdateUser(User newUser)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<User>("application.updateuser", new
                {
                    p_id = newUser.Id,
                    p_name = newUser.Name,
                    p_email = newUser.Email,
                    p_mobilenumber = newUser.MobileNumber,
                    p_passwordhash = newUser.PasswordHash,
                    p_passwordsalt = newUser.PasswordSalt
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<User> UpdateUserAsync(User newUser)
        {
            return await Task.Run(() => UpdateUser(newUser));
        }
        public User CreatePasswordHash(User user)
        {
            if (user.Password == null)
                throw new ArgumentException("Password");

            if (string.IsNullOrWhiteSpace(user.Password))
                throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");

            using (var hmac = new HMACSHA512())
            {
                user.PasswordSalt = hmac.Key;
                user.PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(user.Password));
            }

            return user;
        }
        public Validity CheckEmailValidity(User user)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Validity>("application.checkemailvalidity", new
                {
                    p_userid = user.Id,
                    p_email = user.Email,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Validity> CheckEmailValidityAsync(User user)
        {
            return await Task.Run(() => CheckEmailValidity(user));
        }

        public User GetUserById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<User>("application.getuserbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await Task.Run(() => GetUserById(id));
        }

        public ResetToken CreateConfirmationToken(ResetToken resetToken)
        {
            try
            {
                var Token = _npgSqlServerRepository.ExecuteThenReturn<ResetToken>("application.createconfirmationtoken", new
                {
                    p_recipientemail = resetToken.RecipientEmail,
                    p_token = resetToken.Token,
                    p_expirationdate = resetToken.ExpirationDate,
                    p_isclaimed = resetToken.IsClaimed,
                    p_tokentype = resetToken.TokenType
                });

                return Token;
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<ResetToken> CreateConfirmationTokenAsync(ResetToken resetToken)
        {
            return await Task.Run(() => CreateConfirmationToken(resetToken));
        }
        public ResetToken GetUserToken(string email, string token)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ResetToken>("application.getusertoken", new
                {
                    p_token = token,
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<ResetToken> GetUserTokenAsync(string email, string token)
        {
            return await Task.Run(() => GetUserToken(email, token));
        }
        public User UpdateUserPassword(User user)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<User>("application.updateuserpassword", new
                {
                    p_userid = user.Id,
                    p_passwordhash = user.PasswordHash,
                    p_passwordsalt = user.PasswordSalt
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<User> UpdateUserPasswordAsync(User user)
        {
            return await Task.Run(() => UpdateUserPassword(user));
        }
        public ResetToken UpdateConfirmationToken(int tokenId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ResetToken>("application.updateconfirmationtoken", new
                {
                    p_id = tokenId
                });

            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<ResetToken> UpdateConfirmationTokenAsync(int tokenId)
        {
            return await Task.Run(() => UpdateConfirmationToken(tokenId));
        }

        public IEnumerable<UserAddress> GetUserAddressByUserId(int userId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<UserAddress>("application.getuseraddressbyuserid", new
                {
                    p_userid = userId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<UserAddress>> GetUserAddressByUserIdAsync(int userId)
        {
            return await Task.Run(() => GetUserAddressByUserId(userId));
        }

        public User CreateUserAddress(UserAddress userAddress)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<User>("application.createuseraddress", new
                {
                    p_userid = userAddress.UserId,
                    p_address = userAddress.Address,
                    p_barangay = userAddress.Barangay,
                    p_city = userAddress.City,
                    p_province = userAddress.Province,
                    p_countrycode = userAddress.CountryCode,
                    p_zipcode = userAddress.ZipCode,
                    p_postalcode = userAddress.PostalCode,
                    p_prefecture = userAddress.Prefecture, 
                    p_states = userAddress.States
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<User> CreateUserAddressAsync(UserAddress userAddress)
        {
            return await Task.Run(() => CreateUserAddress(userAddress));
        }

        public User DeleteUserAddress(UserAddress userAddress)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<User>("application.deleteuseraddress", new
                {
                    p_id = userAddress.Id,
                    p_userid = userAddress.UserId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<User> DeleteUserAddressAsync(UserAddress userAddress)
        {
            return await Task.Run(() => DeleteUserAddress(userAddress));
        }

        public User UpdateUserAddress(UserAddress userAddress)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<User>("application.updateuseraddress", new
                {
                    p_id = userAddress.Id,
                    p_userid = userAddress.UserId,
                    p_address = userAddress.Address,
                    p_barangay = userAddress.Barangay,
                    p_city = userAddress.City,
                    p_province = userAddress.Province,
                    p_countrycode = userAddress.CountryCode,
                    p_zipcode = userAddress.ZipCode,
                    p_isdefault = userAddress.IsDefault,
                    p_postalcode = userAddress.PostalCode,
                    p_prefecture = userAddress.Prefecture, 
                    p_states = userAddress.States

                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<User> UpdateUserAddressAsync(UserAddress userAddress)
        {
            return await Task.Run(() => UpdateUserAddress(userAddress));
        }




        public IEnumerable<User> GetAllUserAdmin()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<User>("application.getalluseradmin");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<User>> GetAllUserAdminAsync()
        {
            return await Task.Run(() => GetAllUserAdmin());
        }



        public bool DeleteUserById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("application.deleteuserbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteUserByIdAsync(int id)
        {
            return await Task.Run(() => DeleteUserById(id));
        }

        public UserAddress GetUserAddressById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<UserAddress>("application.getuseraddressbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<UserAddress> GetUserAddressByIdAsync(int id)
        {
            return await Task.Run(() => GetUserAddressById(id));
        }


        public IEnumerable<UserWishlist> GetUserWishlistByEmail(string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<UserWishlist>("application.getwishlistbyemail", new
                {
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<UserWishlist>> GetUserWishlistByEmailAsync(string email)
        {
            return await Task.Run(() => GetUserWishlistByEmail(email));
        }


        public UserWishlist CreateUserWishlist(UserWishlist wishlist)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<UserWishlist>("application.createwishlist", new
                {
                    p_email = wishlist.Email,
                    p_productid = wishlist.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<UserWishlist> CreateUserWishlistdAsync(UserWishlist wishlist)
        {
            return await Task.Run(() => CreateUserWishlist(wishlist));
        }


        public bool DeleteUserWishlistByEmailAndProductId(string email, int productid)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("application.deleteWishlishbyemailandproductid", new
                {
                    p_email = email,
                    p_productid = productid
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteUserWishlistByEmailAndProductIdAsync(string email, int productid)
        {
            return await Task.Run(() => DeleteUserWishlistByEmailAndProductId(email, productid));
        }

        public IEnumerable<UserWishlist> GetUserWishlistByEmailAndProductId(UserWishlist wishlist)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<UserWishlist>("application.getwishlishbyemailandproductid", new
                {
                    p_email = wishlist.Email,
                    p_productid = wishlist.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<UserWishlist>> GetUserWishlistByEmailAndProductIdAsync(UserWishlist wishlist)
        {
            return await Task.Run(() => GetUserWishlistByEmailAndProductId(wishlist));
        }


        public IEnumerable<UserProductNotification> GetUserProductNotificationByEmail(string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<UserProductNotification>("application.getuserproductnotificationbyemail", new
                {
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<UserProductNotification>> GetUserProductNotificationByEmailAsync(string email)
        {
            return await Task.Run(() => GetUserProductNotificationByEmail(email));
        }


        public IEnumerable<UserProductNotification> GetUserProductNotificationByEmailAndProduct(UserProductNotification notif)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<UserProductNotification>("application.getuserproductnotificationbyemailandproductid", new
                {
                    p_email = notif.Email,
                    p_productid = notif.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<UserProductNotification>> GetUserProductNotificationByEmailAndProductAsync(UserProductNotification notif)
        {
            return await Task.Run(() => GetUserProductNotificationByEmailAndProduct(notif));
        }


        public UserProductNotification CreateUserProductNotification(UserProductNotification notif)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<UserProductNotification>("application.createuserproductnotification", new
                {
                    p_email = notif.Email,
                    p_productid = notif.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<UserProductNotification> CreateUserProductNotificationAsync(UserProductNotification notif)
        {
            return await Task.Run(() => CreateUserProductNotification(notif));
        }

        public bool DeleteUserProductNotificationByEmailAndProduct(UserProductNotification notif)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("application.deleteuserproductnotificationbyemailandproduct", new
                {
                    p_email = notif.Email,
                    p_productid = notif.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteUserProductNotificationByEmailAndProductAsync(UserProductNotification notif)
        {
            return await Task.Run(() => DeleteUserProductNotificationByEmailAndProduct(notif));
        }

         public async Task<IEnumerable<UserProductNotification>> GetUserProductNotificationByProductAsync(int productId)
        {
            return await Task.Run(() => GetUserProductNotificationByProduct(productId));
        }


        public IEnumerable<UserProductNotification> GetUserProductNotificationByProduct(int productId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<UserProductNotification>("application.getuserproductnotificationbyproduct", new
                {
                    p_productid = productId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<UserSubscription> GetUserSubscriptionByEmailAsync(string email)
        {
            return await Task.Run(() => GetUserSubscriptionByEmail(email));
        }


        public  UserSubscription GetUserSubscriptionByEmail(string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<UserSubscription>("application.getusersubscriptionbyemail", new
                {
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<UserSubscription>> GetUserSubscriptionAsync()
        {
            return await Task.Run(() => GetUserSubscription());
        }


        public  IEnumerable<UserSubscription> GetUserSubscription()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<UserSubscription>("application.getusersubscription");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<UserSubscription> CreateUserSubscriptionByEmailAsync(string email)
        {
            return await Task.Run(() => CreateUserSubscriptionByEmail(email));
        }


        public UserSubscription CreateUserSubscriptionByEmail(string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<UserSubscription>("application.createusersubscription", new
                {
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


       public async Task<bool> DeleteUserSubscriptionByEmailAsync(string email)
        {
            return await Task.Run(() => DeleteUserSubscriptionByEmail(email));
        }


        public bool DeleteUserSubscriptionByEmail(string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("application.deleteusersubscription", new
                {
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        
    }
}