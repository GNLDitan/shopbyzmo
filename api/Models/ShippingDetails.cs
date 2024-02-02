using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ByzmoApi.Models
{
    public class ShippingDetails
    {
        public int Id { get; set; }
        public string CompleteName { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public string Address { get; set; }
        public string Barangay { get; set; }
        public string City { get; set; }
        public string Province { get; set; }
        public string ZipCode { get; set; }
        public string Country { get; set; }
        public string CountryCode { get; set; }
        public string SpecialInstruction { get; set; }
        public int ShippingMethod { get; set; }
        public string ShippingMethodDescription { get; set; }
        public int PaymentMethod { get; set; }
        public string DiscountCode { get; set; }
        public decimal SubTotal { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal Total { get; set; }
        public int UserId { get; set; }
        public decimal Rate { get; set; }
        public decimal AmountToPay { get; set; }
        public string TrackingUrl { get; set; }
        public Discount Discount { get; set; }
        public decimal DiscountAmount { get; set; }
        public string EmailInstruction { get; set; }
        public string ShippingName { get; set; }
        public decimal TransactionFee { get; set; }
        public decimal FinalAmount { get; set; }
        public string BillingAddress { get; set; }
        public string States { get; set; }
        public string Prefecture { get; set; }
        public string PostalCode { get; set; }
        public string NumCode {get;set;}
        public bool IsEmailSubscribe  { get; set; }
        public string BaseCurrency  { get; set; }
        public decimal CurrencyRate { get; set; }
        public decimal InsuranceFee { get; set; }
        public string FacebookName { get; set; }
        public string PaymentMethodDescription { get; set; }
    }
}
