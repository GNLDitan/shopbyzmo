using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class LoyaltyDiscountTrackerReport
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public int UserId { get; set; }
        public string DiscountCode { get; set; }
        public string TierLevel { get; set; }
        public decimal AccumulatedPurchaseAmount { get; set; }
        public decimal LoyaltyId { get; set; }
        public IEnumerable<LoyaltyDiscountTracker> loyaltyDiscountTracker { get; set; }
    }
}