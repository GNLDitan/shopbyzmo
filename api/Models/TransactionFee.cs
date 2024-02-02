using System;

namespace ByzmoApi.Models
{
    public class TransactionFees
    {
        public int Id { get; set; }
        public int PaymentMethodId { get; set; }
        public string Description { get; set; }
        public int AmountTypeId { get; set; }
        public decimal Amount { get; set; }
    }

}
