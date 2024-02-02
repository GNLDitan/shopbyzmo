using System;

namespace ByzmoApi.Models
{
    public class LayAwaySchedule
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public decimal Monthly { get; set; }
        public DateTime Date { get; set; }
        public bool IsNonRefundDeposit { get; set; }
        public bool IsCleared { get; set; }
        public bool IsShipping { get; set; }
        public bool IsSendEmail { get; set; }
        public bool IsPrSend { get; set; }
        public bool IsInsurance { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public int PaymongoStatus  { get; set; }
    }
}