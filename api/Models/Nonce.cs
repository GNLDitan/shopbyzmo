public class NonceKey
{
    public string Nonce { get; set; }
    public decimal ChargeAmount { get; set; }
    public string MerchantAccountId { get; set; }
    public NonceKey(string Nonce)
    {
        this.Nonce = Nonce;
        this.ChargeAmount = ChargeAmount;
        this.MerchantAccountId = MerchantAccountId;
    }
}