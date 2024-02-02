using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ByzmoApi.DataAccess.Applcation;
using ByzmoApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static ByzmoApi.Enum.OrderReport;

namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        public IReportService _iReportService;
        public IOrderService _iOrderService;
        public IProductService _iProductService;
        public ILoyaltyService _iLoyalService;
        public ICartService _iCartService;
        public IShippingService _iShippingService;
        public ReportController(IReportService iReportService,
                                IOrderService iOrderService,
                                IProductService iProductService,
                                ILoyaltyService iLoyalService,
                                ICartService iCartService,
                                IShippingService _iShippingService)
        {
            this._iReportService = iReportService;
            this._iOrderService = iOrderService;
            this._iProductService = iProductService;
            this._iLoyalService = iLoyalService;
            this._iCartService = iCartService;
            this._iShippingService = _iShippingService;
        }

        [HttpPost("getorderreport/{reportType}")]
        public async Task<IActionResult> GetOrderStatusReport(int reportType, [FromBody] Filter filter)
        {
            try
            {
                IEnumerable<Report> reports = new List<Report>();
                if (filter == null) return BadRequest();
                switch (reportType)
                {
                    case (int)ReportType.OrderStatusReport:
                        reports = await _iReportService.GetOrderStatusReportAsync(filter);
                        foreach (var report in reports)
                        {

                            var OrderEmailStatus = await _iOrderService.GetOrderEmailStatusByOrderIdAsync(report.OrderId);
                            var OrderCart = await _iOrderService.GetCartByOrderIdAsync(report.OrderId);
                            report.IsSendEmail = report.StatusId == 4 ? true : OrderEmailStatus.Where(x => x.OrderStatusId == report.StatusId).Count() > 0;
                            var productList = new List<Product>();
                            var hasPreorder = OrderCart.Where(x => x.PreOrder).Count() > 0;
                            foreach (var cart in OrderCart)
                            {
                                var product = await _iProductService.GetProductByIdAsync(cart.ProductId);

                                if (product != null)
                                {
                                    productList.Add(product);
                                }
                            }
                            report.Products = productList;
                        }
                        break;
                    case (int)ReportType.SalesReport:
                        reports = await _iReportService.GetSalesReportAsync(filter);
                        foreach (var report in reports)
                        {

                            var OrderEmailStatus = await _iOrderService.GetOrderEmailStatusByOrderIdAsync(report.OrderId);
                            var OrderCart = await _iOrderService.GetCartByOrderIdAsync(report.OrderId);
                            report.IsSendEmail = report.StatusId == 4 ? true : OrderEmailStatus.Where(x => x.OrderStatusId == report.StatusId).Count() > 0;
                            var productList = new List<Product>();
                            var hasPreorder = OrderCart.Where(x => x.PreOrder).Count() > 0;
                            foreach (var cart in OrderCart)
                            {
                                var product = await _iProductService.GetProductByIdAsync(cart.ProductId);

                                if (product != null)
                                {
                                    productList.Add(product);
                                }
                            }
                            report.Products = productList;
                        }
                        break;
                    case (int)ReportType.ShippedOrderReport:
                        reports = await _iReportService.GetShippedOrderReportAsync(filter);
                        break;
                    case (int)ReportType.OrderWithDiscountReport:
                        reports = await _iReportService.GetOrderWithDiscountReportAsync(filter);
                        break;
                    case (int)ReportType.OrderWithLayawayReport:
                        reports = await _iReportService.GetOrderWithLayawayPaymentReportAsync(filter);
                        break;
                    case (int)ReportType.OrdersWithPreOrderReport:
                        reports = await _iReportService.GetOrderWithPreOrderReportAsync(filter);
                        break;

                }

                foreach (var report in reports)
                {
                    var total = 0m;
                    var OrderCart = await _iOrderService.GetCartByOrderIdAsync(report.OrderId);
                    var hasPreorder = OrderCart.Where(x => x.PreOrder).Count() > 0;
                    var summaryPayment = await _iReportService.GetSummaryPaymentByOrderIdAsync(report.OrderId);
                    if (summaryPayment == null)
                        summaryPayment = new SummaryPayment();

                    foreach (var cart in OrderCart)
                    {
                        var product = await _iProductService.GetProductByIdAsync(cart.ProductId);
                        if (product != null)
                        {
                            total += product.Price * cart.Quantity;
                        }
                    }
                    // if (hasPreorder)
                    // {
                    //     total += report.ShippingAmount;
                    //     total -= report.DiscountAmount;
                    //     report.Total = total;
                    // }

                    report.Balance = report.PaymentStatusId == 3 ? 0 : report.Total - summaryPayment.Amount;

                }

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("getproductsreport/{reportType}")]
        public async Task<IActionResult> GetProductsReport(int reportType, [FromBody] Filter filter)
        {
            try
            {
                IEnumerable<ReportProducts> reports = new List<ReportProducts>();
                if (filter == null) return BadRequest();
                switch (reportType)
                {
                    case (int)ProductReportType.ProductPriceListReport:
                        reports = await _iReportService.GetProductListReportAsync(filter);
                        break;
                    case (int)ProductReportType.StockProductsReport:
                        reports = await _iReportService.GetStockProductReportAsync(filter);
                        break;
                    case (int)ProductReportType.ProductHighestToLowestReport:
                        reports = await _iReportService.GetProductHighestToLowestReportAsync(filter);
                        break;

                    case (int)ProductReportType.ProductTagReport:
                        reports = await _iReportService.GetProductTagsReportAsync(filter);
                        break;
                }
                return Ok(reports);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [AllowAnonymous]
        [HttpGet("getloyaltydiscounttrackerreport/{loyaltyid}")]
        public async Task<IActionResult> GetProductsReport(int loyaltyid)
        {
            try
            {

                var reports = await _iReportService.GetLoyaltyDiscountTrackerReportAsync(loyaltyid);

                foreach (var item in reports)
                {
                    item.loyaltyDiscountTracker = await _iReportService.GetLoyaltyDiscountsAsync(item.UserId, item.Email);
                }

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [HttpGet("getcustomerlistreport/{sort}")]
        public async Task<IActionResult> CustomerListReport(string sort)
        {
            try
            {

                var reports = await _iReportService.GetReportCustomersAsync(sort);

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpGet("getusersubscriptionreport")]
        public async Task<IActionResult> GetUserSubscriptionReport()
        {
            try
            {
                var reports = await _iReportService.GetUserSubscriptionReportAsync();

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
    }
}