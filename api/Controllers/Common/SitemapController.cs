using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using ByzmoApi.DataAccess.Applcation;
using ByzmoApi.DataAccess.Common;
using System;
using System.IO;

namespace ByzmoApi.Controllers.Common
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SitemapController : ControllerBase
    {
        private readonly IAppSettings _appSettings;
        public SitemapController(IAppSettings appSettings)
        {
            this._appSettings = appSettings;
        }

        [HttpPost("modifysitemap")]
        public async Task<IActionResult> ModifySitemap([FromBody] SitemapData sitemap)
        {
            try
            {
                StreamWriter sw = new StreamWriter(this._appSettings.SitemapPath);
                await sw.WriteLineAsync(sitemap.Xml);
                sw.Close();

                return Ok(sitemap);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }
}