using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class BlogComment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int BlogId { get; set; }
        public string CommentContent { get; set; }
        public int ParentId { get; set; }
        public int CommentId { get; set; }
        public int FromUserId { get; set; }
        public DateTimeOffset DateTime { get; set; }
        public int GroupId { get; set; }
    }
}


