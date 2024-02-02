using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetProductsAsync();
        IEnumerable<Product> GetProducts();
        Task<IEnumerable<Product>> GetProductsListRangeAsync(Filter filter);
        IEnumerable<Product> GetProductsListRange(Filter filter);
        Task<IEnumerable<Tag>> GetTagsByIdAsync(int productid);
        IEnumerable<Tag> GetTagsById(int productid);
        Task<IEnumerable<ProductImages>> GetProductImagesAsync();
        IEnumerable<ProductImages> GetProductImages();
        Task<Product> GetProductByIdAsync(int id);
        Product GetProductById(int id);
        Task<Product> GetProductByLinkNameAsync(string linkName);
        Product GetProductByLinkName(string linkName);
        Task<IEnumerable<ProductImages>> GetProductImagesByIdAsync(int id);
        IEnumerable<ProductImages> GetProductImagesById(int id);
        Task<Product> CreateProductAsync(Product product);
        Product CreateProduct(Product product);
        Task<Product> UpdateProductAsync(Product product);
        Product UpdateProduct(Product product);
        Task<FileMapper> CreateProductImagesAsync(FileMapper productImages);
        FileMapper CreateProductImages(FileMapper productImages);
        Task<bool> RemoveImageAsync(string filename);
        bool RemoveImage(string filename);
        Task<bool> UpdateDefaultImgAsync(string filename, int productid);
        bool UpdateDefaultImg(string filename, int productid);
        Task<Tag> CreateProductTagAsync(Tag tag, int productId);
        Tag CreateProductTag(Tag tag, int productId);
        Task<bool> DeleteProductTagsByIdAsync(int id);
        bool DeleteProductTagsById(int id);
        Task<IEnumerable<Tag>> GetTopTagsAsync(string tag);
        IEnumerable<Tag> GetTopTags(string tag);
        Task<ProductInventory> CreateProductInventoryAsync(ProductInventory inventory);
        ProductInventory CreateProductInventory(ProductInventory inventory);
        Task<IEnumerable<ProductInventory>> GetInventoryByProductIdAsync(int productId);
        IEnumerable<ProductInventory> GetInventoryByProductId(int productId);
        Task<IEnumerable<ProductCategory>> GetAllCategoryAsync();
        IEnumerable<ProductCategory> GetAllCategory();

        Task<bool> DeleteProductByIdAsync(int id);
        bool DeleteProductById(int id);

        Task<ProductCategory> CreateProductCategoryAsync(ProductCategory category);
        ProductCategory CreateProductCategory(ProductCategory category);

        Task<ProductCategory> UpdateProductCategoryAsync(ProductCategory category);
        ProductCategory UpdateProductCategory(ProductCategory category);

        Task<bool> DeleteProductCategoryAsync(int id);
        bool DeleteProductCategory(int id);
        Task<bool> CheckItemNumberValidityAsync(Product product);
        bool CheckItemNumberValidity(Product product);

        Task<IEnumerable<LayAway>> GetLayAwayAsync();
        IEnumerable<LayAway> GetLayAway();
        Task<LayAway> GetLayAwayByIdAsync(int id);
        LayAway GetLayAwayById(int id);
        Task<LayAway> CreateProductLayAwayAsync(LayAway layAway);
        LayAway CreateProductLayAway(LayAway layAway);
        Task<LayAway> UpdateProductLayAwayAsync(LayAway layAway);
        LayAway UpdateProductLayAway(LayAway layAway);
        Task<bool> DeleteProductLayAwayAsync(int id);
        bool DeleteProductLayAway(int id);
        Task<IEnumerable<Product>> GetProductsListByCatCodeAsync(string code);
        IEnumerable<Product> GetProductsListByCatCode(string code);
        Task<LayAway> GetActiveLayAwayAsync();
        LayAway GetActiveLayAway();
        Task<LayAwayDate> CreateProductLayAwayDateAsync(LayAwayDate layAway);
        LayAwayDate CreateProductLayDayAway(LayAwayDate layAway);
        Task<bool> DeleteLayAwayDatesAsync(int id);
        bool DeleteLayAwayDates(int id);
        Task<IEnumerable<LayAwayDate>> GetLayAwayDatesAsync();
        IEnumerable<LayAwayDate> GetLayAwayDates();

        Task<Discount> CreateDiscountAsync(Discount discount);
        Discount CreateDiscount(Discount discount);
        Task<IEnumerable<Discount>> GetDiscountListRangeAsync(Filter filter);
        IEnumerable<Discount> GetDiscountListRange(Filter filter);
        Task<bool> DeleteDiscountByIdAsync(int id);
        bool DeleteDiscountById(int id);
        Task<Discount> GetDiscountByIdAsync(int id);
        Discount GetDiscountById(int id);

        Task<Discount> GetDiscountByCodeAsync(string id);
        Discount GetDiscountByCode(string id);
        Task<Discount> UpdateDiscountAsync(Discount discount);
        Discount UpdateDiscount(Discount discount);

        Task<bool> DeleteProductCategoryByCodeAsync(string code);
        bool DeleteProductCategoryByCode(string code);

        Task<IEnumerable<Product>> GetProductsRelatedListAsync(Filter filter);
        IEnumerable<Product> GetProductsRelatedList(Filter filter);

        Task<HomeFeatures> CreateHomeFeatureAsync(HomeFeatures feature);
        HomeFeatures CreateHomeFeature(HomeFeatures feature);

        Task<HomeFeatures> GetHomeFeatureAsync();
        HomeFeatures GetHomeFeature();

        Task<Discount> ClaimDiscountAsync(string code);
        Discount ClaimDiscount(string code);
        bool UpdateSendProductNotification(UserProductNotification notif);
        Task<bool> UpdateSendProductNotificationAsync(UserProductNotification notif);
        Task<bool> MoveCategoryOrderIdAsync(int id, int moveTypeId);
        bool MoveCategoryOrderId(int id, int moveTypeId);
    }

    public class ProductService : BaseNpgSqlServerService, IProductService
    {

        public ProductService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<IEnumerable<Product>> GetProductsAsync()
        {
            return await Task.Run(() => GetProducts());
        }


        public IEnumerable<Product> GetProducts()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Product>("product.getproductslist");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<Product>> GetProductsListRangeAsync(Filter filter)
        {
            return await Task.Run(() => GetProductsListRange(filter));
        }


        public IEnumerable<Product> GetProductsListRange(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Product>("product.getproductslistrange", new
                {
                    p_productname = filter.ProductName,
                    p_productdescription = filter.ProductDescription,
                    p_category = filter.Category,
                    p_itemnumber = filter.ItemNumber,
                    p_tags = filter.Tags,
                    p_offset = filter.Offset,
                    p_limit = filter.Limit,
                    p_sortby = filter.Sort,
                    p_forproductlist = filter.ForProductList
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Tag>> GetTagsByIdAsync(int productid)
        {
            return await Task.Run(() => GetTagsById(productid));
        }


        public IEnumerable<Tag> GetTagsById(int productid)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Tag>("product.getproducttagsbyid", new
                {
                    p_productid = productid
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<IEnumerable<ProductImages>> GetProductImagesAsync()
        {
            return await Task.Run(() => GetProductImages());
        }


        public IEnumerable<ProductImages> GetProductImages()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ProductImages>("product.getproductimages");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<Product> GetProductByIdAsync(int id)
        {
            return await Task.Run(() => GetProductById(id));
        }


        public Product GetProductById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Product>("product.getproductbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Product> GetProductByLinkNameAsync(string linkName)
        {
            return await Task.Run(() => GetProductByLinkName(linkName));
        }


        public Product GetProductByLinkName(string linkName)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Product>("product.getproductbylinkname", new
                {
                    p_linkname = linkName
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }




        public async Task<IEnumerable<ProductImages>> GetProductImagesByIdAsync(int id)
        {
            return await Task.Run(() => GetProductImagesById(id));
        }


        public IEnumerable<ProductImages> GetProductImagesById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ProductImages>("product.getproductimagesbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<Product> CreateProductAsync(Product product)
        {
            return await Task.Run(() => CreateProduct(product));
        }
        public Product CreateProduct(Product product)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Product>("product.createproduct", new
                {
                    p_productname = product.ProductName,
                    p_productdescription = product.ProductDescription,
                    p_itemnumber = product.ItemNumber,
                    p_price = product.Price,
                    p_isactive = product.Isactive,
                    p_category = product.Category,
                    p_onsale = product.OnSale,
                    p_salesprice = product.SalesPrice,
                    p_preorder = product.PreOrder,
                    p_islayaway = product.isLayAway,
                    p_preorderdepositamount = product.PreOrderDepositAmount,
                    p_costprice = product.CostPrice,
                    p_hasrushfee = product.HasRushFee,
                    p_rushfee = product.RushFee,
                    p_preorderlayaway = product.PreOrderLayaway
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Product> UpdateProductAsync(Product product)
        {
            return await Task.Run(() => UpdateProduct(product));
        }

        public Product UpdateProduct(Product product)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Product>("product.updateproduct", new
                {
                    p_id = product.Id,
                    p_productname = product.ProductName,
                    p_productdescription = product.ProductDescription,
                    p_itemnumber = product.ItemNumber,
                    p_quantity = product.Quantity,
                    p_price = product.Price,
                    p_isactive = product.Isactive,
                    p_category = product.Category,
                    p_onsale = product.OnSale,
                    p_salesprice = product.SalesPrice,
                    p_preorder = product.PreOrder,
                    p_islayaway = product.isLayAway,
                    p_preorderdepositamount = product.PreOrderDepositAmount,
                    p_costprice = product.CostPrice,
                    p_hasrushfee = product.HasRushFee,
                    p_rushfee = product.RushFee,
                    p_preorderlayaway = product.PreOrderLayaway
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<FileMapper> CreateProductImagesAsync(FileMapper productImages)
        {
            return await Task.Run(() => CreateProductImages(productImages));
        }

        public FileMapper CreateProductImages(FileMapper productImages)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<FileMapper>("product.createproductimages", new
                {
                    p_productid = productImages.Key,
                    p_filestorageid = productImages.Id,
                    p_filename = productImages.FileName
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<bool> RemoveImageAsync(string filename)
        {
            return await Task.Run(() => RemoveImage(filename));
        }

        public bool RemoveImage(string filename)
        {
            try
            {
                _npgSqlServerRepository.ExecuteThenReturn<bool>("product.removeproductimage", new
                {
                    p_filename = filename
                });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateDefaultImgAsync(string filename, int productid)
        {
            return await Task.Run(() => UpdateDefaultImg(filename, productid));
        }

        public bool UpdateDefaultImg(string filename, int productid)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("product.updatedefaultimg", new
                {
                    p_filename = filename,
                    p_productid = productid
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<Tag> CreateProductTagAsync(Tag tag, int productId)
        {
            return await Task.Run(() => CreateProductTag(tag, productId));
        }

        public Tag CreateProductTag(Tag tag, int productId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Tag>("product.createproducttags", new
                {
                    p_name = tag.Name,
                    p_productid = productId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteProductTagsByIdAsync(int tagId)
        {
            return await Task.Run(() => DeleteProductTagsById(tagId));
        }

        public bool DeleteProductTagsById(int tagId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("product.deleteproducttagsbyid", new
                {
                    p_id = tagId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Tag>> GetTopTagsAsync(string tag)
        {
            return await Task.Run(() => GetTopTags(tag));
        }

        public IEnumerable<Tag> GetTopTags(string tag)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Tag>("product.gettoptags", new
                {
                    p_tag = tag
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<ProductInventory> CreateProductInventoryAsync(ProductInventory inventory)
        {
            return await Task.Run(() => CreateProductInventory(inventory));
        }

        public ProductInventory CreateProductInventory(ProductInventory inventory)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ProductInventory>("product.createproductinventory", new
                {
                    p_productid = inventory.ProductId,
                    p_deliverydate = inventory.DeliveryDate,
                    p_quantity = inventory.Quantity,
                    p_datecreated = inventory.DateCreated,
                    p_datemodified = inventory.DateModified
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<ProductInventory>> GetInventoryByProductIdAsync(int productId)
        {
            return await Task.Run(() => GetInventoryByProductId(productId));
        }


        public IEnumerable<ProductInventory> GetInventoryByProductId(int productId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ProductInventory>("product.getinventorybyproductid", new
                {
                    p_productid = productId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<ProductCategory>> GetAllCategoryAsync()
        {
            return await Task.Run(() => GetAllCategory());
        }


        public IEnumerable<ProductCategory> GetAllCategory()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<ProductCategory>("product.getcategory");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteProductByIdAsync(int id)
        {
            return await Task.Run(() => DeleteProductById(id));
        }

        public bool DeleteProductById(int id)
        {
            try
            {
                _npgSqlServerRepository.ExecuteThenReturn<bool>("product.deleteproductbyid", new
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


        public async Task<ProductCategory> CreateProductCategoryAsync(ProductCategory category)
        {
            return await Task.Run(() => CreateProductCategory(category));
        }
        public ProductCategory CreateProductCategory(ProductCategory productCategory)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ProductCategory>("product.createproductcategory", new
                {
                    p_code = productCategory.Code,
                    p_category = productCategory.Category,
                    p_categoryhierarchy = productCategory.CategoryHierarchy,
                    p_parentcategory = productCategory.ParentCategory
                });

            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<ProductCategory> UpdateProductCategoryAsync(ProductCategory category)
        {
            return await Task.Run(() => UpdateProductCategory(category));
        }

        public ProductCategory UpdateProductCategory(ProductCategory category)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<ProductCategory>("product.updateproductcategory", new
                {
                    p_id = category.Id,
                    p_code = category.Code,
                    p_category = category.Category,
                    p_categoryhierarchy = category.CategoryHierarchy,
                    p_parentcategory = category.ParentCategory,
                    p_ischangehierarchy = category.IsChangeHierarchy
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<bool> DeleteProductCategoryAsync(int id)
        {
            return await Task.Run(() => DeleteProductCategory(id));
        }

        public bool DeleteProductCategory(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("product.deleteproductcategory", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<bool> CheckItemNumberValidityAsync(Product product)
        {
            return await Task.Run(() => CheckItemNumberValidity(product));
        }
        public bool CheckItemNumberValidity(Product product)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("product.checkitemnumbervalidity", new
                {
                    p_productid = product.Id,
                    p_itemnumber = product.ItemNumber
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<LayAway>> GetLayAwayAsync()
        {
            return await Task.Run(() => GetLayAway());
        }


        public IEnumerable<LayAway> GetLayAway()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LayAway>("product.getlayaway");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<LayAway> GetLayAwayByIdAsync(int id)
        {
            return await Task.Run(() => GetLayAwayById(id));
        }


        public LayAway GetLayAwayById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LayAway>("product.getlayawaybyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<LayAway> CreateProductLayAwayAsync(LayAway layAway)
        {
            return await Task.Run(() => CreateProductLayAway(layAway));
        }
        public LayAway CreateProductLayAway(LayAway layAway)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LayAway>("product.createproductlayaway", new
                {
                    p_description = layAway.Description,
                    p_datesofpayment = layAway.DatesOfPayment,
                    p_maxnumberofinstallmentpayment = layAway.MaxNumberOfInstallmentPayment,
                    p_percentofnonrefunddeposit = layAway.PercentOfNonRefundDeposit
                });

            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<LayAway> UpdateProductLayAwayAsync(LayAway layAway)
        {
            return await Task.Run(() => UpdateProductLayAway(layAway));
        }

        public LayAway UpdateProductLayAway(LayAway layAway)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LayAway>("product.updateproductlayaway", new
                {
                    p_id = layAway.Id,
                    p_description = layAway.Description,
                    p_datesofpayment = layAway.DatesOfPayment,
                    p_maxnumberofinstallmentpayment = layAway.MaxNumberOfInstallmentPayment,
                    p_percentofnonrefunddeposit = layAway.PercentOfNonRefundDeposit
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<bool> DeleteProductLayAwayAsync(int id)
        {
            return await Task.Run(() => DeleteProductLayAway(id));
        }

        public bool DeleteProductLayAway(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("product.deleteproductlayaway", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Product>> GetProductsListByCatCodeAsync(string code)
        {
            return await Task.Run(() => GetProductsListByCatCode(code));
        }


        public IEnumerable<Product> GetProductsListByCatCode(string code)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Product>("product.getproductslistbycatcode", new
                {
                    p_category = code
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<LayAway> GetActiveLayAwayAsync()
        {
            return await Task.Run(() => GetActiveLayAway());
        }


        public LayAway GetActiveLayAway()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LayAway>("product.getactivelayaway");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<LayAwayDate> CreateProductLayAwayDateAsync(LayAwayDate layAway)
        {
            return await Task.Run(() => CreateProductLayDayAway(layAway));
        }
        public LayAwayDate CreateProductLayDayAway(LayAwayDate layAway)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<LayAwayDate>("product.createlayawaydates", new
                {
                    p_paymentday = layAway.PaymentDay
                });

            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<bool> DeleteLayAwayDatesAsync(int paymentday)
        {
            return await Task.Run(() => DeleteLayAwayDates(paymentday));
        }

        public bool DeleteLayAwayDates(int paymentday)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("product.deletelayawaydates", new
                {
                    p_paymentday = paymentday
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<LayAwayDate>> GetLayAwayDatesAsync()
        {
            return await Task.Run(() => GetLayAwayDates());
        }


        public IEnumerable<LayAwayDate> GetLayAwayDates()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<LayAwayDate>("product.getlayawaydates");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Discount> CreateDiscountAsync(Discount discount)
        {
            return await Task.Run(() => CreateDiscount(discount));
        }
        public Discount CreateDiscount(Discount discount)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Discount>("product.creatediscount", new
                {
                    p_code = discount.Code,
                    p_description = discount.Description,
                    p_amounttypeid = discount.AmountTypeId,
                    p_amount = discount.Amount,
                    p_startdate = discount.StartDate,
                    p_enddate = discount.EndDate,
                    p_isactive = discount.IsActive,
                    p_isonetimeuse = discount.IsOneTimeUse

                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Discount>> GetDiscountListRangeAsync(Filter filter)
        {
            return await Task.Run(() => GetDiscountListRange(filter));
        }


        public IEnumerable<Discount> GetDiscountListRange(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Discount>("product.getdiscountlistrange", new
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

        public async Task<bool> DeleteDiscountByIdAsync(int id)
        {
            return await Task.Run(() => DeleteDiscountById(id));
        }

        public bool DeleteDiscountById(int id)
        {
            try
            {
                _npgSqlServerRepository.ExecuteThenReturn<bool>("product.deletediscountbyid", new
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
        public async Task<Discount> GetDiscountByIdAsync(int id)
        {
            return await Task.Run(() => GetDiscountById(id));
        }
        public Discount GetDiscountById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Discount>("product.getdiscountbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Discount> GetDiscountByCodeAsync(string code)
        {
            return await Task.Run(() => GetDiscountByCode(code));
        }
        public Discount GetDiscountByCode(string code)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Discount>("product.getdiscountbycode", new
                {
                    p_code = code
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }



        public async Task<Discount> UpdateDiscountAsync(Discount discount)
        {
            return await Task.Run(() => UpdateDiscount(discount));
        }

        public Discount UpdateDiscount(Discount discount)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Discount>("product.updatediscount", new
                {
                    p_id = discount.Id,
                    p_code = discount.Code,
                    p_description = discount.Description,
                    p_amounttypeid = discount.AmountTypeId,
                    p_amount = discount.Amount,
                    p_startdate = discount.StartDate,
                    p_enddate = discount.EndDate,
                    p_isonetimeuse = discount.IsOneTimeUse
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteProductCategoryByCodeAsync(string code)
        {
            return await Task.Run(() => DeleteProductCategoryByCode(code));
        }

        public bool DeleteProductCategoryByCode(string code)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("product.deleteproductcategorybycode", new
                {
                    p_code = code
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Product>> GetProductsRelatedListAsync(Filter filter)
        {
            return await Task.Run(() => GetProductsRelatedList(filter));
        }


        public IEnumerable<Product> GetProductsRelatedList(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Product>("product.getproductrelated", new
                {
                    p_category = filter.Category,
                    p_limit = filter.Limit,
                    p_productid = filter.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<HomeFeatures> CreateHomeFeatureAsync(HomeFeatures feature)
        {
            return await Task.Run(() => CreateHomeFeature(feature));
        }


        public HomeFeatures CreateHomeFeature(HomeFeatures feature)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<HomeFeatures>("product.createhomefeature", new
                {
                    p_first = feature.First,
                    p_second = feature.Second,
                    p_third = feature.Third,
                    p_fourth = feature.Fourth
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<HomeFeatures> GetHomeFeatureAsync()
        {
            return await Task.Run(() => GetHomeFeature());
        }


        public HomeFeatures GetHomeFeature()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<HomeFeatures>("product.gethomefeature");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Discount> ClaimDiscountAsync(string code)
        {
            return await Task.Run(() => ClaimDiscount(code));
        }


        public Discount ClaimDiscount(string code)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Discount>("product.claimdiscountbycode", new
                {
                    p_code = code
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public bool UpdateSendProductNotification(UserProductNotification notif)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("application.updatesendproductnotification", new
                {
                    p_email = notif.Email,
                    p_productid = notif.ProductId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> UpdateSendProductNotificationAsync(UserProductNotification notif)
        {
            return await Task.Run(() => UpdateSendProductNotification(notif));
        }
        public async Task<bool> MoveCategoryOrderIdAsync(int id, int moveTypeId)
        {
            return await Task.Run(() => MoveCategoryOrderId(id, moveTypeId));
        }
        public bool MoveCategoryOrderId(int id, int moveTypeId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("product.movecategoryorderid", new
                {
                    p_id = id,
                    p_movetypeid = moveTypeId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
    }
}