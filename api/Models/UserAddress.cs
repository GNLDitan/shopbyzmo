using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class UserAddress
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Address { get; set; }
        public string Barangay { get; set; }
        public string City { get; set; }
        public string Province { get; set; }
        public string CountryCode { get; set; }
        public string ZipCode { get; set; }
        public bool IsDefault { get; set; }
        public string PostalCode { get; set; }
        public string Prefecture { get; set; }
        public string States { get; set; }
    }

}