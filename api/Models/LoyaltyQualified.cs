
using System;

namespace ByzmoApi.Models
{
    public class LoyaltyQualified
    {
        public decimal AccumulatedPurchaseAmount { get; set; }
        public decimal QualifiedDiscountId { get; set; }
        public string QualifiedDiscount { get; set; }
    }
}