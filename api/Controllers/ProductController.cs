
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using ByzmoApi.DataAccess.Applcation;
using ByzmoApi.DataAccess.Common;
using System;

namespace ByzmoApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IAppSettings _appSettings;
        private readonly IProductService _productService;
        private readonly IFileService _fileService;
        private readonly ILoyaltyService _iLoyaltyService;


        public ProductController(IProductService productService,
            IAppSettings appSettings,
            IFileService fileService,
            ILoyaltyService iLoyaltyService)
        {
            _appSettings = appSettings;
            _productService = productService;
            _fileService = fileService;
            _iLoyaltyService = iLoyaltyService;
        }

        [AllowAnonymous]
        [HttpGet("getproducts")]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var products = await _productService.GetProductsAsync();
                var images = await _productService.GetProductImagesAsync();

                foreach (var product in products)
                {
                    product.ProductImages = images
                    .Where(x => x.ProductId == product.Id)
                    .ToList();
                }

                return Ok(products);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [AllowAnonymous]
        [HttpPost("getproductslistrange")]
        public async Task<IActionResult> GetProductsListRange(Filter filter)
        {
            try
            {
                var products = await _productService.GetProductsListRangeAsync(filter);

                foreach (var product in products)
                {
                    product.ProductImages = await _productService.GetProductImagesByIdAsync(product.Id);
                    product.Tags = await _productService.GetTagsByIdAsync(product.Id);
                }

                return Ok(products);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [AllowAnonymous]
        [HttpGet("getproductbyid/{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                var images = await _productService.GetProductImagesByIdAsync(id);
                var tags = await _productService.GetTagsByIdAsync(id);
                product.ProductImages = images;
                product.Tags = tags;
                return Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpGet("getproductbylinkname/{linkname}")]
        public async Task<IActionResult> GetProductById(string linkname)
        {
            try
            {
                var product = await _productService.GetProductByLinkNameAsync(linkname);
                var images = await _productService.GetProductImagesByIdAsync(product.Id);
                var tags = await _productService.GetTagsByIdAsync(product.Id);
                product.ProductImages = images;
                product.Tags = tags;
                return Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }




        [HttpPost("createproduct")]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            try
            {
                if (product == null) return BadRequest();
                var saveproduct = await _productService.CreateProductAsync(product);

                if (product.Tags.Count() > 0)
                {
                    foreach (var tag in product.Tags)
                    {
                        await _productService.CreateProductTagAsync(tag, saveproduct.Id);
                    }

                }

                // Returning user that has been created 
                return Ok(saveproduct);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("createproductimages")]
        public async Task<IActionResult> CreateProductImages([FromBody] IEnumerable<FileMapper> files)
        {
            var fileImages = new List<FileMapper>();
            try
            {
                foreach (FileMapper mapper in files)
                {
                    var result = await _productService.CreateProductImagesAsync(mapper);
                    fileImages.Add(result);
                }
                return Ok(fileImages);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPatch("updateproduct")]
        public async Task<IActionResult> UpdateProduct([FromBody] Product product)
        {
            try
            {
                if (product == null) return BadRequest();
                var saveproduct = await _productService.UpdateProductAsync(product);
                var tags = await _productService.GetTagsByIdAsync(product.Id);
                if (product.Tags.Count() > 0)
                {
                    foreach (var tag in product.Tags)
                    {
                        if (tags.Where(x => x.Name == tag.Name).Count() <= 0)
                            await _productService.CreateProductTagAsync(tag, product.Id);
                    }

                }
                // Returning user that has been created 
                return Ok(saveproduct);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [HttpPost("updatedefaultimg")]
        public async Task<IActionResult> UpdateDefaultImg([FromBody] Product product)
        {
            try
            {
                if (product != null)
                {
                    var fileName = product.CurrentImageUrl;
                    Uri result = null;
                    Uri.TryCreate(product.CurrentImageUrl, UriKind.Absolute, out result);

                    if (result != null)
                    {
                        fileName = _fileService.GetUrlFileName(product.CurrentImageUrl);
                    };

                    var success = await _productService.UpdateDefaultImgAsync(fileName, product.Id);
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("removeproductimages")]
        public async Task<IActionResult> RemoveProductImages([FromBody] IEnumerable<string> imagesToRemove)
        {
            try
            {
                if (imagesToRemove != null)
                {
                    string filePath = _appSettings.ProductImagePath;

                    foreach (var imageToRemove in imagesToRemove)
                    {
                        var fileName = _fileService.GetUrlFileName(imageToRemove);
                        var result = await _productService.RemoveImageAsync(fileName);
                        _fileService.Delete(fileName, filePath);
                    }
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("createproducttags")]
        public async Task<IActionResult> CreateProductTags([FromBody] IEnumerable<Tag> tags)
        {
            try
            {
                foreach (var tag in tags)
                {
                    await _productService.CreateProductTagAsync(tag, tag.ProductId);
                }
                
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("deleteproducttags")]
        public async Task<IActionResult> DeleteProductTags([FromBody] IEnumerable<Tag> tags)
        {
            try
            {
                foreach (var tag in tags)
                {
                    await _productService.DeleteProductTagsByIdAsync(tag.Id);
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpGet("gettoptags/{tag}")]
        public async Task<IActionResult> GetTopTagsAsync(string tag)
        {
            try
            {
                var tags = await _productService.GetTopTagsAsync(tag);
                return Ok(tags);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [HttpPost("createinventory")]
        public async Task<IActionResult> CreateProductInventory([FromBody] ProductInventory inventory)
        {
            try
            {
                //var product = await _productService.GetProductByIdAsync(inventory.ProductId);
                //product.Quantity += inventory.Quantity;

                var saveinventory = await _productService.CreateProductInventoryAsync(inventory);
                //var updateproduct = await _productService.UpdateProductAsync(product);


                return Ok(saveinventory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpGet("getinventorybyproductid/{productId}")]
        public async Task<IActionResult> GetInventoryByProductId(int productId)
        {
            try
            {
                var inventory = await _productService.GetInventoryByProductIdAsync(productId);
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpGet("getallcategory")]
        public async Task<IActionResult> GetAllCategory()
        {
            try
            {
                var category = await _productService.GetAllCategoryAsync();
                return Ok(category);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("deleteproductbyid")]
        public async Task<IActionResult> DeleteProductById([FromBody] int id)
        {
            try
            {
                var isDeleted = await _productService.DeleteProductByIdAsync(id);

                if (!isDeleted)
                    return NotFound(new { message = "Internal error in deleting product!" });

                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPost("checkitemnumbervalidity")]
        public async Task<IActionResult> CheckItemNumberValidity([FromBody] Product product)
        {
            try
            {
                if (product == null) return BadRequest();

                var isItemNumberValid = await _productService.CheckItemNumberValidityAsync(product);

                return Ok(isItemNumberValid);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("createproductcategory")]
        public async Task<IActionResult> CreateProductCategory([FromBody] ProductCategory category)
        {
            try
            {
                var resultcategory = await _productService.CreateProductCategoryAsync(category);

                if (resultcategory.Id == 0)
                    return NotFound(new { message = "Internal error in creating category" });

                return Ok(resultcategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPost("updateproductcategory")]
        public async Task<IActionResult> UpdateProductCategory([FromBody] ProductCategory category)
        {
            try
            {
                var resultcategory = await _productService.UpdateProductCategoryAsync(category);

                if (resultcategory.Id == 0)
                    return NotFound(new { message = "Internal error in creating category" });

                return Ok(resultcategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("deleteproductcategory")]
        public async Task<IActionResult> DeleteProductCategory([FromBody] int id)
        {
            try
            {
                var result = await _productService.DeleteProductCategoryAsync(id);

                if (!result)
                    return NotFound(new { message = "Internal error in deleting category" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [AllowAnonymous]
        [HttpGet("getlayaway")]
        public async Task<IActionResult> GetLayAway()
        {
            try
            {
                var category = await _productService.GetLayAwayAsync();
                return Ok(category);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("getlayawaybyid")]
        public async Task<IActionResult> GetLayAwayById(LayAway layaway)
        {
            try
            {
                var category = await _productService.GetLayAwayByIdAsync(layaway.Id);
                return Ok(category);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }



        [HttpPost("createproductlayaway")]
        public async Task<IActionResult> CreateProductLayAway([FromBody] LayAway layaway)
        {
            try
            {
                var resultcategory = await _productService.CreateProductLayAwayAsync(layaway);

                if (resultcategory.Id == 0)
                    return NotFound(new { message = "Internal error in creating category" });

                return Ok(resultcategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPatch("updateproductlayaway")]
        public async Task<IActionResult> UpdateProductLayAway([FromBody] LayAway layaway)
        {
            try
            {
                var resultcategory = await _productService.UpdateProductLayAwayAsync(layaway);

                if (resultcategory.Id == 0)
                    return NotFound(new { message = "Internal error in creating category" });

                return Ok(resultcategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("deleteproductlayaway")]
        public async Task<IActionResult> DeleteProductLayAway([FromBody] LayAway layaway)
        {
            try
            {
                var resultcategory = await _productService.DeleteProductLayAwayAsync(layaway.Id);

                if (!resultcategory)
                    return NotFound(new { message = "Internal error in deleting category" });

                return Ok(resultcategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpGet("getproductslistbycatcode/{code}")]
        public async Task<IActionResult> GetProductsListByCatCode(string code)
        {
            try
            {
                var products = await _productService.GetProductsListByCatCodeAsync(code);

                return Ok(products);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpGet("getactivelayaway")]
        public async Task<IActionResult> GetActiveLayAway()
        {
            try
            {
                var category = await _productService.GetActiveLayAwayAsync();
                return Ok(category);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }



        [HttpPost("createlayawaydates")]
        public async Task<IActionResult> CreateLayAwayDates([FromBody] LayAwayDate layaway)
        {
            try
            {
                var resultcategory = await _productService.CreateProductLayAwayDateAsync(layaway);

                if (resultcategory.Id == 0)
                    return NotFound(new { message = "Internal error in creating category" });

                return Ok(resultcategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("deletelayawaydates")]
        public async Task<IActionResult> DeleteLayAwayDates([FromBody] LayAwayDate layaway)
        {
            try
            {
                var resultcategory = await _productService.DeleteLayAwayDatesAsync(layaway.PaymentDay);

                if (!resultcategory)
                    return NotFound(new { message = "Internal error in deleting category" });

                return Ok(resultcategory);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [AllowAnonymous]
        [HttpGet("getlayawaydates")]
        public async Task<IActionResult> GetLayAwayDates()
        {
            try
            {
                var category = await _productService.GetLayAwayDatesAsync();
                return Ok(category);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [HttpPost("creatediscount")]
        public async Task<IActionResult> CreateDiscount([FromBody] Discount discount)
        {
            try
            {
                if (discount == null) return BadRequest();
                var savediscount = await _productService.CreateDiscountAsync(discount);
                return Ok(savediscount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpPost("getdiscountlistrange")]
        public async Task<IActionResult> GetDiscountListRange(Filter filter)
        {
            try
            {
                var discounts = await _productService.GetDiscountListRangeAsync(filter);
                return Ok(discounts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("deletediscountbyid")]
        public async Task<IActionResult> DeleteDiscountById([FromBody] int id)
        {
            try
            {
                var isDeleted = await _productService.DeleteDiscountByIdAsync(id);

                if (!isDeleted)
                    return NotFound(new { message = "Internal error in deleting discount!" });

                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpGet("getdiscountbyid/{id}")]
        public async Task<IActionResult> GetDiscountById(int id)
        {
            try
            {
                var discount = await _productService.GetDiscountByIdAsync(id);
                return Ok(discount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpGet("getdiscountbycode/{code}")]
        public async Task<IActionResult> GetDiscountByCode(string code)
        {
            try
            {
                var discount = await _productService.GetDiscountByCodeAsync(code);
                return Ok(discount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpPost("getalldiscountbycode")]
        public async Task<IActionResult> GetAllDiscountByCode(Discount disc)
        {
            try
            {
                var discount = await _productService.GetDiscountByCodeAsync(disc.Code);
                
                if (discount == null)
                {
                    var filter = new Filter();
                    filter.Offset = 0;
                    filter.Limit = 99999;

                    var loyaltyDiscount = await _iLoyaltyService.GetLoyaltyDiscountListRangeAsync(filter);
                    var lastTier = loyaltyDiscount.Where(x => x.RangeFrom == loyaltyDiscount.Max(y => y.RangeFrom)).First();

                    var loyalty = await _iLoyaltyService.GetLoyaltyVoucherByCodeAsync(disc.Code);
                    if (loyalty != null)
                    {
                        var voucher = await _iLoyaltyService.GetLoyaltyDiscountByIdAsync(loyalty.LoyaltyDiscountId);

                        var isActive = !loyalty.IsActive ? loyalty.IsActive : !loyalty.IsClaimed;
                        if (!isActive)
                            isActive = loyalty.LoyaltyDiscountId == lastTier.Id;


                        discount = new Discount()
                        {
                            Id = loyalty.Id,
                            Code = loyalty.DiscountCode,
                            Amount = voucher.Discount,
                            AmountTypeId = voucher.DiscountAmountType,
                            StartDate = DateTime.Now,
                            EndDate = DateTime.Now.AddDays(1),
                            IsActive = isActive
                        };
                    }
                    else
                    {
                        discount = new Discount();
                    }

                } else {
                    discount.IsActive = discount.IsActive ? !discount.IsClaimed : discount.IsActive;
                }


                return Ok(discount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [HttpPatch("updatediscount")]
        public async Task<IActionResult> UpdateDiscount([FromBody] Discount discount)
        {
            try
            {
                if (discount == null) return BadRequest();
                var discountData = await _productService.UpdateDiscountAsync(discount);

                return Ok(discountData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("deleteproductcategorylist")]
        public async Task<IActionResult> DeleteProductCategoryList([FromBody] IEnumerable<string> Category)
        {
            try
            {
                bool deleted = false;
                foreach (var id in Category)
                {
                    deleted = await _productService.DeleteProductCategoryByCodeAsync(id);
                }
                return Ok(deleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpPost("getproductrelated")]
        public async Task<IActionResult> GetProductRelated([FromBody] Filter Category)
        {
            try
            {
                var products = await _productService.GetProductsRelatedListAsync(Category);
                foreach (var product in products)
                {
                    product.ProductImages = await _productService.GetProductImagesByIdAsync(product.Id);
                    product.Tags = await _productService.GetTagsByIdAsync(product.Id);
                }

                return Ok(products);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpPost("createhomefeature")]
        public async Task<IActionResult> CreateHomeFeature([FromBody] HomeFeatures Category)
        {
            try
            {
                var products = await _productService.CreateHomeFeatureAsync(Category);

                return Ok(products);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [AllowAnonymous]
        [HttpGet("gethomefeature")]
        public async Task<IActionResult> GetHomeFeature()
        {
            try
            {
                var products = await _productService.GetHomeFeatureAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("updatesendproductnotification")]
        public async Task<IActionResult> UpdateSendProductNotification([FromBody] UserProductNotification notif)
        {
            try
            {
                var result = await _productService.UpdateSendProductNotificationAsync(notif);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPost("movecategoryorderid")]
        public async Task<IActionResult> MoveOrderId([FromBody] ProductCategory productCategory)
        {
            try
            {
                var isMoved = await _productService.MoveCategoryOrderIdAsync(productCategory.Id, productCategory.MoveTypeId);

                if (!isMoved)
                    return NotFound(new { message = "Internal error in moving order id!" });

                return Ok(isMoved);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

    }
}
