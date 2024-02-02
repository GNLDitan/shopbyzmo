using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public interface IResetToken
    {
        int Id { get; set; }
        string RecipientEmail { get; set; }
        string Token { get; set; }
        DateTimeOffset ExpirationDate { get; set; }
        bool IsClaimed { get; set; }
        int TokenType { get; set; }
        string EmailContent { get; set; }
    }

    public class ResetToken : IResetToken
    {
        public int Id { get; set; }
        public string RecipientEmail { get; set; }
        public string Token { get; set; }
        public DateTimeOffset ExpirationDate { get; set; }
        public bool IsClaimed { get; set; }
        public int TokenType { get; set; }
        public string EmailContent { get; set; }
    }
}