using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class DashboardOrders
    {
        public int Unfulfilled { get; set; }
        public int Processing { get; set; }
        public int Shipped { get; set; }
        public int Fulfilled { get; set; }
        public int Cancelled { get; set; }

        
    }
}