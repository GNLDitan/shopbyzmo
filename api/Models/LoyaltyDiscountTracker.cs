using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class LoyaltyDiscountTracker
    {
        public string DiscountCode { get; set; }
        public string Availed { get; set; }
        public string OrderId { get; set; }
    }
}