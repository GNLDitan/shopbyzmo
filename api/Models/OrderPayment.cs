using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class OrderPayment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public DateTimeOffset PostDate { get; set; }
        public decimal Amount { get; set; }
        public int PaymentDetailsId { get; set; }
    }
}