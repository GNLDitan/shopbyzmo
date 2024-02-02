using System;

namespace ByzmoApi.Models
{
    public class PreOrderTransactionFee
    {
        public int Id { get; set; }
        public int OrderId  { get; set; }
        public int ProductId  { get; set; }
        public int PreorderId { get; set; }
        public decimal Amount { get; set; }
    }

}
