using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Helpers
{
    public interface IAppSettings
    {
        string[] AllowedOrigins { get; set; }
        string SitemapPath { get; set; }
        string Secret { get; set; }
        int TokenExpiration { get; set; }
        string ResetPasswordLink { get; set; }
        string ResetPasswordTemplate { get; set; }
        string UserProductNotificationTemplate { get; set; }
        string Host { get; set; }
        int SmtpPort { get; set; }
        string SmtpUsername { get; set; }
        string SmtpPassword { get; set; }
        string SenderName { get; set; }
        string ProductImagePath { get; set; }
        string LandingImagePath { get; set; }
        string BlogImagePath { get; set; }
        string AttachmentPath { get; set; }
        string DefaultImagePath { get; set; }
        string OrderTemplate { get; set; }
        string ClientOrderLink { get; set; }
        string ByzmoLink { get; set; }
        string SandBoxMerchantId { get; set; }
        string SandBoxPublicKey { get; set; }
        string SandBoxPrivateKey { get; set; }
        string ProductImageLink { get; set; }
        string ImageLogo { get; set; }
        string PaynowLink {get;set;}
        string ByzmoWebLink { get; set; }
        string OrderAdminTemplate { get; set; }
        string AdminEmail { get; set; }
        string PmPublikKey { get; set; }
        string PmSecretkKey { get; set; }
        string PaymongoApi { get; set; }
        string PmBasicAuth { get; set; }
        string ApiOrigin { get; set; }
        string AccessUserName { get; set; }
        string AccessPassword { get; set; }
        string PreOrderNotificationTemplate { get; set; }
        string ExchangeRateApi { get; set; }
        string ExchangeRateKey { get; set; }  
        string AdminNotificationTemplate { get; set; }
        string AdminPaymentTemplate { get; set; }
    }


    public class AppSettings : IAppSettings
    {
        public string[] AllowedOrigins { get; set; }
        public string SitemapPath { get; set; }
        public string Secret { get; set; }
        public int TokenExpiration { get; set; }
        public string ResetPasswordLink { get; set; }
        public string ResetPasswordTemplate { get; set; }
        public string UserProductNotificationTemplate { get; set; }
        public string Host { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUsername { get; set; }
        public string SmtpPassword { get; set; }
        public string SenderName { get; set; }
        public string ProductImagePath { get; set; }
        public string LandingImagePath { get; set; }
        public string BlogImagePath { get; set; }
        public string AttachmentPath { get; set; }
        public string DefaultImagePath { get; set; }
        public string OrderTemplate { get; set; }
        public string ClientOrderLink { get; set; }
        public string ByzmoLink { get; set; }
        public string SandBoxMerchantId { get; set; }
        public string SandBoxPublicKey { get; set; }
        public string SandBoxPrivateKey { get; set; }
        public string ProductImageLink { get; set; }
        public string ImageLogo { get; set; }
        public string PaynowLink {get;set;}
        public string ByzmoWebLink { get; set; }
        public string OrderAdminTemplate { get; set; }
        public string AdminEmail { get; set; }
        public string PmPublikKey { get; set; }
        public string PmSecretkKey { get; set; }
        public string PaymongoApi { get; set; }
        public string PmBasicAuth { get; set; }
        public string ApiOrigin { get; set; }
        public string AccessUserName { get; set; }
        public string AccessPassword { get; set; }
        public string PreOrderNotificationTemplate { get; set; }
        public string ExchangeRateApi { get; set; }
        public string ExchangeRateKey { get; set; }  
        public string AdminNotificationTemplate { get; set; }
        public string AdminPaymentTemplate { get; set; }
    }

}