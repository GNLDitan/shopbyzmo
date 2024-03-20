using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentMethod>> GetPaymentMethodListRangeAsync(Filter filter);
        IEnumerable<PaymentMethod> GetPaymentMethodListRange(Filter filter);
        Task<PaymentMethod> CreatePaymentMethodAsync(PaymentMethod paymentMethod);
        PaymentMethod CreatePaymentMethod(PaymentMethod paymentMethod);
        Task<PaymentMethodAccount> CreatePaymentMethodAccountAsync(PaymentMethodAccount paymentMethodAccount);
        PaymentMethodAccount CreatePaymentMethodAccount(PaymentMethodAccount paymentMethodAccount);
        Task<bool> DeletePaymentMethodAccountByIdAsync(int id);
        bool DeletePaymentMethodAccountById(int id);
        Task<PaymentMethod> GetPaymentMethodByIdAsync(int id);
        PaymentMethod GetPaymentMethodById(int id);
        Task<IEnumerable<PaymentMethodAccount>> GetPaymentMethodAccountByMethodIdAsync(int methodId);
        IEnumerable<PaymentMethodAccount> GetPaymentMethodAccountByMethodId(int methodId);
        Task<PaymentMethod> UpdatePaymentMethodAsync(PaymentMethod paymentMethod);
        PaymentMethod UpdatePaymentMethod(PaymentMethod paymentMethod);
        Task<PaymentMethodAccount> UpdatePaymentMethodAccountAsync(PaymentMethodAccount paymentMethodAccount);
        PaymentMethodAccount UpdatePaymentMethodAccount(PaymentMethodAccount paymentMethodAccount);
        Task<bool> DeletePaymentMethodByIdAsync(int id);
        bool DeletePaymentMethodById(int id);
        Task<PaymentDetails> CreatePaymentDetailsAsync(PaymentDetails orderDetails);
        PaymentDetails CreatePaymentDetails(PaymentDetails orderDetails);
        Task<OrderPayment> CreateOrderPaymentAsync(OrderPayment orderPayment);
        OrderPayment CreateOrderPayment(OrderPayment orderPayment);
        Task<TransactionFees> CreateTransactionFeesAsync(TransactionFees transactionFees);
        TransactionFees CreateTransactionFees(TransactionFees transactionFees);
        Task<TransactionFees> UpdateTransactionFeesAsync(TransactionFees transactionFees);
        TransactionFees UpdateTransactionFees(TransactionFees transactionFees);
        Task<bool> DeleteTransactionFeesAsync(int id);
        bool DeleteTransactionFees(int id);
        Task<IEnumerable<TransactionFees>> GetTransactionFeesBPaymentMethodIdAsync(int id);
        IEnumerable<TransactionFees> GetTransactionFeesBPaymentMethodId(int id);
        Task<LayawayTransactionFee> CreateLayawayTransactionFeeAsync(LayawayTransactionFee transactionFee);
        LayawayTransactionFee CreateLayawayTransactionFee(LayawayTransactionFee transactionFee);
        Task<PreOrderTransactionFee> CreatePreOrderLayawayTransactionFeeAsync(PreOrderTransactionFee transactionFee);
        PreOrderTransactionFee CreatePreOrderTransactionFee(PreOrderTransactionFee transactionFee);
        Task<PaypalPayment> CreatePaypalPaymentAsync(PaypalPayment paypalPayment);
        PaypalPayment CreatePaypalPayment(PaypalPayment paypalPayment);
        Task<GCashPayment> CreateGCashPaymentAsync(GCashPayment payment);
        GCashPayment CreateGCashPayment(GCashPayment payment);
        Task<GCashPayment> GetGCashPaymentBySourceIdAsync(string sourceid);
        GCashPayment GetGCashPaymentBySourceId(string sourceid);
        Task<GCashPayment> UpdateStatusSourcetAsync(string sourceid, int status);
        GCashPayment UpdateStatusSource(string sourceid, int status);

        Task<GCashPayment> UpdateStatusSourceTotalAsync(int orderid, int productid, int status);
        GCashPayment UpdateStatusSourceTotal(int orderid, int productid, int status);
        Task<PaymentMethod> GetCreditCardMethodAsync();
        PaymentMethod GetCreditCardMethod();
        Task AddIsPaymongoAsync();
        void AddIsPaymongo();

        
    }

    public class PaymentService : BaseNpgSqlServerService, IPaymentService
    {

        public PaymentService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<IEnumerable<PaymentMethod>> GetPaymentMethodListRangeAsync(Filter filter)
        {
            return await Task.Run(() => GetPaymentMethodListRange(filter));
        }


        public IEnumerable<PaymentMethod> GetPaymentMethodListRange(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<PaymentMethod>("payment.getpaymentmethodlistrange", new
                {
                    p_offset = filter.Offset,
                    p_limit = filter.Limit
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<PaymentMethod> CreatePaymentMethodAsync(PaymentMethod paymentMethod)
        {
            return await Task.Run(() => CreatePaymentMethod(paymentMethod));
        }
        public PaymentMethod CreatePaymentMethod(PaymentMethod paymentMethod)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PaymentMethod>("payment.createpaymentmethod", new
                {
                    p_name = paymentMethod.Name,
                    p_description = paymentMethod.Description,
                    p_withaccount = paymentMethod.WithAccount,
                    p_emailinstruction = paymentMethod.EmailInstruction,
                    p_isactive = paymentMethod.IsActive,
                    p_withtransactionfee = paymentMethod.WithTransactionFee
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<PaymentMethodAccount> CreatePaymentMethodAccountAsync(PaymentMethodAccount paymentMethodAccount)
        {
            return await Task.Run(() => CreatePaymentMethodAccount(paymentMethodAccount));
        }
        public PaymentMethodAccount CreatePaymentMethodAccount(PaymentMethodAccount paymentMethodAccount)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PaymentMethodAccount>("payment.createpaymentmethodaccount", new
                {
                    p_paymentmethodid = paymentMethodAccount.PaymentMethodId,
                    p_bankname = paymentMethodAccount.BankName,
                    p_accountnumber = paymentMethodAccount.AccountNumber,
                    p_accountname = paymentMethodAccount.AccountName
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeletePaymentMethodAccountByIdAsync(int id)
        {
            return await Task.Run(() => DeletePaymentMethodAccountById(id));
        }
        public bool DeletePaymentMethodAccountById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("payment.deletepaymentmethodaccountbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<PaymentMethod> GetPaymentMethodByIdAsync(int id)
        {
            return await Task.Run(() => GetPaymentMethodById(id));
        }
        public PaymentMethod GetPaymentMethodById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PaymentMethod>("payment.getpaymentmethodbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<PaymentMethodAccount>> GetPaymentMethodAccountByMethodIdAsync(int methodId)
        {
            return await Task.Run(() => GetPaymentMethodAccountByMethodId(methodId));
        }
        public IEnumerable<PaymentMethodAccount> GetPaymentMethodAccountByMethodId(int methodId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<PaymentMethodAccount>("payment.getpaymentmethodaccountbymethodid", new
                {
                    p_methodid = methodId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<PaymentMethod> UpdatePaymentMethodAsync(PaymentMethod paymentMethod)
        {
            return await Task.Run(() => UpdatePaymentMethod(paymentMethod));
        }
        public PaymentMethod UpdatePaymentMethod(PaymentMethod paymentMethod)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PaymentMethod>("payment.updatepaymentmethod", new
                {
                    p_id = paymentMethod.Id,
                    p_name = paymentMethod.Name,
                    p_description = paymentMethod.Description,
                    p_withaccount = paymentMethod.WithAccount,
                    p_emailinstruction = paymentMethod.EmailInstruction,
                    p_withtransactionfee = paymentMethod.WithTransactionFee,
                    p_ispaymongo = paymentMethod.IsPaymongo,
                    p_isenable = paymentMethod.IsEnable
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<PaymentMethodAccount> UpdatePaymentMethodAccountAsync(PaymentMethodAccount paymentMethodAccount)
        {
            return await Task.Run(() => UpdatePaymentMethodAccount(paymentMethodAccount));
        }
        public PaymentMethodAccount UpdatePaymentMethodAccount(PaymentMethodAccount paymentMethodAccount)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PaymentMethodAccount>("payment.updatepaymentmethodaccount", new
                {
                    p_id = paymentMethodAccount.Id,
                    p_paymentmethodid = paymentMethodAccount.PaymentMethodId,
                    p_bankname = paymentMethodAccount.BankName,
                    p_accountnumber = paymentMethodAccount.AccountNumber,
                    p_accountname = paymentMethodAccount.AccountName
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeletePaymentMethodByIdAsync(int id)
        {
            return await Task.Run(() => DeletePaymentMethodById(id));
        }

        public bool DeletePaymentMethodById(int id)
        {
            try
            {
                _npgSqlServerRepository.ExecuteThenReturn<bool>("payment.deletepaymentmethodbyid", new
                {
                    p_id = id
                });
                return true;
            }
            catch
            {
                return false;
            }
        }




        public async Task<PaymentDetails> CreatePaymentDetailsAsync(PaymentDetails orderDetails)
        {
            return await Task.Run(() => CreatePaymentDetails(orderDetails));
        }


        public PaymentDetails CreatePaymentDetails(PaymentDetails orderDetails)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PaymentDetails>("payment.createpaymentdetails", new
                {
                    p_orderid = orderDetails.OrderId,
                    p_paymentmethod = orderDetails.PaymentMethod,
                    p_paymentid = orderDetails.PaymentId,
                    p_paypalpaymentid = orderDetails.PaypalPaymentId,
                    p_paypalpayerid = orderDetails.PaypalPayerId,
                    p_paypaldebugid = orderDetails.PaypalDebugId,
                    p_graphqlid = orderDetails.graphQLId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<OrderPayment> CreateOrderPaymentAsync(OrderPayment orderPayment)
        {
            return await Task.Run(() => CreateOrderPayment(orderPayment));
        }


        public OrderPayment CreateOrderPayment(OrderPayment orderPayment)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<OrderPayment>("payment.createorderpayment", new
                {
                    p_orderid = orderPayment.OrderId,
                    p_productid = orderPayment.ProductId,
                    p_amount = orderPayment.Amount,
                    p_paymentdetailsid = orderPayment.PaymentDetailsId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<TransactionFees> CreateTransactionFeesAsync(TransactionFees transactionFees)
        {
            return await Task.Run(() => CreateTransactionFees(transactionFees));
        }


        public TransactionFees CreateTransactionFees(TransactionFees transactionFees)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<TransactionFees>("payment.createtransactionfees", new
                {
                    p_paymentmethodid = transactionFees.PaymentMethodId,
                    p_description = transactionFees.Description,
                    p_amounttypeid = transactionFees.AmountTypeId,
                    p_amount = transactionFees.Amount
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<TransactionFees> UpdateTransactionFeesAsync(TransactionFees transactionFees)
        {
            return await Task.Run(() => UpdateTransactionFees(transactionFees));
        }


        public TransactionFees UpdateTransactionFees(TransactionFees transactionFees)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<TransactionFees>("payment.updatetransactionfees", new
                {
                    p_id = transactionFees.Id,
                    p_paymentmethodid = transactionFees.PaymentMethodId,
                    p_description = transactionFees.Description,
                    p_amounttypeid = transactionFees.AmountTypeId,
                    p_amount = transactionFees.Amount
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<bool> DeleteTransactionFeesAsync(int id)
        {
            return await Task.Run(() => DeleteTransactionFees(id));
        }


        public bool DeleteTransactionFees(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("payment.deletetransactionfees", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<TransactionFees>> GetTransactionFeesBPaymentMethodIdAsync(int id)
        {
            return await Task.Run(() => GetTransactionFeesBPaymentMethodId(id));
        }


        public IEnumerable<TransactionFees> GetTransactionFeesBPaymentMethodId(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<TransactionFees>("payment.gettransactionfeesbypaymentmethodid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<LayawayTransactionFee> CreateLayawayTransactionFeeAsync(LayawayTransactionFee layawayTransactionFee)
        {
            return await Task.Run(() => CreateLayawayTransactionFee(layawayTransactionFee));
        }

        public LayawayTransactionFee CreateLayawayTransactionFee(LayawayTransactionFee layawayTransactionFee)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LayawayTransactionFee>("orders.createlayawaytransaction", new
                {
                    p_orderid = layawayTransactionFee.OrderId,
                    p_productid = layawayTransactionFee.ProductId,
                    p_layawayid = layawayTransactionFee.LayawayId,
                    p_transactionfee = layawayTransactionFee.Amount
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<PreOrderTransactionFee> CreatePreOrderLayawayTransactionFeeAsync(PreOrderTransactionFee transactionFee)
        {
            return await Task.Run(() => CreatePreOrderTransactionFee(transactionFee));
        }

        public PreOrderTransactionFee CreatePreOrderTransactionFee(PreOrderTransactionFee transactionFee)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PreOrderTransactionFee>("orders.createpreordertransaction", new
                {
                    p_orderid = transactionFee.OrderId,
                    p_productid = transactionFee.ProductId,
                    p_preorderid = transactionFee.PreorderId,
                    p_transactionfee = transactionFee.Amount
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<PaypalPayment> CreatePaypalPaymentAsync(PaypalPayment paypalPayment)
        {
            return await Task.Run(() => CreatePaypalPayment(paypalPayment));
        }

        public PaypalPayment CreatePaypalPayment(PaypalPayment paypalPayment)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PaypalPayment>("payment.createpaypalpayment", new
                {
                    p_paymentdetailsid = paypalPayment.paymentDetailsId,
                    p_createtime = paypalPayment.CreateTime,
                    p_paypalid = paypalPayment.PaypalId,
                    p_intent = paypalPayment.Intent,
                    p_state = paypalPayment.State,
                    p_payerid = paypalPayment.PayerId,
                    p_paymentmethod = paypalPayment.PaymentMethod
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<GCashPayment> CreateGCashPaymentAsync(GCashPayment payment)
        {
            return await Task.Run(() => CreateGCashPayment(payment));
        }

        public GCashPayment CreateGCashPayment(GCashPayment payment)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<GCashPayment>("payment.creategcashpayment", new
                {
                    p_sourceid = payment.SourceId,
                    p_paymentid = payment.PaymentId,
                    p_orderid = payment.OrderId,
                    p_paymenttype = payment.PaymentType,
                    p_refid = payment.RefId,
                    p_istotal = payment.IsTotal,
                    p_productid = payment.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<GCashPayment> GetGCashPaymentBySourceIdAsync(string sourceid)
        {
            return await Task.Run(() => GetGCashPaymentBySourceId(sourceid));
        }

        public GCashPayment GetGCashPaymentBySourceId(string sourceid)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<GCashPayment>("payment.getgcashpaymentbysourceid", new
                {
                    p_sourceid = sourceid
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<GCashPayment> UpdateStatusSourcetAsync(string sourceid, int status)
        {
            return await Task.Run(() => UpdateStatusSource(sourceid, status));
        }

        public GCashPayment UpdateStatusSource(string sourceid, int status)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<GCashPayment>("payment.updatestatussource", new
                {
                    p_sourceid = sourceid,
                    p_status = status
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<GCashPayment> UpdateStatusSourceTotalAsync(int orderid, int productid, int status)
        {
            return await Task.Run(() => UpdateStatusSourceTotal(orderid, productid, status));
        }

        public GCashPayment UpdateStatusSourceTotal(int orderid, int productid, int status)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<GCashPayment>("payment.updatestatussource", new
                {
                    p_sourceid = orderid,
                    p_productid = productid,
                    p_status = status
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<PaymentMethod> GetCreditCardMethodAsync()
        {
            return await Task.Run(() => GetCreditCardMethod());
        }

        public PaymentMethod GetCreditCardMethod()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PaymentMethod>("payment.getpaymentmethodcreditcard");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task AddIsPaymongoAsync()
        {
           await Task.Run(() => AddIsPaymongo());
        }

        public void AddIsPaymongo()
        {
            try
            {
                 _npgSqlServerRepository.Execute(@"
                    CREATE OR REPLACE VIEW payment.paymentmethodview AS
                    SELECT p.id,
                        p.name,
                        p.description,
                        p.withaccount,
                        p.emailinstruction,
                        p.isactive,
                        p.withtransactionfee,
                        p.ispaymongo,
                        p.isenable
                    FROM payment.paymentmethod p;
                 ");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
    }
}