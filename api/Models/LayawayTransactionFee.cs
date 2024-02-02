using System;

namespace ByzmoApi.Models
{
    public class LayawayTransactionFee
    {
        public int Id { get; set; }
        public int OrderId  { get; set; }
        public int ProductId  { get; set; }
        public int LayawayId { get; set; }
        public decimal Amount { get; set; }
    }

}
