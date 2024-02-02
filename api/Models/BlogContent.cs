using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class BlogContent
    {
        public int Id { get; set; }
        public int BlogId { get; set; }
        public string HeaderText { get; set; }
        public string Description { get; set; }
        public int TypeId { get; set; }
        public int SortId { get; set; }
        public IEnumerable<BlogImage> ContentImages { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsNew { get; set; }
        public string VideoLink { get; set; }
    }
}