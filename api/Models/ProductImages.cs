using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class ProductImages
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int FileStorageId { get; set; }
        public string FileName { get; set; }
        public bool IsDefaultImage { get; set; }

    }
}