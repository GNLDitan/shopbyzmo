using System.Collections.Generic;
using System.Threading.Tasks;
using ByzmoApi.Helpers;
using ByzmoApi.Models;
using Npgsql;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IReportService
    {
        Task<IEnumerable<Report>> GetOrderStatusReportAsync(Filter filter);
        IEnumerable<Report> GetOrderStatusReport(Filter filter);

        Task<IEnumerable<Report>> GetSalesReportAsync(Filter filter);
        IEnumerable<Report> GetSalesReport(Filter filter);
        Task<IEnumerable<Report>> GetShippedOrderReportAsync(Filter filter);
        IEnumerable<Report> GetShippedOrderReport(Filter filter);

        Task<IEnumerable<Report>> GetOrderWithDiscountReportAsync(Filter filter);
        IEnumerable<Report> GetOrderWithDiscountReport(Filter filter);

        Task<IEnumerable<Report>> GetOrderWithLayawayPaymentReportAsync(Filter filter);
        IEnumerable<Report> GetOrderWithLayawayPaymentReport(Filter filter);

        Task<IEnumerable<Report>> GetOrderWithPreOrderReportAsync(Filter filter);
        IEnumerable<Report> GetOrderWithPreOrderReport(Filter filter);

        Task<IEnumerable<ReportProducts>> GetProductListReportAsync(Filter filter);
        IEnumerable<ReportProducts> GetProductListReport(Filter filter);
        Task<IEnumerable<ReportProducts>> GetStockProductReportAsync(Filter filter);
        IEnumerable<ReportProducts> GetStockProductReport(Filter filter);
        Task<IEnumerable<ReportProducts>> GetProductHighestToLowestReportAsync(Filter filter);
        IEnumerable<ReportProducts> GetProductHighestToLowestReport(Filter filter);
        Task<IEnumerable<ReportProducts>> GetProductTagsReportAsync(Filter filter);
        IEnumerable<ReportProducts> GetProductTagsReport(Filter filter);
        Task<IEnumerable<LoyaltyDiscountTrackerReport>> GetLoyaltyDiscountTrackerReportAsync(int loyaltyId);
        IEnumerable<LoyaltyDiscountTrackerReport> GetLoyaltyDiscountTrackerReport(int loyaltyId);

        Task<IEnumerable<LoyaltyDiscountTracker>> GetLoyaltyDiscountsAsync(int userid, string email);
        IEnumerable<LoyaltyDiscountTracker> GetLoyaltyDiscounts(int userid, string email);

        Task<SummaryPayment> GetSummaryPaymentByOrderIdAsync(int orderId);
        SummaryPayment GetSummaryPaymentByOrderId(int orderId);

        Task<IEnumerable<ReportCustomer>> GetReportCustomersAsync(string sort);
        IEnumerable<ReportCustomer> GetReportCustomers(string sort);

        Task<IEnumerable<UserSubscription>> GetUserSubscriptionReportAsync();
        IEnumerable<UserSubscription> GetUserSubscriptionReport();
    }

    public class ReportService : BaseNpgSqlServerService, IReportService
    {
        public ReportService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<IEnumerable<Report>> GetOrderStatusReportAsync(Filter filter)
        {
            return await Task.Run(() => GetOrderStatusReport(filter));
        }


        public IEnumerable<Report> GetOrderStatusReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Report>("report.getorderstatusreport", new
                {
                    p_statusid = filter.StatusId,
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<Report>> GetSalesReportAsync(Filter filter)
        {
            return await Task.Run(() => GetSalesReport(filter));
        }


        public IEnumerable<Report> GetSalesReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Report>("report.getsalesreport", new
                {
                    p_statusid = filter.StatusId,
                    p_paymentstatusid = filter.PaymentStatusId,
                    p_paymentmethod = filter.PaymentMethodId,
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate,
                    p_tag = filter.Tag,
                    p_isrushfee = filter.isRushFee
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Report>> GetShippedOrderReportAsync(Filter filter)
        {
            return await Task.Run(() => GetShippedOrderReport(filter));
        }


        public IEnumerable<Report> GetShippedOrderReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Report>("report.getshippedorderreport", new
                {
                    p_shippingmethodid = filter.ShippingMethodId,
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Report>> GetOrderWithDiscountReportAsync(Filter filter)
        {
            return await Task.Run(() => GetOrderWithDiscountReport(filter));
        }

        public IEnumerable<Report> GetOrderWithDiscountReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Report>("report.getorderwithdiscountreport", new
                {
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<IEnumerable<Report>> GetOrderWithLayawayPaymentReportAsync(Filter filter)
        {
            return await Task.Run(() => GetOrderWithLayawayPaymentReport(filter));
        }
        public IEnumerable<Report> GetOrderWithLayawayPaymentReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Report>("report.getorderwithlayawaypaymentreport", new
                {
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<IEnumerable<Report>> GetOrderWithPreOrderReportAsync(Filter filter)
        {
            return await Task.Run(() => GetOrderWithPreOrderReport(filter));
        }
        public IEnumerable<Report> GetOrderWithPreOrderReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Report>("report.getorderwithpreorderreport", new
                {
                    p_statusid = filter.StatusId,
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate,
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<ReportProducts>> GetProductListReportAsync(Filter filter)
        {
            return await Task.Run(() => GetProductListReport(filter));
        }
        public IEnumerable<ReportProducts> GetProductListReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ReportProducts>("report.getproductlistreport", new
                {
                    p_category = filter.Category,
                    p_producttype = filter.ProductType,
                    p_productsort = filter.ProductSort
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<ReportProducts>> GetStockProductReportAsync(Filter filter)
        {
            return await Task.Run(() => GetStockProductReport(filter));
        }
        public IEnumerable<ReportProducts> GetStockProductReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ReportProducts>("report.getstockproductreport", new
                {
                    p_category = filter.Category,
                    p_producttype = filter.ProductType,
                    p_productsort = filter.ProductSort,
                    p_stockfilter = filter.StockFilter
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<ReportProducts>> GetProductHighestToLowestReportAsync(Filter filter)
        {
            return await Task.Run(() => GetProductHighestToLowestReport(filter));
        }
        public IEnumerable<ReportProducts> GetProductHighestToLowestReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ReportProducts>("report.gethighesttolowestreport", new
                {
                    p_category = filter.Category,
                    p_producttype = filter.ProductType,
                    p_productsort = filter.ProductSort,
                    p_startdate = filter.StartDate,
                    p_enddate = filter.EndDate
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<ReportProducts>> GetProductTagsReportAsync(Filter filter)
        {
            return await Task.Run(() => GetProductTagsReport(filter));
        }
        public IEnumerable<ReportProducts> GetProductTagsReport(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ReportProducts>("report.getproducttagsreport", new
                {
                    p_category = filter.Category,
                    p_producttype = filter.ProductType,
                    p_tagfilter = filter.Tag,
                    p_productsort = filter.ProductSort
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<LoyaltyDiscountTrackerReport>> GetLoyaltyDiscountTrackerReportAsync(int loyaltyId)
        {
            return await Task.Run(() => GetLoyaltyDiscountTrackerReport(loyaltyId));
        }
        public IEnumerable<LoyaltyDiscountTrackerReport> GetLoyaltyDiscountTrackerReport(int loyaltyId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LoyaltyDiscountTrackerReport>("report.getloyaltydiscounttrackerreport", new
                {
                    p_loyaltyid = loyaltyId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<LoyaltyDiscountTracker>> GetLoyaltyDiscountsAsync(int userid, string email)
        {
            return await Task.Run(() => GetLoyaltyDiscounts(userid, email));
        }
        public IEnumerable<LoyaltyDiscountTracker> GetLoyaltyDiscounts(int userid, string email)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LoyaltyDiscountTracker>("report.getloyaltydiscounts", new
                {
                    p_userid = userid,
                    p_email = email
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<SummaryPayment> GetSummaryPaymentByOrderIdAsync(int orderId)
        {
            return await Task.Run(() => GetSummaryPaymentByOrderId(orderId));
        }
        public SummaryPayment GetSummaryPaymentByOrderId(int orderId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<SummaryPayment>("report.getsummarypaymentbyorderid", new
                {
                    p_orderid = orderId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<ReportCustomer>> GetReportCustomersAsync(string sort)
        {
            return await Task.Run(() => GetReportCustomers(sort));
        }
        public IEnumerable<ReportCustomer> GetReportCustomers(string sort)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ReportCustomer>("report.getreportcustomers", new
                {
                    p_sort = sort
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async  Task<IEnumerable<UserSubscription>> GetUserSubscriptionReportAsync()
        {
            return await Task.Run(() => GetUserSubscriptionReport());
        }

        public IEnumerable<UserSubscription> GetUserSubscriptionReport()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<UserSubscription>("report.getusersubscriptionreport");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
    }
}