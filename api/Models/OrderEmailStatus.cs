using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class OrderEmailStatus
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string EmailAddress { get; set; }
        public int OrderStatusId { get; set; }
        public DateTimeOffset DateTime { get; set; }

    }
}