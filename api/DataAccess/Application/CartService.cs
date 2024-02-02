using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface ICartService
    {
        Task<Cart> CreateCartAsync(Cart cart);
        Cart CreateCart(Cart cart);
        Task<IEnumerable<Cart>> GetCartByUserIdAndIpAsync(int userId, string ipAddress);
        IEnumerable<Cart> GetCartByUserIdAndIp(int userId, string ipAddress);
        Task<Cart> UpdateCartAsync(Cart cart);
        Cart UpdateCart(Cart cart);
        Task<bool> DeleteCartByIdAsync(int id);
        bool DeleteCartById(int id);

        Task<bool> DeleteItemInCartByEmailAsync(string email);
        bool DeleteItemInCartByEmail(string email);
        Task<bool> ValidateCartByUserIdAsync(int userId);
        bool ValidateCartByUserId(int userId);
        Task<bool> UpdateCartUserAsync(int userId, string ipAddress);
        bool UpdateCartUser(int userId, string ipAddress);
        Task<bool> ValidateProductAsync(int userId);
        bool ValidateProduct(int userId);

    }

    public class CartService : BaseNpgSqlServerService, ICartService
    {
        public CartService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<Cart> CreateCartAsync(Cart cart)
        {
            return await Task.Run(() => CreateCart(cart));
        }
        public Cart CreateCart(Cart cart)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Cart>("cart.createcart", new
                {
                    p_userid = cart.UserId,
                    p_productid = cart.Product.Id,
                    p_quantity = cart.Quantity,
                    p_datetime = cart.DateTime,
                    p_isactive = cart.IsActive,
                    p_islayaway = cart.isLayAway,
                    p_datesofpayment = cart.DatesOfPayment,
                    p_numberofinstallment = cart.NumberOfInstallment,
                    p_ipaddress = cart.IpAddress,
                    p_preorderlayaway = cart.PreOrderLayaway
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Cart>> GetCartByUserIdAndIpAsync(int userId, string ipAddress)
        {
            return await Task.Run(() => GetCartByUserIdAndIp(userId, ipAddress));
        }

        public IEnumerable<Cart> GetCartByUserIdAndIp(int userId, string ipAddress)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Cart>("cart.getcartbyuseridandip", new
                {
                    p_userid = userId,
                    p_ipaddress = ipAddress
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Cart> UpdateCartAsync(Cart cart)
        {
            return await Task.Run(() => UpdateCart(cart));
        }

        public Cart UpdateCart(Cart cart)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Cart>("cart.updatecart", new
                {
                    p_id = cart.Id,
                    p_quantity = cart.Quantity,
                    p_datetime = cart.DateTime,
                    p_islayaway = cart.isLayAway,
                    p_datesofpayment = cart.DatesOfPayment,
                    p_numberofinstallment = cart.NumberOfInstallment,
                    p_ipaddress = cart.IpAddress,
                    p_hasrushfee = cart.HasRushFee,
                    p_rushfee = cart.RushFee,
                    p_preorderlayaway = cart.PreOrderLayaway
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<bool> DeleteCartByIdAsync(int id)
        {
            return await Task.Run(() => DeleteCartById(id));
        }

        public bool DeleteCartById(int id)
        {
            try
            {
                _npgSqlServerRepository.ExecuteThenReturn<bool>("cart.deletecartbyid", new
                {
                    p_id = id
                });
                return true;
            }
            catch
            {
                return false;
            }
        }



        public async Task<bool> DeleteItemInCartByEmailAsync(string email)
        {
            return await Task.Run(() => DeleteItemInCartByEmail(email));
        }

        public bool DeleteItemInCartByEmail(string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("cart.deleteitemincartbyemail", new
                {
                    p_email = email
                });
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ValidateCartByUserIdAsync(int userId)
        {
            return await Task.Run(() => ValidateCartByUserId(userId));
        }

        public bool ValidateCartByUserId(int userId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("cart.validatecartbyuserid", new
                {
                    p_userid = userId
                });
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateCartUserAsync(int userId, string ipAddress)
        {
            return await Task.Run(() => UpdateCartUser(userId, ipAddress));
        }

        public bool UpdateCartUser(int userId, string ipAddress)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("cart.updatecartuser", new
                {
                    p_userid = userId,
                    p_ipaddress = ipAddress
                });
            }
            catch
            {
                return false;
            }
        }
         public async Task<bool> ValidateProductAsync(int userId)
        {
            return await Task.Run(() => ValidateProduct(userId));
        }

        public bool ValidateProduct(int userId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("cart.validateproduct", new
                {
                    p_userid = userId
                });
            }
            catch
            {
                return false;
            }
        }

    }
}