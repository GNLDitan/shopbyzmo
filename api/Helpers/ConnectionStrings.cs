using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Helpers
{
    public interface IConnectionStrings
    {
        string DefaultConnection { get; set; }
        string ByzmoConnection { get; set; }
    }

    public class ConnectionStrings : IConnectionStrings
    {
        public string DefaultConnection { get; set; }
        public string ByzmoConnection { get; set; }
    }


}