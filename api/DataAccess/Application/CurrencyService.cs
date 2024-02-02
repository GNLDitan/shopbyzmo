using System;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using System.Collections.Generic;
using System.Net.Http.Headers;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Newtonsoft.Json;
using Npgsql;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface ICurrencyService
    {
        Task<Currency> GetCurrencyByBaseCodeAsync(string baseCurrency);
        Currency GetCurrencyByBaseCode(string baseCurrency);

        Task<Currency> GetCurrencyCurrentByBaseCodeAsync(string baseCurrency);
        Currency GetCurrencyCurrentByBaseCode(string baseCurrency);
        
        Task<Currency> CreateCurrencyAsync(Currency Currency);
        Currency CreateCurrency(Currency Currency);

        Task<dynamic> GetCurrencyAsync(string baseCurrency);
    }

    public class CurrencyService : BaseNpgSqlServerService, ICurrencyService
    {
        public CurrencyService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<dynamic> GetCurrencyAsync(string baseCurrency)
        {
            try
            {
                //The url to post to.
                var url = _appSettings.ExchangeRateApi + "/" + _appSettings.ExchangeRateKey + "/latest/" + baseCurrency;
                var client = new HttpClient();

                //Pass in the full URL and the json string content
                var response = await client.GetAsync(url);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();
                client.Dispose();

                var config = JsonConvert.DeserializeObject<Currency>(result);

                return config;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public async Task<Currency> GetCurrencyByBaseCodeAsync(string baseCurrency)
        {
            return await Task.Run(() => GetCurrencyByBaseCode(baseCurrency));
        }


        public Currency GetCurrencyByBaseCode(string baseCurrency)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Currency>("application.getcurrencybybasecode", 
                new 
                {
                    p_basecode = baseCurrency
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<Currency> GetCurrencyCurrentByBaseCodeAsync(string baseCurrency)
        {
            return await Task.Run(() => GetCurrencyCurrentByBaseCode(baseCurrency));
        }


        public Currency GetCurrencyCurrentByBaseCode(string baseCurrency)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Currency>("application.getcurrencycurrentbybasecode", 
                new 
                {
                    p_basecode = baseCurrency
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<Currency> CreateCurrencyAsync(Currency currency)
        {
            return await Task.Run(() => CreateCurrency(currency));
        }


        public Currency CreateCurrency(Currency currency)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Currency>("application.createcurrencies", 
                new 
                {
                    p_basecode = currency.Base_Code,
                    p_jsonrates = currency.Json_Rates
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
    }
}