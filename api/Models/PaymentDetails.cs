using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class PaymentDetails
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentId { get; set; }
        public string PaypalPaymentId { get; set; }
        public string PaypalPayerId { get; set; }
        public string PaypalDebugId { get; set; }
        public string graphQLId { get; set; }
        public int LayAwayId { get; set; }
        public int PreOrderId { get; set; }
        public decimal AmountPaid { get; set; }
        public bool IsTotal { get; set; }
        public bool WithTransactionFee { get; set; }
        public LoyaltyPayment LoyaltyPayment { get; set; }
        public LayawayTransactionFee LayawayTransactionFee { get; set; }
        public PreOrderTransactionFee PreOrderTransactionFee { get; set; }
        public PaypalPayment PaypalPayment { get; set; }

    }
}