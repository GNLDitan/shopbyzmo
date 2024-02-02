using System;

namespace ByzmoApi.Models
{
    public class PreOrderSchedule
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string PaymentTerm { get; set; }
        public string PaymentTermDesc { get; set; }
        public decimal Amount { get; set; }
        public bool IsCleared { get; set; }
        public bool IsSendEmail { get; set; }
        public bool IsPrSend { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public int PaymongoStatus  { get; set; }
    }
}