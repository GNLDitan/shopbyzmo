using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string ItemNumber { get; set; }
        public string Category { get; set; }
        public string ProductName { get; set; }
        public string ProductDescription { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public bool Isactive { get; set; }
        public string CurrentImageUrl { get; set; }
        public string IsDefaultImage { get; set; }
        public IEnumerable<Tag> Tags { get; set; }
        public IEnumerable<ProductImages> ProductImages { get; set; }
        public string LinkName { get; set; }
        public bool OnSale { get; set; }
        public decimal SalesPrice { get; set; }
        public bool PreOrder { get; set; }
        public bool isLayAway { get; set; }
        public decimal PreOrderDepositAmount { get; set; }
        public decimal CostPrice { get; set; }
        public bool HasRushFee { get; set; }
        public decimal RushFee { get; set; }
        public decimal Sorting {get;set;}
        public bool IsDeleted { get; set; }
        public bool PreOrderLayaway { get; set; }
        public int Rates { get; set; }
        public IEnumerable<OrderProductRate> OrderProductRates { get; set; }
        
    }
}
