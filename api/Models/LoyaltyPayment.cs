
using System;

namespace ByzmoApi.Models
{
    public class LoyaltyPayment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string Email { get; set; }
        public DateTimeOffset PostDate { get; set; }
        public decimal Amount { get; set; }
    }
}