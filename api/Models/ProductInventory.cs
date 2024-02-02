using System;

namespace ByzmoApi.Models
{
    public class ProductInventory
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public DateTimeOffset DeliveryDate { get; set; }
        public int Quantity { get; set; }
        public DateTimeOffset DateCreated { get; set; }
        public DateTimeOffset? DateModified { get; set; }
        public int OrderNumber { get; set; }
        public int StatusId { get; set; }
        public int PaymentStatusId { get; set; }
    }
}
