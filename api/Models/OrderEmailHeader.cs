using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class OrderEmailHeader
    {
        public int Id { get; set; }
        public int StatusId { get; set; }
        public string HeaderContent { get; set; }
        public int PaymentStatusId { get; set; }
        public bool WithPreOrder { get; set; }
        public bool LayAway { get; set; }
        public bool ForPr { get; set; }
    }
}