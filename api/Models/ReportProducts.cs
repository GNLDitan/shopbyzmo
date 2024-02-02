using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class ReportProducts
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string itemNumber { get; set; }
        public decimal Price { get; set; }
        public decimal SalePrice { get; set; }
        public decimal PreOrderDepositAmount { get; set; }
        public decimal RemainingQuantity { get; set; }
        public int NoOfSale { get; set; }
        public string Tags { get; set; }
        public decimal RushFee { get; set; }
        public decimal CostPrice { get; set; }
        public int Notif { get; set; }
    }
}
