using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class OrderProductRate
    {
        public int Id { get; set; }
        public string Comment { get; set; }
        public int Rate { get; set; }
        public int ProductId { get; set; }
        public int OrderId { get; set; }
        public int ActiveUser { get; set; }
        public int ParentId { get; set; }
        public string Name { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
    }
}
