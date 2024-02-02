using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IShippingService
    {
        Task<Shipping> CreateShippingAsync(Shipping shipping);
        Shipping CreateShipping(Shipping shipping);
        Task<IEnumerable<Shipping>> GetShippingListRangeAsync(Filter filter);
        IEnumerable<Shipping> GetShippingListRange(Filter filter);
        Task<bool> DeleteShippingByIdAsync(int id);
        bool DeleteShippingById(int id);
        Task<Shipping> GetShippingByIdAsync(int id);
        Shipping GetShippingById(int id);
        Task<Shipping> UpdateShippingAsync(Shipping shipping);
        Shipping UpdateShipping(Shipping shipping);
        Task<ShippingDetails> CreateShippingDetailsAsync(ShippingDetails shippingDetails);
        ShippingDetails CreateShippingDetails(ShippingDetails shippingDetails);
        Task<ShippingDetails> UpdateShippingDetailsAsync(ShippingDetails shippingDetails);
        ShippingDetails UpdateShippingDetails(ShippingDetails shippingDetails);
        Task<ShippingDetails> GetShippingDetailsByIdAsync(int id);
        ShippingDetails GetShippingDetailsById(int id);
        Task<IEnumerable<ShippingSpecialItemCost>> GetShippingSpecialItemCostByShippingIdAsync(int shippingId);
        IEnumerable<ShippingSpecialItemCost> GetShippingSpecialItemCostByShippingId(int shippingId);
        Task<ShippingSpecialItemCost> CreateShippingSpecialItemCostAsync(ShippingSpecialItemCost shippingSpecialItemCost);
        ShippingSpecialItemCost CreateShippingSpecialItemCost(ShippingSpecialItemCost shippingSpecialItemCost);
        Task<ShippingSpecialItemCost> UpdateShippingSpecialItemCostAsync(ShippingSpecialItemCost shippingSpecialItemCost);
        ShippingSpecialItemCost UpdateShippingSpecialItemCost(ShippingSpecialItemCost shippingSpecialItemCost);
        Task<bool> DeleteShippingSpecialItemCostByIdAsync(int id);
        bool DeleteShippingSpecialItemCostById(int id);
    }

    public class ShippingService : BaseNpgSqlServerService, IShippingService
    {

        public ShippingService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<Shipping> CreateShippingAsync(Shipping shipping)
        {
            return await Task.Run(() => CreateShipping(shipping));
        }
        public Shipping CreateShipping(Shipping shipping)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Shipping>("shipping.createshipping", new
                {
                    p_shippingname = shipping.ShippingName,
                    p_trackingurl = shipping.TrackingUrl,
                    p_description = shipping.Description,
                    p_rate = shipping.Rate,
                    p_currencyid = shipping.CurrencyId,
                    p_isactive = shipping.IsActive,
                    p_hasadditionrate = shipping.HasAdditionRate,
                    p_hasinsurance = shipping.HasInsurance,
                    p_everyamount = shipping.EveryAmount,
                    p_insurancefee = shipping.InsuranceFee,
                    p_isinternational = shipping.IsInternational
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Shipping>> GetShippingListRangeAsync(Filter filter)
        {
            return await Task.Run(() => GetShippingListRange(filter));
        }


        public IEnumerable<Shipping> GetShippingListRange(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Shipping>("shipping.getshippinglistrange", new
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

        public async Task<bool> DeleteShippingByIdAsync(int id)
        {
            return await Task.Run(() => DeleteShippingById(id));
        }

        public bool DeleteShippingById(int id)
        {
            try
            {
                _npgSqlServerRepository.ExecuteThenReturn<bool>("shipping.deleteshippingbyid", new
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
        public async Task<Shipping> GetShippingByIdAsync(int id)
        {
            return await Task.Run(() => GetShippingById(id));
        }
        public Shipping GetShippingById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Shipping>("shipping.getshippingbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<Shipping> UpdateShippingAsync(Shipping shipping)
        {
            return await Task.Run(() => UpdateShipping(shipping));
        }

        public Shipping UpdateShipping(Shipping shipping)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Shipping>("shipping.updateshipping", new
                {
                    p_id = shipping.Id,
                    p_shippingname = shipping.ShippingName,
                    p_trackingurl = shipping.TrackingUrl,
                    p_description = shipping.Description,
                    p_rate = shipping.Rate,
                    p_currencyid = shipping.CurrencyId,
                    p_hasadditionrate = shipping.HasAdditionRate,
                    p_hasinsurance = shipping.HasInsurance,
                    p_everyamount = shipping.EveryAmount,
                    p_insurancefee = shipping.InsuranceFee,
                    p_isinternational = shipping.IsInternational
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<ShippingDetails> CreateShippingDetailsAsync(ShippingDetails shippingDetails)
        {
            return await Task.Run(() => CreateShippingDetails(shippingDetails));
        }

        public ShippingDetails CreateShippingDetails(ShippingDetails shippingDetails)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ShippingDetails>("shipping.createshippingdetails", new
                {
                    p_completename = shippingDetails.CompleteName,
                    p_email = shippingDetails.Email,
                    p_mobilenumber = shippingDetails.MobileNumber,
                    p_address = shippingDetails.Address,
                    p_barangay = shippingDetails.Barangay,
                    p_city = shippingDetails.City,
                    p_province = shippingDetails.Province,
                    p_zipcode = shippingDetails.ZipCode,
                    p_country = shippingDetails.CountryCode,
                    p_specialinstruction = shippingDetails.SpecialInstruction,
                    p_shippingmethod = shippingDetails.ShippingMethod,
                    p_paymentmethod = shippingDetails.PaymentMethod,
                    p_userid = shippingDetails.UserId,
                    p_subtotal = shippingDetails.SubTotal,
                    p_shippingamount = shippingDetails.ShippingAmount,
                    p_total = shippingDetails.Total,
                    p_amounttopay = shippingDetails.AmountToPay,
                    p_discountcode = shippingDetails.DiscountCode,
                    p_discountamount = shippingDetails.DiscountAmount,
                    p_emailinstruction = shippingDetails.EmailInstruction,
                    p_shippingmethoddescription = shippingDetails.ShippingMethodDescription,
                    p_trackingurl = shippingDetails.TrackingUrl,
                    p_shippingname = shippingDetails.ShippingName,
                    p_transactionfee = shippingDetails.TransactionFee,
                    p_finalamount = shippingDetails.FinalAmount,
                    p_billingaddress = shippingDetails.BillingAddress,
                    p_states = shippingDetails.States,
                    p_prefecture = shippingDetails.Prefecture,
                    p_postalcode = shippingDetails.PostalCode,
                    p_numcode = shippingDetails.NumCode,
                    p_basecurrency = shippingDetails.BaseCurrency,
                    p_currencyrate = shippingDetails.CurrencyRate,
                    p_insurancefee = shippingDetails.InsuranceFee,
                    p_facebookname = shippingDetails.FacebookName
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<ShippingDetails> UpdateShippingDetailsAsync(ShippingDetails shippingDetails)
        {
            return await Task.Run(() => UpdateShippingDetails(shippingDetails));
        }

        public ShippingDetails UpdateShippingDetails(ShippingDetails shippingDetails)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ShippingDetails>("shipping.updateshippingdetails", new
                {
                    p_id = shippingDetails.Id,
                    p_completename = shippingDetails.CompleteName,
                    p_email = shippingDetails.Email,
                    p_mobilenumber = shippingDetails.MobileNumber,
                    p_address = shippingDetails.Address,
                    p_barangay = shippingDetails.Barangay,
                    p_city = shippingDetails.City,
                    p_province = shippingDetails.Province,
                    p_zipcode = shippingDetails.ZipCode,
                    p_country = shippingDetails.CountryCode,
                    p_specialinstruction = shippingDetails.SpecialInstruction,
                    p_shippingmethod = shippingDetails.ShippingMethod,
                    p_paymentmethod = shippingDetails.PaymentMethod,
                    p_userid = shippingDetails.UserId,
                    p_subtotal = shippingDetails.SubTotal,
                    p_shippingamount = shippingDetails.ShippingAmount,
                    p_total = shippingDetails.Total,
                    p_amounttopay = shippingDetails.AmountToPay,
                    p_discountcode = shippingDetails.DiscountCode,
                    p_emailinstruction = shippingDetails.EmailInstruction,
                    p_shippingname = shippingDetails.ShippingName,
                    p_discountamount = shippingDetails.DiscountAmount,
                    p_numcode = shippingDetails.NumCode,
                    p_basecurrency = shippingDetails.BaseCurrency,
                    p_currencyrate = shippingDetails.CurrencyRate
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<ShippingDetails> GetShippingDetailsByIdAsync(int id)
        {
            return await Task.Run(() => GetShippingDetailsById(id));
        }
        public ShippingDetails GetShippingDetailsById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ShippingDetails>("shipping.getshippingdetailsbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<ShippingSpecialItemCost>> GetShippingSpecialItemCostByShippingIdAsync(int shippingId)
        {
            return await Task.Run(() => GetShippingSpecialItemCostByShippingId(shippingId));
        }
        public IEnumerable<ShippingSpecialItemCost> GetShippingSpecialItemCostByShippingId(int shippingId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ShippingSpecialItemCost>("shipping.getshippingspecialitemcost", new
                {
                    p_shippingid = shippingId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<ShippingSpecialItemCost> CreateShippingSpecialItemCostAsync(ShippingSpecialItemCost shippingSpecialItemCost)
        {
            return await Task.Run(() => CreateShippingSpecialItemCost(shippingSpecialItemCost));
        }
        public ShippingSpecialItemCost CreateShippingSpecialItemCost(ShippingSpecialItemCost shippingSpecialItemCost)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ShippingSpecialItemCost>("shipping.createshippingspecialitemcost", new
                {
                    p_shippingid = shippingSpecialItemCost.ShippingId,
                    p_fromcount = shippingSpecialItemCost.FromCount,
                    p_tocount = shippingSpecialItemCost.ToCount,
                    p_amount = shippingSpecialItemCost.Amount
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<ShippingSpecialItemCost> UpdateShippingSpecialItemCostAsync(ShippingSpecialItemCost shippingSpecialItemCost)
        {
            return await Task.Run(() => UpdateShippingSpecialItemCost(shippingSpecialItemCost));
        }
        public ShippingSpecialItemCost UpdateShippingSpecialItemCost(ShippingSpecialItemCost shippingSpecialItemCost)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ShippingSpecialItemCost>("shipping.updateshippingspecialitemcost", new
                {
                    p_id = shippingSpecialItemCost.Id,
                    p_shippingid = shippingSpecialItemCost.ShippingId,
                    p_fromcount = shippingSpecialItemCost.FromCount,
                    p_tocount = shippingSpecialItemCost.ToCount,
                    p_amount = shippingSpecialItemCost.Amount
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteShippingSpecialItemCostByIdAsync(int id)
        {
            return await Task.Run(() => DeleteShippingSpecialItemCostById(id));
        }
        public bool DeleteShippingSpecialItemCostById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("shipping.updateshippingspecialitemcost", new
                {
                    p_id = id,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
    }
}