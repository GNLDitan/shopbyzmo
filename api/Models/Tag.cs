using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Key { get; set; }
        public int ProductId { get; set; }
    }

}