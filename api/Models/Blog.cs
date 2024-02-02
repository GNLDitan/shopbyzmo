using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Blog
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public bool AllDay { get; set; }
        public int CoverId { get; set; }
        public string CoverFileName { get; set; }
        public bool IsActive { get; set; }
        public IEnumerable<BlogContent> BlogContents { get; set; }
        public IEnumerable<Tag> Tags { get; set; }
        public bool IsDraft { get; set; }
        public string TitleUrl { get; set; }
    }
}