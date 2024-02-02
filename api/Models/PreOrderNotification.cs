using System;

namespace ByzmoApi.Models
{
    public class PreOrderNotification
    {
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string CustomerName { get; set; }
        public string Email { get; set; }
    }
}