using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;
using ByzmoApi.Models;
using System.IO;
using System.Text;
namespace ByzmoApi.Helpers
{
    public static class FileExtension
    {
        public static string ReadAllText(this string fullPath)
        {
            return File.ReadAllText(fullPath, Encoding.UTF8);
        }

        public static string GetFileContentType(this string fullPath)
        {
            var mimeTypes = new Dictionary<string, string>
            {
                {".txt", "text/plain"},
                {".pdf", "application/pdf"},
                {".doc", "application/vnd.ms-word"},
                {".docx", "application/vnd.ms-word"},
                {".xls", "application/vnd.ms-excel"},
                {".xlsx", "application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet"},
                {".png", "image/png"},
                {".jpg", "image/jpeg"},
                {".jpeg", "image/jpeg"},
                {".gif", "image/gif"},
                {".csv", "text/csv"},
                {".jfif", "image/jfif"}
            };

            var fileExtension = Path.GetExtension(fullPath).ToLowerInvariant();

            return mimeTypes[fileExtension];
        }

        public static bool InvalidDate(this DateTime dateTimeValue)
        {
            return dateTimeValue == null || dateTimeValue.Year == DateTime.MinValue.Year;
        }

        public static bool IsFileValid(this FileMapper file)
        {
            return file != null || !string.IsNullOrWhiteSpace(file.FileName) || !string.IsNullOrWhiteSpace(file.ContentType) || !string.IsNullOrWhiteSpace(file.FullPath);
        }
    }
    public static class EmailExtension
    {
        public static bool IsEmailValid(this string email)
        {
            string outValue;
            return IsEmailValid(email, out outValue);
        }

        public static bool IsEmailValid(string email, out string invalidParameterName)
        {
            invalidParameterName = "";

            if (email == null)
            {
                invalidParameterName = "Email object";
                return false;
            }


            if (email.Length <= 0)
            {
                invalidParameterName = "NoRecipientAddress";
                return false;
            }
            return true;
        }
    }
}