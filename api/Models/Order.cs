using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int OrderNumber { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTimeOffset DateOrder { get; set; }
        public int ShippingId { get; set; }
        public int PaymentStatusId { get; set; }
        public int StatusId { get; set; }
        public string CustomerName { get; set; }
        public string Email { get; set; }
        public decimal Amount { get; set; }
        public bool LayAway { get; set; }
        public string ShippingAddress { get; set; }
        public ShippingDetails ShippingDetails { get; set; }
        public string PaymentMethodDescription { get; set; }
        public string PaymentMethodName { get; set; }
        public IEnumerable<Cart> OrderCart { get; set; }
        public string TrackingNumber { get; set; }
        public DateTimeOffset ShippingDate { get; set; }
        public string IpAddress { get; set; }
        public bool WithPreOrder { get; set; }
        public OrderReason OrderReason { get; set; }
        public string Reason { get; set; }
        public IEnumerable<OrderAttachment> OrderAttachment { get; set; }
        public IEnumerable<OrderEmailStatus> OrderEmailStatus { get; set; }
        public string SecurityId { get; set; }
        public bool IsEmailSubscribe { get; set; }
        public int PaymongoStatus  { get; set; }
        //for email
        public decimal AmountToPay { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal InsuranceFee { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal TransactionFee { get; set; }
        public decimal FinalAmount { get; set; }

        public bool ForLayAway { get; set; }
        public int LayAwayId { get; set; }
        public bool IsSendEmail { get; set; }
        public bool ForPreOrder { get; set; }
        public int PreOrderId { get; set; }
        public bool IsPrSend { get; set; }
        public bool ForPr { get; set; }
        public IEnumerable<OrderEmailHeader> OrderEmailHeader { get; set; }
        public bool ForPreOrderNotif { get; set; }
        public Product NotifProduct { get; set; }
    }
}