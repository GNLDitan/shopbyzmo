using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Dashboard
    {
        public int OutOfStock { get; set; }
        public string DelayedPayment { get; set; }
        public string OrderCount { get; set; }
        public int UserSubscribed { get; set; }
        public DashboardOrders Orders { get; set; }
        public IEnumerable<DashboardBlog> RecentBlogComment { get; set; }

        
    }
}