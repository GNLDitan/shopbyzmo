using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class GCashPayment
    {
        public string Id { get; set; }
        public string SourceId { get; set; }
        public string PaymentId { get; set; }
        public int OrderId { get; set; }
        public string PaymentType { get; set; }
        public int RefId { get; set; }
        public bool IsTotal { get; set; }
        public DateTimeOffset CreateTime { get; set; }
        public int Status { get; set; }
        public int ProductId { get; set; }

    }
}