using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Shipping
    {
        public int Id { get; set; }
        public string ShippingName { get; set; }
        public string TrackingUrl { get; set; }
        public string Description { get; set; }
        public decimal Rate { get; set; }
        public int CurrencyId { get; set; }
        public bool IsActive { get; set; }
        public bool isSelected { get; set; }
        public bool HasAdditionRate { get; set; }
        public IEnumerable<ShippingSpecialItemCost> ShippingSpecialItemCost { get; set; }
        public bool HasInsurance { get; set; }
        public decimal EveryAmount { get; set; }
        public decimal InsuranceFee { get; set; }
        public bool ApplyInsurance { get; set; }
        public bool IsInternational { get; set; }
        
    }
}