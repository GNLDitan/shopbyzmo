using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using ByzmoApi.DataAccess;
using System.Threading.Tasks;
using ByzmoApi.Helpers;

namespace ByzmoApi.DataAccess.Common
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string recipientEmail, string name, string subject, string emailBody);
        bool SendEmail(string recipientEmail, string name, string subject, string emailBody);
    }
    public class EmailService : BaseNpgSqlServerService, IEmailService
    {

        public EmailService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }
        public async Task<bool> SendEmailAsync(string recipientEmail, string name, string subject, string emailBody)
        {
            return await Task.Run(() => SendEmail(recipientEmail, name, subject, emailBody));
        }
        public bool SendEmail(string recipientEmail, string name, string subject, string emailBody)
        {
            if (recipientEmail.IsEmailValid())
            {
                var mail = new MailMessage()
                {
                    From = new MailAddress(_appSettings.SmtpUsername, _appSettings.SenderName),
                    Subject = subject,
                    IsBodyHtml = true,
                    Body = emailBody,
                    BodyEncoding = Encoding.UTF8,
                    SubjectEncoding = Encoding.Default
                };
                mail.To.Add(new MailAddress(recipientEmail, name));

                using (var client = new SmtpClient())
                {
                    var credentials = new NetworkCredential(_appSettings.SmtpUsername, _appSettings.SmtpPassword);

                    client.Host = _appSettings.Host;
                    client.Port = _appSettings.SmtpPort;
                    client.UseDefaultCredentials = false;
                    client.Credentials = credentials;
                    client.EnableSsl = true;
                    client.Send(mail);

                }
            }
            return true;
        }
    }
}