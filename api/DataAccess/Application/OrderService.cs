using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetOrderListRangeAsync(Filter filter);
        IEnumerable<Order> GetOrderListRange(Filter filter);
        Task<Order> CreateOrderDetailAsync(Order orderDetails);
        Order CreateOrderDetails(Order orderDetails);
        Task<Order> UpdateOrderDetailAsync(Order orderDetails);
        Order UpdateOrderDetails(Order orderDetails);
        Task<Order> GetOrderByIdAsync(int id);
        Order GetOrderById(int id);
        Task<Order> GetOrderByShippingIdAsync(int id);
        Order GetOrderByShippingId(int id);
        Task<Cart> CreateOrderCartAsync(Cart orderCart, int orderId);
        Cart CreateOrderCart(Cart orderCart, int orderId);
        Task<IEnumerable<Cart>> GetCartByOrderIdAsync(int orderId);
        IEnumerable<Cart> GetCartByOrderId(int orderId);
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId, string ipAddress, Filter filter);
        IEnumerable<Order> GetOrdersByUserId(int userId, string ipAddress, Filter filter);
        Task<PaymentDetails> CreatePaymentDetailsAsync(PaymentDetails orderDetails);
        PaymentDetails CreatePaymentDetails(PaymentDetails orderDetails);
        Task<LayAwaySchedule> CreateLayAwayScheduleAsync(LayAwaySchedule schedule);
        LayAwaySchedule CreateLayAwaySchedule(LayAwaySchedule schedule);
        Task<IEnumerable<LayAwaySchedule>> GetLayAwayScheduleAsync(int orderId, int productId);
        IEnumerable<LayAwaySchedule> GetLayAwaySchedule(int orderId, int productId);
        Task<OrderReason> CreateReasonForCancellationAsync(OrderReason reason);
        OrderReason CreateReasonForCancellation(OrderReason reason);
        Task<bool> UpdateLayawayScheduleByIdAsync(int Id);
        bool UpdateLayawayScheduleById(int Id);
        Task<bool> UpdateLayawayScheduleAsync(LayAwaySchedule sched);
        bool UpdateLayawaySchedule(LayAwaySchedule sched);

        Task<LayAwaySchedule> GetLayAwayScheduleByIdAsync(int id);
        LayAwaySchedule GetLayAwayScheduleById(int id);
        Task<OrderAttachment> CreateOrderAttachementAsync(OrderAttachment orderAttachement);
        OrderAttachment CreateOrderAttachement(OrderAttachment orderAttachement);
        Task<bool> DeleteOrderAttachmentByOrderIdAsync(int orderId);
        bool DeleteOrderAttachmentByOrderId(int orderId);
        Task<IEnumerable<OrderAttachment>> GetOrderAttachmentByOrderIdAsync(int orderId);
        IEnumerable<OrderAttachment> GetOrderAttachmentByOrderId(int orderId);
        Task<bool> UpdateOrderSendEmailAsync(int OrderId, bool ForLayAway, int LayAwayId, string EmailAddress, int statusId, bool isSendEmail, bool isPrSend, bool ForPreOrder, int PreOrderId);
        bool UpdateOrderSendEmail(int OrderId, bool ForLayAway, int LayAwayId, string EmailAddress, int statusId, bool isSendEmail, bool isPrSend, bool ForPreOrder, int PreOrderId);
        Task<IEnumerable<OrderEmailStatus>> GetOrderEmailStatusByOrderIdAsync(int orderId);
        IEnumerable<OrderEmailStatus> GetOrderEmailStatusByOrderId(int orderId);

        Task<Order> GetOrderBySecurityIdAsync(string id);
        Order GetOrderBySecurityId(string id);

        Task<PreOrderSchedule> CreatePreOrderScheduleAsync(PreOrderSchedule sched);
        PreOrderSchedule CreatePreOrderSchedule(PreOrderSchedule sched);

        Task<PreOrderSchedule> UpdatePreOrderScheduleAsync(PreOrderSchedule sched);
        PreOrderSchedule UpdatePreOrderSchedule(PreOrderSchedule sched);
        Task<IEnumerable<PreOrderSchedule>> GetPreOrderScheduleAsync(int orderId, int productId);
        IEnumerable<PreOrderSchedule> GetPreOrderSchedule(int orderId, int productId);
        Task<PreOrderSchedule> GetPreOrderScheduleByIdAsync(int id);
        PreOrderSchedule GetPreOrderScheduleById(int id);

        Task<bool> UpdatePreOrderDPByOrderAsync(int orderId);
        bool UpdatePreOrderDPByOrder(int orderId);
        Task<IEnumerable<Order>> GetOrderByDateAndProductIdAsync(Filter filter);
        IEnumerable<Order> GetOrderByDateAndProductId(Filter filter);
        Task<IEnumerable<OrderEmailHeader>> GetOrderEmailHeaderAsync();
        IEnumerable<OrderEmailHeader> GetOrderEmailHeader();
        Task<bool> UpdatePreOrderNotificationAsync(PreOrderNotification notif);
        bool UpdatePreOrderNotification(PreOrderNotification notif);
        Task<bool> CreateOrderProductReviewAsync(OrderProductRate productRate);
        bool CreateOrderProductReview(OrderProductRate productRate);
        Task<IEnumerable<OrderProductRate>> GetOrderProductRatesByProductIdAsync(int productId);
        IEnumerable<OrderProductRate> GetOrderProductRatesByProductId(int productId);

    }
    public class OrderService : BaseNpgSqlServerService, IOrderService
    {

        public OrderService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<IEnumerable<Order>> GetOrderListRangeAsync(Filter filter)
        {
            return await Task.Run(() => GetOrderListRange(filter));
        }


        public IEnumerable<Order> GetOrderListRange(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Order>("orders.getorderlistrange", new
                {
                    p_offset = filter.Offset,
                    p_limit = filter.Limit,
                    p_searchinput = filter.SearchInput,
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate,
                    p_statusid = filter.StatusId,
                    p_withdaterange = filter.WithDateRange,
                    p_paymentstatusid = filter.PaymentStatusId,
                    p_tag = filter.Tag,
                    p_isrushfee = filter.isRushFee
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Order> CreateOrderDetailAsync(Order orderDetails)
        {
            return await Task.Run(() => CreateOrderDetails(orderDetails));
        }


        public Order CreateOrderDetails(Order orderDetails)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Order>("orders.createorder", new
                {
                    p_dateorder = orderDetails.DateOrder,
                    p_shippingid = orderDetails.ShippingId,
                    p_statusid = orderDetails.StatusId,
                    p_paymentstatusid = orderDetails.PaymentStatusId,
                    p_ipaddress = orderDetails.IpAddress,
                    p_securityid = orderDetails.SecurityId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Order> UpdateOrderDetailAsync(Order orderDetails)
        {
            return await Task.Run(() => UpdateOrderDetails(orderDetails));
        }


        public Order UpdateOrderDetails(Order orderDetails)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Order>("orders.updateorder", new
                {
                    p_id = orderDetails.Id,
                    p_invoicenumber = orderDetails.InvoiceNumber,
                    p_shippingid = orderDetails.ShippingDetails.Id,
                    p_paymentstatusid = orderDetails.PaymentStatusId,
                    p_statusid = orderDetails.StatusId,
                    p_trackingnumber = orderDetails.TrackingNumber,
                    p_shippingdate = orderDetails.ShippingDate,
                    p_ipaddress = orderDetails.IpAddress
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<Order> GetOrderByIdAsync(int Id)
        {
            return await Task.Run(() => GetOrderById(Id));
        }


        public Order GetOrderById(int Id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Order>("orders.getorderbyid", new
                {
                    p_id = Id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<Order> GetOrderByShippingIdAsync(int Id)
        {
            return await Task.Run(() => GetOrderByShippingId(Id));
        }


        public Order GetOrderByShippingId(int Id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Order>("orders.getorderbyshippingid", new
                {
                    p_id = Id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<Cart> CreateOrderCartAsync(Cart orderCart, int orderId)
        {
            return await Task.Run(() => CreateOrderCart(orderCart, orderId));
        }


        public Cart CreateOrderCart(Cart orderCart, int orderId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Cart>("orders.createordercart", new
                {
                    p_orderid = orderId,
                    p_cartid = orderCart.Id,
                    p_price = orderCart.Price,
                    p_onsale = orderCart.OnSale,
                    p_salesprice = orderCart.SalesPrice,
                    p_preorder = orderCart.PreOrder,
                    p_origprice = orderCart.OrigPrice,
                    p_preorderlayaway = orderCart.PreOrderLayaway
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Cart>> GetCartByOrderIdAsync(int orderId)
        {
            return await Task.Run(() => GetCartByOrderId(orderId));
        }

        public IEnumerable<Cart> GetCartByOrderId(int orderId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Cart>("orders.getordercartbyorderid", new
                {
                    p_orderid = orderId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId, string ipAddress, Filter filter)
        {
            return await Task.Run(() => GetOrdersByUserId(userId, ipAddress, filter));
        }


        public IEnumerable<Order> GetOrdersByUserId(int userId, string ipAddress, Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Order>("orders.getordersbyuserid", new
                {
                    p_userid = userId,
                    p_ipaddress = ipAddress
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
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
                return _npgSqlServerRepository.ExecuteThenReturn<PaymentDetails>("orders.getordersbyuserid", new
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



        public async Task<LayAwaySchedule> CreateLayAwayScheduleAsync(LayAwaySchedule sched)
        {
            return await Task.Run(() => CreateLayAwaySchedule(sched));
        }


        public LayAwaySchedule CreateLayAwaySchedule(LayAwaySchedule sched)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LayAwaySchedule>("orders.createlayawayschedule", new
                {
                    p_orderid = sched.OrderId,
                    p_productid = sched.ProductId,
                    p_monthly = sched.Monthly,
                    p_date = sched.Date,
                    p_isnonrefunddeposit = sched.IsNonRefundDeposit,
                    p_iscleared = sched.IsCleared,
                    p_isshipping = sched.IsShipping,
                    p_isinsurance = sched.IsInsurance
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<LayAwaySchedule>> GetLayAwayScheduleAsync(int orderId, int productId)
        {
            return await Task.Run(() => GetLayAwaySchedule(orderId, productId));
        }


        public IEnumerable<LayAwaySchedule> GetLayAwaySchedule(int orderId, int productId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LayAwaySchedule>("orders.layawayschedule", new
                {
                    p_orderid = orderId,
                    p_productid = productId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<OrderReason> CreateReasonForCancellationAsync(OrderReason reason)
        {
            return await Task.Run(() => CreateReasonForCancellation(reason));
        }


        public OrderReason CreateReasonForCancellation(OrderReason reason)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<OrderReason>("orders.createreasonforcancellation", new
                {
                    p_reason = reason.Reason,
                    p_orderid = reason.OrderId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }




        public async Task<bool> UpdateLayawayScheduleByIdAsync(int Id)
        {
            return await Task.Run(() => UpdateLayawayScheduleById(Id));
        }


        public bool UpdateLayawayScheduleById(int Id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("orders.updatelayawayschedulebyid", new
                {
                    p_id = Id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<LayAwaySchedule> GetLayAwayScheduleByIdAsync(int id)
        {
            return await Task.Run(() => GetLayAwayScheduleById(id));
        }


        public LayAwaySchedule GetLayAwayScheduleById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LayAwaySchedule>("orders.getlayawayschedulebyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<bool> UpdateLayawayScheduleAsync(LayAwaySchedule sched)
        {
            return await Task.Run(() => UpdateLayawaySchedule(sched));
        }


        public bool UpdateLayawaySchedule(LayAwaySchedule sched)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("orders.updatelayawayschedule", new
                {
                    p_id = sched.Id,
                    p_orderid = sched.OrderId,
                    p_productid = sched.ProductId,
                    p_monthly = sched.Monthly,
                    p_date = sched.Date,
                    p_isnonrefunddeposit = sched.IsNonRefundDeposit,
                    p_iscleared = sched.IsCleared
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<OrderAttachment> CreateOrderAttachementAsync(OrderAttachment orderAttachement)
        {
            return await Task.Run(() => CreateOrderAttachement(orderAttachement));
        }


        public OrderAttachment CreateOrderAttachement(OrderAttachment orderAttachement)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<OrderAttachment>("orders.createorderattachment", new
                {
                    p_orderid = orderAttachement.OrderId,
                    p_layawayid = orderAttachement.LayawayId,
                    p_filestorageid = orderAttachement.Key,
                    p_filename = orderAttachement.FileUrl,
                    p_isforlayaway = orderAttachement.IsForLayaway,
                    p_isforpreorder = orderAttachement.IsForPreOrder,
                    p_preorderid = orderAttachement.PreOrderId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteOrderAttachmentByOrderIdAsync(int orderId)
        {
            return await Task.Run(() => DeleteOrderAttachmentByOrderId(orderId));
        }


        public bool DeleteOrderAttachmentByOrderId(int orderId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("orders.deleteorderattachmentbyorderid", new
                {
                    p_orderid = orderId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<OrderAttachment>> GetOrderAttachmentByOrderIdAsync(int orderId)
        {
            return await Task.Run(() => GetOrderAttachmentByOrderId(orderId));
        }

        public IEnumerable<OrderAttachment> GetOrderAttachmentByOrderId(int orderId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<OrderAttachment>("orders.getorderattachmentbyorderid", new
                {
                    p_orderid = orderId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> UpdateOrderSendEmailAsync(int OrderId, bool ForLayAway, int LayAwayId, string EmailAddress, int statusId, bool isSendEmail, bool isPrSend, bool ForPreOrder, int PreOrderId)
        {
            return await Task.Run(() => UpdateOrderSendEmail(OrderId, ForLayAway, LayAwayId, EmailAddress, statusId, isSendEmail, isPrSend, ForPreOrder, PreOrderId));
        }


        public bool UpdateOrderSendEmail(int OrderId, bool ForLayAway, int LayAwayId, string EmailAddress, int statusId, bool isSendEmail, bool isPrSend, bool ForPreOrder, int PreOrderId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("orders.updateordersendemail", new
                {
                    p_orderid = OrderId,
                    p_forlayaway = ForLayAway,
                    p_layawayid = LayAwayId,
                    p_emailaddress = EmailAddress,
                    p_orderstatusid = statusId,
                    p_ispcsend = isSendEmail,
                    p_isprsend = isPrSend,
                    p_forpreorder = ForPreOrder,
                    p_preorderid = PreOrderId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Order> GetOrderBySecurityIdAsync(string SecurityId)
        {
            return await Task.Run(() => GetOrderBySecurityId(SecurityId));
        }


        public Order GetOrderBySecurityId(string SecurityId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Order>("orders.getorderbysecurityid", new
                {
                    p_securityid = SecurityId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<OrderEmailStatus>> GetOrderEmailStatusByOrderIdAsync(int orderId)
        {
            return await Task.Run(() => GetOrderEmailStatusByOrderId(orderId));
        }

        public IEnumerable<OrderEmailStatus> GetOrderEmailStatusByOrderId(int orderId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<OrderEmailStatus>("orders.getorderemailstatusbyorderid", new
                {
                    p_orderid = orderId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<PreOrderSchedule> CreatePreOrderScheduleAsync(PreOrderSchedule sched)
        {
            return await Task.Run(() => CreatePreOrderSchedule(sched));
        }

        public PreOrderSchedule CreatePreOrderSchedule(PreOrderSchedule sched)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PreOrderSchedule>("orders.createpreorderschedule", new
                {
                    p_orderid = sched.OrderId,
                    p_productid = sched.ProductId,
                    p_paymentterm = sched.PaymentTerm,
                    p_amount = sched.Amount,
                    p_iscleared = sched.IsCleared,
                    p_issendemail = sched.IsSendEmail
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<PreOrderSchedule> UpdatePreOrderScheduleAsync(PreOrderSchedule sched)
        {
            return await Task.Run(() => UpdatePreOrderSchedule(sched));
        }

        public PreOrderSchedule UpdatePreOrderSchedule(PreOrderSchedule sched)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PreOrderSchedule>("orders.updatepreorderschedule", new
                {
                    p_id = sched.Id,
                    p_orderid = sched.OrderId,
                    p_productid = sched.ProductId,
                    p_paymentterm = sched.PaymentTerm,
                    p_amount = sched.Amount,
                    p_iscleared = sched.IsCleared,
                    p_issendemail = sched.IsSendEmail
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<PreOrderSchedule>> GetPreOrderScheduleAsync(int orderId, int productId)
        {
            return await Task.Run(() => GetPreOrderSchedule(orderId, productId));
        }

        public IEnumerable<PreOrderSchedule> GetPreOrderSchedule(int orderId, int productId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<PreOrderSchedule>("orders.getpreorderschedule", new
                {
                    p_orderid = orderId,
                    p_productid = productId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<PreOrderSchedule> GetPreOrderScheduleByIdAsync(int id)
        {
            return await Task.Run(() => GetPreOrderScheduleById(id));
        }

        public PreOrderSchedule GetPreOrderScheduleById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<PreOrderSchedule>("orders.getpreorderschedulebyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<bool> UpdatePreOrderDPByOrderAsync(int orderid)
        {
            return await Task.Run(() => UpdatePreOrderDPByOrder(orderid));
        }

        public bool UpdatePreOrderDPByOrder(int orderid)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("orders.updatepreorderdpbyorder", new
                {
                    p_orderid = orderid
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<Order>> GetOrderByDateAndProductIdAsync(Filter filter)
        {
            return await Task.Run(() => GetOrderByDateAndProductId(filter));
        }

        public IEnumerable<Order> GetOrderByDateAndProductId(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Order>("orders.getorderbydateandproductid", new
                {
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate,
                    p_productid = filter.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<OrderEmailHeader>> GetOrderEmailHeaderAsync()
        {
            return await Task.Run(() => GetOrderEmailHeader());
        }

        public IEnumerable<OrderEmailHeader> GetOrderEmailHeader()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<OrderEmailHeader>("orders.getemailheadercontentlist");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> UpdatePreOrderNotificationAsync(PreOrderNotification notif)
        {
            return await Task.Run(() => UpdatePreOrderNotification(notif));
        }

        public bool UpdatePreOrderNotification(PreOrderNotification notif)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("orders.updatepreordernotification", new {
                    p_orderid = notif.OrderId,
                    p_productid = notif.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<bool> CreateOrderProductReviewAsync(OrderProductRate productRate)
        {
            return await Task.Run(() => CreateOrderProductReview(productRate));
        }

        public bool CreateOrderProductReview(OrderProductRate productRate)
        {
            try
            {
                   return _npgSqlServerRepository.ExecuteThenReturn<bool>("orders.createorderproductreview", new {
                    p_rate = productRate.Rate,
                    p_comment = productRate.Comment,
                    p_productid = productRate.ProductId,
                    p_orderid = productRate.OrderId,
                    p_activeuser = productRate.ActiveUser,
                    p_parentid = productRate.ParentId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<OrderProductRate>> GetOrderProductRatesByProductIdAsync(int productid)
        {
            return await Task.Run(() => GetOrderProductRatesByProductId(productid));
        }

        public IEnumerable<OrderProductRate> GetOrderProductRatesByProductId(int productid)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<OrderProductRate>("orders.getorderproductreview", new {
                    p_productid = productid
                }); 
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
    }
}