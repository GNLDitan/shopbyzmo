
using System;

namespace ByzmoApi.Models
{
    public class LoyaltyVoucher
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Email { get; set; }
        public string DiscountCode { get; set; }
        public bool IsLifeTime { get; set; }
        public int LoyaltyDiscountId { get; set; }
        public bool IsClaimed { get; set; }
        public bool IsActive { get; set; }
        public LoyaltyDiscount LoyaltyDiscount { get; set; }
    }
}