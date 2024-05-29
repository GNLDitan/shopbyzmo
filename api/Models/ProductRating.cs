using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class ProductRating
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int ProductId { get; set; }
        public int OrderId { get; set; }
        public string Comment { get; set; }
        public int ParentId { get; set; }
        public int FromUserId { get; set; }
        public DateTimeOffset DateTime { get; set; }
        public int GroupId { get; set; }
    }
}

