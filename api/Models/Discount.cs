using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Discount
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int AmountTypeId { get; set; }
        public decimal Amount { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsOneTimeUse { get; set; }
        public bool IsClaimed { get; set; }

        
    }
}