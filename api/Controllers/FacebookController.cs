using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ByzmoApi.Models;
using Newtonsoft.Json.Linq;
using System.Text;
using ByzmoApi.Helpers;
using System.Dynamic;
namespace ByzmoApi.Controllers
{
    
    [Route("api/[controller]")]
    [ApiController]
    public class FacebookController : ControllerBase
    {
        private readonly IAppSettings _appSettings;

        public FacebookController(IAppSettings appSettings) 
        {
            _appSettings = appSettings;
        }

        [HttpGet]
        public ActionResult Get()
        {
            return Ok();
        }

        [HttpGet("liveness")]
        public ActionResult Liveness()
        {
            return Ok();
        }

        [HttpPost("datadeletion")]
        public ActionResult FacebookDelete([FromBody] dynamic payload)
        {
            string signed_request = payload.signed_request;

            if (!String.IsNullOrEmpty(signed_request))
            {
                var split = signed_request.Split('.');

                if (string.IsNullOrWhiteSpace(split[0]) == false)
                {
                    int mod4 = split[0].Length % 4;
                    if (mod4 > 0) split[0] += new string('=', 4 - mod4);

                    split[0] = split[0]
                        .Replace('-', '+')
                        .Replace('_', '/');
                }

                if (string.IsNullOrWhiteSpace(split[1]) == false)
                {
                    int mod4 = split[1].Length % 4;
                    if (mod4 > 0) split[1] += new string('=', 4 - mod4);

                    split[1] = split[1]
                        .Replace('-', '+')
                        .Replace('_', '/');
                }

                var dataRaw = Encoding.UTF8.GetString(Convert.FromBase64String(split[1]));

                // JSON object
                var json = JObject.Parse(dataRaw);

                var appSecretBytes = Encoding.UTF8.GetBytes("c131d1f48c08deb9113359007f96df9f");
                var hmac = new System.Security.Cryptography.HMACSHA256(appSecretBytes);
                var expectedHash = Convert.ToBase64String(hmac.ComputeHash(
                    Encoding.UTF8.GetBytes(signed_request.Split('.')[1])))
                    .Replace('-', '+')
                    .Replace('_', '/');

                if (expectedHash != split[0])
                {
                    return BadRequest();
                }

                //*********************
                //Delete your data here
                //*********************
                var redirectLink = _appSettings.ByzmoLink+"?id="+json.GetValue("user_id").ToString();
                if (json != null)
                {

                    dynamic response = new ExpandoObject();
                    response.url = redirectLink;
                    response.confirmation_code = json.GetValue("user_id").ToString();

                    return Ok(response);
                }
            }

            //bad request
            return BadRequest();
        }


       
    }
}
