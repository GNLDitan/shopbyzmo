using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Filter
    {
        //product
        public string ProductName { get; set; }
        public string BlogName { get; set; }
        public string ProductDescription { get; set; }
        public IEnumerable<string> Category { get; set; }
        public string ItemNumber { get; set; }
        public string Tag { get; set; }

        public int Offset { get; set; }
        public int Limit { get; set; }

        public string Sort { get; set; }
        public bool ForAdmin { get; set; }
        public string SearchInput { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public int StatusId { get; set; }
        public bool WithDateRange { get; set; }

        public int ProductId { get; set; }
        public int PaymentStatusId { get; set; }
        public int PaymentMethodId { get; set; }
        public int ShippingMethodId { get; set; }
        public string Name { get; set; }

        public string CategoryFilter { get; set; }
        public int ProductType { get; set; }
        public int ProductSort { get; set; }
        public int StockFilter { get; set; }

        //filterConditions
        public bool ForLanding { get; set; }
        public bool ForProductList { get; set; }
        public IEnumerable<string> Tags { get; set; }
        public bool isRushFee { get; set; }
    }
}
