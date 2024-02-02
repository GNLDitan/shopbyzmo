using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class ShippingSpecialItemCost
    {
        public int Id { get; set; }
        public int ShippingId { get; set; }
        public int FromCount { get; set; }
        public int ToCount { get; set; }
        public decimal Amount { get; set; }
    }

}