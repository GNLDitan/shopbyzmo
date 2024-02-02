using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class PaymentMethodAccount
    {
        public int Id { get; set; }
        public int PaymentMethodId { get; set; }
        public string BankName { get; set; }
        public decimal AccountNumber { get; set; }
        public string AccountName { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsNew { get; set; }
    }
}