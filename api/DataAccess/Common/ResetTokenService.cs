using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using ByzmoApi.Helpers;
using ByzmoApi.DataAccess;
using ByzmoApi.Models;
using ByzmoApi.DataAccess.Common;

namespace ByzmoApi.DataAccess.Common
{
    public interface IResetTokenService
    {

        ResetToken Create(ResetToken resetTokenParam);
        bool IsTokenValid(ResetToken resetTokenParam);
        string GenerateToken(int length);

        // ResetToken Update(ResetToken resetTokenParam);
    }

    public class ResetTokenService : IResetTokenService
    {
        public ResetToken Create(ResetToken resetTokenParam)
        {
            if (resetTokenParam == null || string.IsNullOrWhiteSpace(resetTokenParam.Token) || string.IsNullOrWhiteSpace(resetTokenParam.RecipientEmail)) 

            resetTokenParam.Id = 0;
            resetTokenParam.IsClaimed = false;

            return resetTokenParam;
        }

        public bool IsTokenValid(ResetToken resetTokenParam)
        {
            if (resetTokenParam == null || resetTokenParam.IsClaimed || DateTime.UtcNow > resetTokenParam.ExpirationDate) return false;

            return !resetTokenParam.IsClaimed;
        }

        public string GenerateToken(int length)
        {
            const string characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_";
            StringBuilder res = new StringBuilder();
            using (RNGCryptoServiceProvider provider = new RNGCryptoServiceProvider())
            {
                byte[] data = new byte[sizeof(uint)];

                while (length-- > 0)
                {
                    provider.GetBytes(data);
                    uint num = BitConverter.ToUInt32(data, 0);
                    res.Append(characters[(int)(num % (uint)characters.Length)]);
                }
                return res.ToString();
            }
        }

    }
}