using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.DataProtection;
using Npgsql;
using ByzmoApi.Models;
using ByzmoApi.Helpers;


namespace ByzmoApi.DataAccess.Common
{
    public interface IFileService
    {
        void Delete(string fileName, string folderPath = null);

        Task<MemoryStream> Download(string fileName, string fileLanding = null);

        Task<MemoryStream> Download(FileMapper fileInfo);

        FileMapper GetFileInfo(string fileName, string fileLanding = null);

        Task<FileMapper> UploadFile(IFormFile file, string folderType, string filePath = null);
        string GetUrlFileName(string url);
    }

    public class FileService : BaseNpgSqlServerService, IFileService
    {
        private IDataProtector _protector;

        public FileService(INpgSqlServerRepository npgSqlServerRepository,
            IAppSettings appSettings,
            IDataProtectionProvider provider) : base(npgSqlServerRepository, appSettings)
        {
            _protector = provider.CreateProtector(GetType().FullName);
        }

        public void Delete(string fileName, string filePath = null)
        {
            if (string.IsNullOrWhiteSpace(fileName)) return;

            filePath = string.IsNullOrWhiteSpace(filePath) ? _appSettings.DefaultImagePath : filePath;

            // will not throw error as long as folder/directory exists
            File.Delete(Path.Combine(filePath, fileName));
        }

        public async Task<MemoryStream> Download(string fileName, string fileLanding = null)
        {
            var fileInfo = GetFileInfo(fileName, fileLanding);

            return await Download(fileInfo);
        }

        public async Task<MemoryStream> Download(FileMapper fileInfo)
        {
            if (!fileInfo.IsFileValid()) return null;

            var memoryStream = new MemoryStream();
            using (var fileStream = new FileStream(fileInfo.FullPath, FileMode.Open))
            {
                await fileStream.CopyToAsync(memoryStream);
            }
            memoryStream.Position = 0;
            return memoryStream;
        }

        public FileMapper GetFileInfo(string fileName, string fileLanding = null)
        {
            string filePath = null;
            switch (fileLanding)
            {
                case "attachment":
                    filePath = _appSettings.AttachmentPath;
                    break;

            }

            if (filePath == null) return null;

            var fullPath = Path.Combine(filePath, fileName);

            return new FileMapper()
            {
                FullPath = fullPath,
                ContentType = fullPath.GetFileContentType(),
                FileName = fileName,
            };
        }

        public async Task<FileMapper> UploadFile(IFormFile file, string folderType, string filePath = null)
        {
            var protectedName = _protector.Protect(file.FileName);
            var fileExtension = file.FileName.Split('.').Last();
            var fileName = protectedName + "." + fileExtension;

            filePath = string.IsNullOrWhiteSpace(filePath) ? _appSettings.DefaultImagePath : filePath;

            var oldPath = Path.Combine(filePath, file.FileName);
            var fullPath = Path.Combine(filePath, fileName);

            Directory.CreateDirectory(Path.GetDirectoryName(fullPath));

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
                var fileId = await Task.Run(() => SaveUploadedFile(oldPath, fullPath, folderType, fileName));
                return new FileMapper() { Id = fileId, FileName = fileName };
            }
        }

        private int SaveUploadedFile(string oldPath, string fullPath, string folderType, string protectedFileName)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<int>("application.uploadfile", new
                {
                    p_filename = Path.GetFileName(oldPath),
                    p_filekey = protectedFileName,
                    p_extension = Path.GetExtension(fullPath),
                    p_contenttype = oldPath.GetFileContentType(),
                    p_foldertype = folderType,
                    p_datetime = DateTimeOffset.Now
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public string GetUrlFileName(string url)
        {
            Uri uri = new Uri(url);
            return Path.GetFileName(uri.LocalPath);
        }
    }
}