using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class UserWishlist
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
    }

}