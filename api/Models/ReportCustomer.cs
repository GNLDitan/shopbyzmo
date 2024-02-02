using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class ReportCustomer
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public DateTimeOffset DateCreated { get; set; }
        public int NoFulfilled { get; set; }
    }
}


