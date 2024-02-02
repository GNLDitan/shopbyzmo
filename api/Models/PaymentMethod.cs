using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class PaymentMethod
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool WithAccount { get; set; }
        public string EmailInstruction { get; set; }
        public IEnumerable<PaymentMethodAccount> PaymentMethodAccounts { get; set; }
        public bool IsActive { get; set; }
        public bool isSelected { get; set; }
        public bool WithTransactionFee { get; set; }
        public IEnumerable<TransactionFees> TransactionFee { get; set; }
        public bool HasMinimumAmount { get; set; }
        public bool IsPaymongo { get; set; }
    }
}