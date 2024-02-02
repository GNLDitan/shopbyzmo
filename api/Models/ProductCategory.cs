using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class ProductCategory
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Category { get; set; }
        public string CategoryHierarchy { get; set; }
        public string ParentCategory { get; set; }
        public int RowNumber {get ;set; }
        public int ListRowNumber {get;set;}
        public int MoveTypeId {get;set;}
        public bool IsChangeHierarchy { get; set ;}
        public int ParentRowNumber { get; set ; }
    }
}