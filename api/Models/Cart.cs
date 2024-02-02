using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Cart
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public int Quantity { get; set; }
        public DateTimeOffset DateTime { get; set; }
        public bool IsActive { get; set; }
        public bool isLayAway { get; set; }
        public LayAway Layaway { get; set; }
        public int DatesOfPayment { get; set; }
        public int NumberOfInstallment { get; set; }
        public string IpAddress { get; set; }

        public decimal TotalPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentDates { get; set; }
        public IEnumerable<LayAwaySchedule> LayAwaySchedule { get; set; }

        public IEnumerable<PreOrderSchedule> PreOrderSchedule { get; set; }

        public decimal Price { get; set; }
        public bool OnSale { get; set; }
        public decimal SalesPrice { get; set; }
        public bool PreOrder { get; set; }
        public decimal OrigPrice {get;set;}


        public bool HasRushFee { get; set; }
        public decimal RushFee { get; set; }
        public bool PreOrderLayaway { get; set; }
        public bool IsNotifSend { get; set; }
        
    }
}