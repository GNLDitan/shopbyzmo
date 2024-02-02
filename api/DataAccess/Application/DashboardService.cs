using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IDashboardService
    {
        Task<int> GetOutOfStockAsync();
        int GetOutOfStock();

        Task<int> GetDelayedPaymentAsync();
        int GetDelayedPayment();

        Task<int> GetMonthNewOrderAsync();
        int GetMonthNewOrder();

        Task<int> GetUserSubscriptionAsync();
        int GetUserSubscription();

        Task<IEnumerable<DashboardBlog> > GetBlogNotificationAsync();
        IEnumerable<DashboardBlog>  GetBlogNotification();

        Task<IEnumerable<DashboardProduct>> GetMostOrderedProductAsync();
        IEnumerable<DashboardProduct>  GetMostOrderedProduct();

        Task<IEnumerable<DashboardLoyaltyUser>> GetMostLoyaltyUserAsync();
        IEnumerable<DashboardLoyaltyUser> GetMostLoyaltyUser();

        Task<DashboardOrders> GetOrderStatusAsync(Filter filter);
        DashboardOrders GetOrderStatus(Filter filter);

        Task<IEnumerable<DashboardOrderCount>> GetOrderCountAsync(Filter filter);
        IEnumerable<DashboardOrderCount> GetOrderCount(Filter filter);
        

    }


    public class DashboardService : BaseNpgSqlServerService, IDashboardService
    {
        public DashboardService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {
        }
        
        public async Task<int> GetOutOfStockAsync()
        {
            return await Task.Run(() => GetOutOfStock());
        }


        public int GetOutOfStock()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<int>("dashboard.getoutofstock");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<int> GetDelayedPaymentAsync()
        {
            return await Task.Run(() => GetDelayedPayment());
        }


        public int GetDelayedPayment()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<int>("dashboard.getdelayedpayment");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<int> GetMonthNewOrderAsync()
        {
            return await Task.Run(() => GetMonthNewOrder());
        }


        public int GetMonthNewOrder()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<int>("dashboard.getmonthneworder");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


         public async Task<int> GetUserSubscriptionAsync()
        {
            return await Task.Run(() => GetUserSubscription());
        }


        public int GetUserSubscription()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<int>("dashboard.getusersubscription");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<DashboardBlog>> GetBlogNotificationAsync()
        {
            return await Task.Run(() => GetBlogNotification());
        }


        public IEnumerable<DashboardBlog> GetBlogNotification()
        {
           
           try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<DashboardBlog>("dashboard.getblognotification");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<DashboardProduct>> GetMostOrderedProductAsync()
        {
            return await Task.Run(() => GetMostOrderedProduct());
        }


        public IEnumerable<DashboardProduct> GetMostOrderedProduct()
        {
           
           try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<DashboardProduct>("dashboard.getmostorderedproduct");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<DashboardLoyaltyUser>> GetMostLoyaltyUserAsync()
        {
            return await Task.Run(() => GetMostLoyaltyUser());
        }


        public IEnumerable<DashboardLoyaltyUser> GetMostLoyaltyUser()
        {
           
           try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<DashboardLoyaltyUser>("dashboard.getmostloyaltyuser");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<DashboardOrders> GetOrderStatusAsync(Filter filter)
        {
            return await Task.Run(() => GetOrderStatus(filter));
        }


        public DashboardOrders GetOrderStatus(Filter filter)
        {
           
           try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<DashboardOrders>("dashboard.getorderstatus", new {
                     p_startdate = filter.StartDate,
                     p_enddate = filter.EndDate
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<DashboardOrderCount>> GetOrderCountAsync(Filter filter)
        {
            return await Task.Run(() => GetOrderCount(filter));
        }


        public IEnumerable<DashboardOrderCount> GetOrderCount(Filter filter)
        {
           
           try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<DashboardOrderCount>("dashboard.getorderscount", new {
                     p_startdate = filter.StartDate,
                     p_enddate = filter.EndDate
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        

        

    }

}