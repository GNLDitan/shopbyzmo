using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class OrderReason
    {
        public int Id { get; set; }
        public string Reason { get; set; }
        public int OrderId { get; set; }

    }
}