using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ByzmoApi.Models;
using ByzmoApi.DataAccess.Applcation;
using System.Text.Json;
using System.Text.Json.Serialization;


namespace ByzmoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrencyController : Controller
    {
        ICurrencyService _iCurrencyService;

        public CurrencyController(ICurrencyService CurrencyService)
        {
            this._iCurrencyService = CurrencyService;
        }

        [HttpGet("getcurrency/{basecurrency}")]
        public async Task<IActionResult> GetCurrency(string basecurrency)
        {
            try
            {
                var data = await _iCurrencyService.GetCurrencyCurrentByBaseCodeAsync(basecurrency);

                if (data == null) 
                {
                    data = await _iCurrencyService.GetCurrencyAsync(basecurrency);

                    if(data.Conversion_Rates != null) 
                    {
                        string jsonString = JsonSerializer.Serialize(data.Conversion_Rates);
                        data.Json_Rates = jsonString;
                        await _iCurrencyService.CreateCurrencyAsync(data);
                    } 
                    else 
                    {
                        data = await _iCurrencyService.GetCurrencyByBaseCodeAsync(basecurrency);
                        data.Conversion_Rates = JsonSerializer.Deserialize<CurrencyRates>(data.Json_Rates);
                    }
                } 
                else 
                {
                    data.Conversion_Rates = JsonSerializer.Deserialize<CurrencyRates>(data.Json_Rates);
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

    }
}
