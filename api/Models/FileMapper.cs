using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class FileMapper
    {
        public int Id { get; set; }
        public int Key { get; set; }
        public string FileName { get; set; }
        public string ImageType { get; set; }
        public string ContentType { get; set; }
        public string FullPath { get; set; }
        public int OrderId { get; set; }
        public string AttachmentPath { get; set; }
        //for landing
        public string Url { get; set; }
        public int MoveTypeId { get; set; }
        public Boolean IsNewTab { get; set; }
    }
}