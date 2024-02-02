using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class UserProductNotification
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public int ProductId { get; set; }
        public bool IsSend { get; set; }
        public DateTimeOffset DateAdded { get; set; }
    }

}