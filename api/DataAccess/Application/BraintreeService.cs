using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;
using Braintree;
using System;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IBrainTreeService
    {
        Task<ClientToken> GetClientTokenAsync();
        ClientToken GetClientToken();

        Task<Result<Transaction>> CreatePurchaseAsync(NonceKey cart);
        Result<Transaction> CreatePurchase(NonceKey cart);
    }

    public class BrainTreeService : BaseBrainTree, IBrainTreeService
    {
        public BrainTreeService(IAppSettings appSettings) : base(appSettings)
        {

        }

        public async Task<ClientToken> GetClientTokenAsync()
        {
            return await Task.Run(() => GetClientToken());
        }

        public ClientToken GetClientToken()
        {
            try
            {

                var clientToken = _braintreeGateway.ClientToken.Generate();
                ClientToken ct = new ClientToken(clientToken);
                return ct;

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<Result<Transaction>> CreatePurchaseAsync(NonceKey nonce)
        {
            return await Task.Run(() => CreatePurchase(nonce));
        }
        public Result<Transaction> CreatePurchase(NonceKey nonce)
        {
            try
            {

                var request = new TransactionRequest
                {
                    Amount = nonce.ChargeAmount,
                    PaymentMethodNonce = nonce.Nonce,
                    MerchantAccountId = nonce.MerchantAccountId,
                    Options = new TransactionOptionsRequest
                    {
                        SubmitForSettlement = true
                    }
                };

                Result<Transaction> result = _braintreeGateway.Transaction.Sale(request);

                return result;

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}