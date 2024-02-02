using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class UserSubscription
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public DateTimeOffset DateCreated { get; set; }
    }

}