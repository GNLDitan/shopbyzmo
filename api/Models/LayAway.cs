
using System.Collections.Generic;

namespace ByzmoApi.Models
{
    public class LayAway
    {
        //product
        public int Id { get; set; }
        public string Description { get; set; }
        public int DatesOfPayment { get; set; }
        public int MaxNumberOfInstallmentPayment { get; set; }
        public decimal PercentOfNonRefundDeposit { get; set; }
        public bool isActive { get; set; }
    }
}