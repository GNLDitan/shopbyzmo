using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Currency
    {
        public string Base_Code { get; set; }
        public CurrencyRates Conversion_Rates { get; set; }
        public string Json_Rates { get; set; }
    }
}