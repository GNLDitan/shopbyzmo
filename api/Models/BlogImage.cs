using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class BlogImage
    {
        public int Id { get; set; }
        public int BlogContentId { get; set; }
        public int FileStorageId { get; set; }
        public string FileName { get; set; }
    }
}