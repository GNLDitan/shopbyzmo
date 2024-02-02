
using System.Collections.Generic;

namespace ByzmoApi.Models
{
    public class LoyaltyDiscount
    {
        public int Id { get; set; }
        public string TierLevel { get; set; }
        public decimal RangeFrom { get; set; }
        public int RangeFromCurrencyType { get; set; }
        public decimal RangeTo { get; set; }
        public int RangeToCurrencyType { get; set; }
        public decimal Discount { get; set; }
        public int DiscountAmountType { get; set; }
        public bool IsLifeTime { get; set; }

    }
}