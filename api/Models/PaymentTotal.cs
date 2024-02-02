
using System;

namespace ByzmoApi.Models
{
    public class PaymentTotal
    {
        public int OrderId { get; set; }

        public int ProductId { get; set; }
        public string PaymentType { get; set; }
        public decimal Amount { get; set; }
        public string SecurityId { get; set; }
        public string ProductName { get; set; }
        public int ProductType { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
    }
}