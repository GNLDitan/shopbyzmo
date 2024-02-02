using System;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using System.Net.Http.Headers;

using ByzmoApi.Models;
using ByzmoApi.Helpers;


using Newtonsoft.Json;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IPaymongoService
    {
        Task<dynamic> CreateSourceResource(dynamic payload);
        Task<dynamic> GetSourceResourcesById(string id);
        Task<dynamic> CreatPayment(dynamic payload);
        Task<PaymentDetails> CompletePayment(dynamic payload, string token);
        Task<PaymentDetails> PaymentPreOrderSchedule(dynamic payload, string token);
        Task<PaymentDetails> PaymentLayawaySchedule(dynamic payload, string token);
        Task<PaymentDetails> SendPaymentNotification(dynamic payload, string token);
        Task<dynamic> CreatePaymentIntent(dynamic payload);
        Task<dynamic> PaymentMethod(dynamic payload);
        Task<dynamic> AttachToPaymentIntent(string paymentIntentId, dynamic payload); 
        Task<dynamic> CreateCheckoutSession(dynamic payload);
        

    }

    public class PaymongoService : BaseNpgSqlServerService, IPaymongoService
    {

        public PaymongoService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<dynamic> CreateSourceResource(dynamic payload)
        {
            try
            {
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.PaymongoApi + "/sources";
                var client = new HttpClient();
                client.DefaultRequestHeaders.Add("authorization", "Basic " + _appSettings.PmBasicAuth);

                //Pass in the full URL and the json string content
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();
                client.Dispose();
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }


        public async Task<dynamic> GetSourceResourcesById(string id)
        {
            try
            {
                //The url to post to.
                var url = _appSettings.PaymongoApi + "/sources/" + id;
                var client = new HttpClient();
                client.DefaultRequestHeaders.Add("authorization", "Basic " + _appSettings.PmBasicAuth);

                //Pass in the full URL and the json string content
                var response = await client.GetAsync(url);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();

                //close out the client
                client.Dispose();
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public async Task<dynamic> CreatPayment(dynamic payload)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.PaymongoApi + "/payments";
                var client = new HttpClient();
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmSecretkKey);
                client.DefaultRequestHeaders.Add("authorization", "Basic " + _appSettings.PmBasicAuth);
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmPublikKey);
              
                //Pass in the full URL and the json string content
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();

                //close out the client
                client.Dispose();
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }


        public async Task<PaymentDetails> CompletePayment(dynamic payload, string token)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.ApiOrigin + "/api/payment/completepayment";
                var client = new HttpClient();

                //Pass in the full URL and the json string content
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();

                var pres = JsonConvert.DeserializeObject<PaymentDetails>(result);
                //close out the client
                client.Dispose();
                return pres;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }


        public async Task<PaymentDetails> PaymentPreOrderSchedule(dynamic payload, string token)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.ApiOrigin + "/api/payment/paymentpreorderschedule";
                var client = new HttpClient();

                //Pass in the full URL and the json string content
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();

                var pres = JsonConvert.DeserializeObject<PaymentDetails>(result);
                //close out the client
                client.Dispose();
                return pres;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public async Task<PaymentDetails> PaymentLayawaySchedule(dynamic payload, string token)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.ApiOrigin + "/api/payment/paymentlayawayschedule";
                var client = new HttpClient();

                //Pass in the full URL and the json string content
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();
                var pres = JsonConvert.DeserializeObject<PaymentDetails>(result);

                //close out the client
                client.Dispose();
                return pres;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<PaymentDetails> SendPaymentNotification(dynamic payload, string token)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.ApiOrigin + "/api/email/sendpaymentnotification";
                var client = new HttpClient();

                //Pass in the full URL and the json string content
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();
                var pres = JsonConvert.DeserializeObject<PaymentDetails>(result);

                //close out the client
                client.Dispose();
                return pres;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        

        public async Task<dynamic> CreatePaymentIntent(dynamic payload)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.PaymongoApi + "/payment_intents";
                var client = new HttpClient();
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmSecretkKey);
                client.DefaultRequestHeaders.Add("authorization", "Basic " + _appSettings.PmBasicAuth);
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmPublikKey);
              
                //Pass in the full URL and the json string content
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();

                //close out the client
                client.Dispose();
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<dynamic> PaymentMethod(dynamic payload)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.PaymongoApi + "/payment_methods";
                var client = new HttpClient();
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmSecretkKey);
                client.DefaultRequestHeaders.Add("authorization", "Basic " + _appSettings.PmBasicAuth);
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmPublikKey);
              
                //Pass in the full URL and the json string content
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();

                //close out the client
                client.Dispose();
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public async Task<dynamic> AttachToPaymentIntent(string paymentIntentId, dynamic payload)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.PaymongoApi + "/payment_intents/" + paymentIntentId + "/attach";
                var client = new HttpClient();
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmSecretkKey);
                client.DefaultRequestHeaders.Add("authorization", "Basic " + _appSettings.PmBasicAuth);
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmPublikKey);
              
                //Pass in the full URL and the json string content
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();

                //close out the client
                client.Dispose();
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        
        public async Task<dynamic> CreateCheckoutSession(dynamic payload)
        {
            try
            {
                //Converting the object to a json string. NOTE: Make sure the object doesn't contain circular references.
                string json = JsonConvert.SerializeObject(payload);

                //Needed to setup the body of the request
                StringContent data = new StringContent(json, Encoding.UTF8, "application/json");

                //The url to post to.
                var url = _appSettings.PaymongoApi + "/checkout_sessions";
                var client = new HttpClient();
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmSecretkKey);
                client.DefaultRequestHeaders.Add("authorization", "Basic " + _appSettings.PmBasicAuth);
                // client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", "username: " + _appSettings.PmPublikKey);
              
                //Pass in the full URL and the json string content
                var response = await client.PostAsync(url, data);

                //It would be better to make sure this request actually made it through
                string result = await response.Content.ReadAsStringAsync();

                //close out the client
                client.Dispose();
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}