using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Report
    {
        public int OrderId { get; set; }
        public DateTimeOffset OrderDate { get; set; }
        public string CompleteName { get; set; }
        public string Email { get; set; }
        public int StatusId { get; set; }
        public decimal Total { get; set; }
        public decimal Balance { get; set; }
        public bool IsSendEmail { get; set; }
        public DateTimeOffset ShippingDate { get; set; }
        public string TrackingNumber { get; set; }
        public string InvoiceNumber { get; set; }
        public string DiscountCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal PaymentStatusId { get; set; }
        public IEnumerable<Product> Products { get; set; }
        public DateTimeOffset DueDate {get; set;}
        public bool HasRushFee {get; set;}
        public string PaymentStatus { get; set; }
        
    }
}