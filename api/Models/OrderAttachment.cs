using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class OrderAttachment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int LayawayId { get; set; }
        public int FileStorageId { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public bool IsForLayaway { get; set; }
        public int Key { get; set; }
        public bool IsForPreOrder {get;set;}
        public int PreOrderId {get;set;}
    }
}