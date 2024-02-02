using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface ILoyaltyService
    {
        Task<IEnumerable<LoyaltyDiscount>> GetLoyaltyDiscountListRangeAsync(Filter filter);
        IEnumerable<LoyaltyDiscount> GetLoyaltyDiscountListRange(Filter filter);
        Task<LoyaltyDiscount> GetLoyaltyDiscountByIdAsync(int id);
        LoyaltyDiscount GetLoyaltyDiscountById(int id);
        Task<LoyaltyDiscount> CreateLoyaltyDiscountAsync(LoyaltyDiscount discount);
        LoyaltyDiscount CreateLoyaltyDiscount(LoyaltyDiscount discount);
        Task<LoyaltyDiscount> UpdateLoyaltyDiscountAsync(LoyaltyDiscount discount);
        LoyaltyDiscount UpdateLoyaltyDiscount(LoyaltyDiscount discount);
        Task<bool> DeleteLoyaltyDiscountAsync(int id);
        bool DeleteLoyaltyDiscount(int id);
        Task<LoyaltyPayment> CreateLoyaltyPaymentAsync(LoyaltyPayment loyaltyPayment);
        LoyaltyPayment CreateLoyaltyPayment(LoyaltyPayment loyaltyPayment);

        Task<IEnumerable<LoyaltyPayment>> GetLoyaltyPaymentByUserIdAndEmailAsync(int userId, string email);
        IEnumerable<LoyaltyPayment> GetLoyaltyPaymentByUserIdAndEmail(int userId, string email);

        Task<bool> CreateLoyaltyVoucherAsync(LoyaltyVoucher voucher);
        bool CreateLoyaltyVoucher(LoyaltyVoucher voucher);
        Task<IEnumerable<LoyaltyVoucher>> GetActiveLoyaltyVoucherAsync(int userId, string email);
        IEnumerable<LoyaltyVoucher> GetActiveLoyaltyVoucher(int userId, string email);
        Task<bool> DeleteActiveLoyaltyVoucherAsync(int userId, string email);
        bool DeleteActiveLoyaltyVoucher(int userId, string email);
        Task<IEnumerable<LoyaltyVoucher>> GetAllLoyaltyVoucherAsync(int userId, string email);
        IEnumerable<LoyaltyVoucher> GetAllLoyaltyVoucher(int userId, string email);

        Task<bool> ClaimVoucherAsync(LoyaltyVoucher voucher);
        bool ClaimVoucher(LoyaltyVoucher voucher);

        Task<LoyaltyVoucher> GetLoyaltyVoucherByCodeAsync(string code);
        LoyaltyVoucher GetLoyaltyVoucherByCode(string code);
        Task<bool> DeleteLoyaltyPaymentByUserIdAndEmailAsync(int userId, string email);
        bool DeleteLoyaltyPaymentByUserIdAndEmail(int userId, string email);

    }

    public class LoyaltyService : BaseNpgSqlServerService, ILoyaltyService
    {

        public LoyaltyService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {
        }
        public async Task<IEnumerable<LoyaltyDiscount>> GetLoyaltyDiscountListRangeAsync(Filter filter)
        {
            return await Task.Run(() => GetLoyaltyDiscountListRange(filter));
        }


        public IEnumerable<LoyaltyDiscount> GetLoyaltyDiscountListRange(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LoyaltyDiscount>("loyalty.getloyaltydiscountlistrange", new
                {
                    p_offset = filter.Offset,
                    p_limit = filter.Limit
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<LoyaltyDiscount> GetLoyaltyDiscountByIdAsync(int id)
        {
            return await Task.Run(() => GetLoyaltyDiscountById(id));
        }


        public LoyaltyDiscount GetLoyaltyDiscountById(int id)
        {

            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LoyaltyDiscount>("loyalty.getloyaltydiscountbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<LoyaltyDiscount> CreateLoyaltyDiscountAsync(LoyaltyDiscount discount)
        {
            return await Task.Run(() => CreateLoyaltyDiscount(discount));
        }



        public LoyaltyDiscount CreateLoyaltyDiscount(LoyaltyDiscount discount)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LoyaltyDiscount>("loyalty.createloyaltydiscount", new
                {
                    p_tierlevel = discount.TierLevel,
                    p_rangefrom = discount.RangeFrom,
                    p_rangefromcurrencytype = discount.RangeFromCurrencyType,
                    p_rangeto = discount.RangeTo,
                    p_rangetocurrencytype = discount.RangeToCurrencyType,
                    p_discount = discount.Discount,
                    p_discountamounttype = discount.DiscountAmountType
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }

        }

        public async Task<LoyaltyDiscount> UpdateLoyaltyDiscountAsync(LoyaltyDiscount discount)
        {
            return await Task.Run(() => UpdateLoyaltyDiscount(discount));
        }



        public LoyaltyDiscount UpdateLoyaltyDiscount(LoyaltyDiscount discount)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LoyaltyDiscount>("loyalty.updateloyaltydiscount", new
                {
                    p_id = discount.Id,
                    p_tierlevel = discount.TierLevel,
                    p_rangefrom = discount.RangeFrom,
                    p_rangefromcurrencytype = discount.RangeFromCurrencyType,
                    p_rangeto = discount.RangeTo,
                    p_rangetocurrencytype = discount.RangeToCurrencyType,
                    p_discount = discount.Discount,
                    p_discountamounttype = discount.DiscountAmountType
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }

        }

        public async Task<bool> DeleteLoyaltyDiscountAsync(int id)
        {
            return await Task.Run(() => DeleteLoyaltyDiscount(id));
        }



        public bool DeleteLoyaltyDiscount(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("loyalty.deleteloyaltydiscount", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }

        }



        public async Task<LoyaltyPayment> CreateLoyaltyPaymentAsync(LoyaltyPayment loyaltyPayment)
        {
            return await Task.Run(() => CreateLoyaltyPayment(loyaltyPayment));
        }



        public LoyaltyPayment CreateLoyaltyPayment(LoyaltyPayment loyaltyPayment)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LoyaltyPayment>("loyalty.createloyaltypayment", new
                {
                    p_orderid = loyaltyPayment.OrderId,
                    p_userid = loyaltyPayment.UserId,
                    p_email = loyaltyPayment.Email,
                    p_postdate = loyaltyPayment.PostDate,
                    p_amount = loyaltyPayment.Amount
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }

        }


        public async Task<IEnumerable<LoyaltyPayment>> GetLoyaltyPaymentByUserIdAndEmailAsync(int userId, string email)
        {
            return await Task.Run(() => GetLoyaltyPaymentByUserIdAndEmail(userId, email));
        }



        public IEnumerable<LoyaltyPayment> GetLoyaltyPaymentByUserIdAndEmail(int userId, string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LoyaltyPayment>("loyalty.getloyaltypaymentbyuseridandemail", new
                {
                    p_userid = userId,
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }

        }




        public async Task<bool> CreateLoyaltyVoucherAsync(LoyaltyVoucher voucher)
        {
            return await Task.Run(() => CreateLoyaltyVoucher(voucher));
        }



        public bool CreateLoyaltyVoucher(LoyaltyVoucher voucher)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("loyalty.createloyaltyvoucher", new
                {
                    p_userid = voucher.UserId,
                    p_email = voucher.Email,
                    p_discountcode = voucher.DiscountCode,
                    p_loyaltydiscountid = voucher.LoyaltyDiscountId,
                    p_isclaimed = voucher.IsClaimed,
                    p_isactive = voucher.IsActive
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }

        }
        public async Task<IEnumerable<LoyaltyVoucher>> GetActiveLoyaltyVoucherAsync(int userId, string email)
        {
            return await Task.Run(() => GetActiveLoyaltyVoucher(userId, email));
        }



        public IEnumerable<LoyaltyVoucher> GetActiveLoyaltyVoucher(int userId, string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LoyaltyVoucher>("loyalty.getactiveloyaltyvoucher", new
                {
                    p_userid = userId,
                    p_email = email,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteActiveLoyaltyVoucherAsync(int userId, string email)
        {
            return await Task.Run(() => DeleteActiveLoyaltyVoucher(userId, email));
        }



        public bool DeleteActiveLoyaltyVoucher(int userId, string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("loyalty.deleteactiveloyaltyvoucher", new
                {
                    p_userid = userId,
                    p_email = email,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<IEnumerable<LoyaltyVoucher>> GetAllLoyaltyVoucherAsync(int userId, string email)
        {
            return await Task.Run(() => GetAllLoyaltyVoucher(userId, email));
        }



        public IEnumerable<LoyaltyVoucher> GetAllLoyaltyVoucher(int userId, string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LoyaltyVoucher>("loyalty.getallloyaltyvoucherbyuser", new
                {
                    p_userid = userId,
                    p_email = email,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<bool> ClaimVoucherAsync(LoyaltyVoucher voucher)
        {
            return await Task.Run(() => ClaimVoucher(voucher));
        }



        public bool ClaimVoucher(LoyaltyVoucher voucher)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("loyalty.claimvoucher", new
                {
                    p_discountcode = voucher.DiscountCode
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<LoyaltyVoucher> GetLoyaltyVoucherByCodeAsync(string code)
        {
            return await Task.Run(() => GetLoyaltyVoucherByCode(code));
        }



        public LoyaltyVoucher GetLoyaltyVoucherByCode(string code)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LoyaltyVoucher>("loyalty.getloyaltyvoucherbycode", new
                {
                    p_discountcode = code
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteLoyaltyPaymentByUserIdAndEmailAsync(int userId, string email)
        {
            return await Task.Run(() => DeleteLoyaltyPaymentByUserIdAndEmail(userId, email));
        }



        public bool DeleteLoyaltyPaymentByUserIdAndEmail(int userId, string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("loyalty.deleteloyaltypaymentbyuseridandemail", new
                {
                    p_userid = userId,
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