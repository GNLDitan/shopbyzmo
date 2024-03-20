using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
using System.IO;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using ByzmoApi.DataAccess.Applcation;
using ByzmoApi.DataAccess.Common;


using Newtonsoft.Json;

using static ByzmoApi.Enum.Payment;
using static ByzmoApi.Enum.PaymongoStatus;
using Serilog;

namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymongoController : ControllerBase
    {
        IAppSettings _AppSettings;
        private readonly IPaymongoService _IPaymongoService;
        private readonly IPaymentService _paymentService;
        private readonly IUserService _userService;

        public PaymongoController(IAppSettings AppSettings,
                IPaymongoService PaymongoService,
                IPaymentService PaymentService,
                IUserService userService)
        {
            this._AppSettings = AppSettings;
            this._IPaymongoService = PaymongoService;
            this._paymentService = PaymentService;
            this._userService = userService;
        }

        [AllowAnonymous]
        [HttpPost("createresource")]
        public async Task<IActionResult> CreateSourceResource([FromBody] dynamic payload)
        {
            try
            {
                var result = await _IPaymongoService.CreateSourceResource(payload);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [AllowAnonymous]
        [HttpGet("getsourceresourcesbyid/{id}")]
        public async Task<IActionResult> GetSourceResourcesById(string id)
        {
            try
            {
                var result = await _IPaymongoService.GetSourceResourcesById(id);
                return Ok(result);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [AllowAnonymous]
        [HttpPost("creatpayment")]
        public async Task<IActionResult> CreatPayment([FromBody] dynamic payload)
        {
            try
            {
                var result = await _IPaymongoService.CreatPayment(payload);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        
        [AllowAnonymous]
        [HttpPost("createpaymentintent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] dynamic payload)
        {
            try
            {
                var result = await _IPaymongoService.CreatePaymentIntent(payload);
                return Ok(result);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("createcheckoutsession")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] dynamic payload)
        {
            try
            {
                var result = await _IPaymongoService.CreateCheckoutSession(payload);
                return Ok(result);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        


        [AllowAnonymous]
        [HttpPost("createpaymentmethod")]
        public async Task<IActionResult> CreatePaymentMethod([FromBody] dynamic payload)
        {
            try
            {
                var result = await _IPaymongoService.PaymentMethod(payload);
                return Ok(result);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("attachtopaymentintent/{id}")]
        public async Task<IActionResult> AttachToPaymentIntent(string id, [FromBody] dynamic payload)
        {
            try
            {
                var result = await _IPaymongoService.AttachToPaymentIntent(id, payload);
                return Ok(result);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [AllowAnonymous]
        [HttpPost("webhooks")]
        public async Task<IActionResult> WebHooks([FromBody] PaymongoWebhooks payload)
        {
            try
            {
                //* temporary token *//
                User user = new User();
                user.Email = _AppSettings.AccessUserName;
                user.Password = _AppSettings.AccessPassword;
                string tokenString = _userService.CreateToken(user);

                var response = payload.Data.Attributes.Data;
                var srcId = response.Id.ToString();
                var gcashpayment = await _paymentService.GetGCashPaymentBySourceIdAsync(srcId);
                string type = "source".ToString();

                if (response.Attributes.Status == "chargeable")
                {
                    /* Get Gcash Reference */


                    var payment = new
                    {
                        
                        attributes = new
                        {
                            amount = response.Attributes.Amount,
                            description = "Payment for Order# " + gcashpayment.OrderId,
                            currency = "PHP",
                            source = new
                            {
                                id = srcId,
                                type = type
                            }
                        }
                    };

                    /* Create Or Update */
                    var createPayment = await _IPaymongoService.CreatPayment(new { data = payment });
                    WebhookAttribute paymentResult = JsonConvert.DeserializeObject<WebhookAttribute>(createPayment);
                    gcashpayment.PaymentId = paymentResult.Data.Id;
                    var gcash = await _paymentService.CreateGCashPaymentAsync(gcashpayment);

                    /* Update Status */
                    await _paymentService.UpdateStatusSourcetAsync(srcId, (int)Status.Completed);


                    PaymentDetails details = new PaymentDetails();
                    details.OrderId = gcashpayment.OrderId;
                    details.ProductId = gcashpayment.ProductId;
                    details.PaymentMethod = gcashpayment.PaymentType;
                    details.LayAwayId = gcashpayment.PaymentType == "layaway" ? gcashpayment.RefId : 0;
                    details.AmountPaid = paymentResult.Data.Attributes.Amount / 100m;
                    details.PreOrderId = gcashpayment.PaymentType == "pre-order" ? gcashpayment.RefId : 0;
                    details.IsTotal = gcashpayment.IsTotal;

                    /* Complete Order Status */
                    if (gcashpayment.PaymentType == "order")
                    {
                        var res = await _IPaymongoService.CompletePayment(details, tokenString);
                    }
                    else if (gcashpayment.PaymentType == "pre-order")
                    {
                        var res = await _IPaymongoService.PaymentPreOrderSchedule(details, tokenString);
                    }
                    else if (gcashpayment.PaymentType == "layaway")
                    {
                        var res = await _IPaymongoService.PaymentLayawaySchedule(details, tokenString);

                        if (res.Id == 0)
                        {
                        }
                    }
                    var email = await _IPaymongoService.SendPaymentNotification(details, tokenString);
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpPost("webhooks-creditcard")]
        public async Task<IActionResult> WebHooksCreditCard([FromBody] PaymongoWebhooks payload)
        {
            Log.Debug("Webhook Received: webhooks-creditcard");
            Log.Debug("Webhook Received: " + JsonConvert.SerializeObject(payload));
            
            //* temporary token *//
            User user = new User();
            user.Email = _AppSettings.AccessUserName;
            user.Password = _AppSettings.AccessPassword;
            string tokenString = _userService.CreateToken(user);

            var response = payload.Data.Attributes.Data;
            var srcId = response.Id.ToString();
            var gcashpayment = await _paymentService.GetGCashPaymentBySourceIdAsync(srcId);
            string type = "source".ToString();

            Log.Debug("Webhook Received: " + JsonConvert.SerializeObject(gcashpayment));

            string status  = "pending";
            if (response.Attributes.Payments != null && response.Attributes.Payments.Count() > 0) {
                 status = response.Attributes.Payments[0].Attributes.Status;
            }
              

            var amountPaid  = 0m;
            if (status == "paid")
               amountPaid = response.Attributes.Line_Items != null && response.Attributes.Line_Items.Count() > 0 ? response.Attributes.Line_Items[0].Amount / 100m : 0;
            else amountPaid = response.Attributes.Amount  / 100m;
 

            if (status == "paid")
            {
                 /* Update Status */
                await _paymentService.UpdateStatusSourcetAsync(srcId, (int)Status.Completed);

                PaymentDetails details = new PaymentDetails();
                details.OrderId = gcashpayment.OrderId;
                details.ProductId = gcashpayment.ProductId;
                details.PaymentMethod = gcashpayment.PaymentType;
                details.LayAwayId = gcashpayment.PaymentType == "layaway" ? gcashpayment.RefId : 0;
                details.AmountPaid = amountPaid;
                details.PreOrderId = gcashpayment.PaymentType == "pre-order" ? gcashpayment.RefId : 0;
                details.IsTotal = gcashpayment.IsTotal;

                /* Complete Order Status */
                if (gcashpayment.PaymentType == "order")
                {
                    await _IPaymongoService.CompletePayment(details, tokenString);
                }
                else if (gcashpayment.PaymentType == "pre-order")
                {
                    await _IPaymongoService.PaymentPreOrderSchedule(details, tokenString);
                }
                else if (gcashpayment.PaymentType == "layaway")
                {
                    await _IPaymongoService.PaymentLayawaySchedule(details, tokenString);
                }
                var email = await _IPaymongoService.SendPaymentNotification(details, tokenString);

            }
             return Ok();
        }

    }
}