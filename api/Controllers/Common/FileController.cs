using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.DataAccess.Common;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Microsoft.AspNetCore.Http;

namespace ByzmoApi.Controllers.Common
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IAppSettings _appSettings;
        private readonly IFileService _fileService;


        public FileController(IAppSettings appSettings, IFileService fileService)
        {
            _appSettings = appSettings;
            _fileService = fileService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string fileLanding)
        {
            try
            {
                if (file == null || string.IsNullOrWhiteSpace(file.FileName)) return BadRequest(new { message = "Invalid file" });

                string filePath = null;
                switch (fileLanding)
                {
                    case "product":
                        filePath = _appSettings.ProductImagePath;
                        break;
                    case "landing":
                        filePath = _appSettings.LandingImagePath;
                        break;
                    case "blog":
                        filePath = _appSettings.BlogImagePath;
                        break;
                    case "attachment":
                        filePath = _appSettings.AttachmentPath;
                        break;
                    default:
                        filePath = _appSettings.DefaultImagePath;
                        break;
                }

                var uploadedFile = await _fileService.UploadFile(file, fileLanding, filePath);

                return Ok(new { fileStorageId = uploadedFile.Id, id = uploadedFile.Id, fileName = uploadedFile.FileName });
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [HttpPost("download")]
        public async Task<IActionResult> Download([FromBody] FileMapper file)
        {
            try
            {
                if (file == null || string.IsNullOrWhiteSpace(file.FileName) || !file.FileName.Contains('.'))
                    return BadRequest(new { message = "Invalid file!" });

                var fileInfo = _fileService.GetFileInfo(fileName: file.FileName, fileLanding: file.AttachmentPath);

                if (!fileInfo.IsFileValid()) return BadRequest(new { message = "Invalid file info!" });

                return File(await _fileService.Download(fileInfo), fileInfo.ContentType, file.FileName);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }


}