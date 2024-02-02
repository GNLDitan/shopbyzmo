using System;

namespace ByzmoApi.Models
{
    public class PaypalPayment
    {
        public int Id { get; set; }
        public int paymentDetailsId { get; set; }
        public string Cart { get; set; }
        public DateTimeOffset CreateTime { get; set; }
        public string PaypalId { get; set; }
        public string Intent { get; set; }
        public string State { get; set; }
        public string PayerId { get; set; }
        public string PaymentMethod { get; set; }


    }
}

