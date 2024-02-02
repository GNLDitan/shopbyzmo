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
    public class BlogController : ControllerBase
    {
        private readonly IBlogService _blogService;
        private readonly IAppSettings _appSettings;
        private readonly IFileService _fileService;

        public BlogController(IBlogService blogService, IAppSettings appSettings, IFileService fileService)
        {
            _blogService = blogService;
            _appSettings = appSettings;
            _fileService = fileService;
        }

        [AllowAnonymous]
        [HttpPost("getblogslistrange")]
        public async Task<IActionResult> GetBlogsListRange(Filter filter)
        {
            try
            {
                var blogs = await _blogService.GetBlogsListRangeAsync(filter);

                foreach (var blog in blogs)
                {
                    blog.BlogContents = await _blogService.GetBlogContentsByBlogIdAsync(blog.Id);
                    foreach (var content in blog.BlogContents.Where(x => x.TypeId == 2).ToList())
                    {
                        content.ContentImages = await _blogService.GetBlogContentImagesbyBlogContentIdAsync(content.Id);
                    }
                }

                return Ok(blogs);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [AllowAnonymous]
        [HttpPost("getblogslistrangedate")]
        public async Task<IActionResult> GetBlogsListRangeDate(Filter filter)
        {
            try
            {
                var blogs = await _blogService.GetBlogsListRangeDateAsync(filter);

                foreach (var blog in blogs)
                {
                    blog.BlogContents = await _blogService.GetBlogContentsByBlogIdAsync(blog.Id);
                    foreach (var content in blog.BlogContents.Where(x => x.TypeId == 2).ToList())
                    {
                        content.ContentImages = await _blogService.GetBlogContentImagesbyBlogContentIdAsync(content.Id);
                    }
                }

                return Ok(blogs);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [HttpPost("createblog")]
        public async Task<IActionResult> CreateBlog([FromBody] Blog blog)
        {
            try
            {
                if (blog == null) return BadRequest();
                var blogData = await _blogService.CreateBlogAsync(blog);
                blog.Id = blogData.Id;

                if (blog.Tags.Count() > 0)
                {
                    foreach (var tag in blog.Tags)
                    {
                        await _blogService.CreateBlogTagAsync(tag, blogData.Id);
                    }

                }

                foreach (var blc in blog.BlogContents)
                {
                    blc.BlogId = blogData.Id;
                    var blogContent = await _blogService.CreateBlogContentAsync(blc);
                    blc.Id = blogContent.Id;
                }



                return Ok(blog);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("createblogimages")]
        public async Task<IActionResult> CreateBlogImages([FromBody] IEnumerable<FileMapper> files)
        {
            var fileImages = new List<FileMapper>();
            try
            {
                foreach (FileMapper mapper in files)
                {
                    var result = await _blogService.CreateBlogImagesAsync(mapper);
                    fileImages.Add(result);
                }
                return Ok(fileImages);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpGet("getmostblogcontent")]
        public async Task<IActionResult> GetMostBlogContent()
        {
            try
            {
                var blog = await _blogService.GetMostBlogContentAsync();
                return Ok(blog);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [AllowAnonymous]
        [HttpGet("getpopularcontent")]
        public async Task<IActionResult> getPopularContent()
        {
            try
            {
                var blog = await _blogService.GetPopularContentAsync();
                return Ok(blog);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }


        [AllowAnonymous]
        [HttpGet("gettrendingblogcontent")]
        public async Task<IActionResult> GetTrendingBlogContent()
        {
            try
            {
                var blog = await _blogService.GetTrendingBlogContentAsync();
                return Ok(blog);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [AllowAnonymous]
        [HttpGet("getblogbyid/{id}")]
        public async Task<IActionResult> GetBlogById(int id)
        {
            try
            {
                var blog = await _blogService.GetBlogByIdAsync(id);
                var tags = await _blogService.GetTagsByIdAsync(id);
                blog.BlogContents = await _blogService.GetBlogContentsByBlogIdAsync(blog.Id);
                blog.Tags = tags;
                foreach (var blg in blog.BlogContents)
                {
                    if (blg.TypeId != 1)
                    {
                        blg.ContentImages = await _blogService.GetBlogContentImagesbyBlogContentIdAsync(blg.Id);
                    }

                }
                return Ok(blog);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [AllowAnonymous]
        [HttpGet("getblogbytitle/{title}")]
        public async Task<IActionResult> GetBlogByTitle(string title)
        {
            try
            {
                var blog = await _blogService.GetBlogByTitleAsync(title);
                var tags = await _blogService.GetTagsByIdAsync(blog.Id);
                blog.BlogContents = await _blogService.GetBlogContentsByBlogIdAsync(blog.Id);
                blog.Tags = tags;
                foreach (var blg in blog.BlogContents)
                {
                    if (blg.TypeId != 1)
                    {
                        blg.ContentImages = await _blogService.GetBlogContentImagesbyBlogContentIdAsync(blg.Id);
                    }

                }
                return Ok(blog);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpPatch("updateblog")]
        public async Task<IActionResult> UpdateBlog([FromBody] Blog blog)
        {
            try
            {
                if (blog == null) return BadRequest();
                var blogData = await _blogService.UpdateBlogAsync(blog);

                var tags = await _blogService.GetTagsByIdAsync(blog.Id);
                if (blog.Tags.Count() > 0)
                {
                    foreach (var tag in blog.Tags)
                    {
                        if (tags.Where(x => x.Name == tag.Name).Count() <= 0)
                            await _blogService.CreateBlogTagAsync(tag, blog.Id);
                    }

                }

                foreach (var blc in blog.BlogContents)
                {
                    blc.BlogId = blogData.Id;
                    if (blc.IsDeleted)
                    {
                        await _blogService.DeleteBlogContentByIdAsync(blc.Id);
                    }
                    else
                    {
                        var blogContent = blc.IsNew ? await _blogService.CreateBlogContentAsync(blc) :
                                       await _blogService.UpdateBlogContentAsync(blc);
                        blc.Id = blogContent.Id;
                    }

                }



                return Ok(blog);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("deleteblogimages")]
        public async Task<IActionResult> DeleteBlogImages([FromBody] IEnumerable<string> imagesToRemove)
        {
            try
            {
                if (imagesToRemove != null)
                {
                    string filePath = _appSettings.BlogImagePath;

                    foreach (var imageToRemove in imagesToRemove)
                    {
                        var fileName = _fileService.GetUrlFileName(imageToRemove);
                        var result = await _blogService.DeleteBlogImageAsync(fileName);
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
        [HttpPost("deleteblogbyid")]
        public async Task<IActionResult> DeleteBlogById([FromBody] int id)
        {
            try
            {
                var isDeleted = await _blogService.DeleteBlogByIdAsync(id);

                if (!isDeleted)
                    return NotFound(new { message = "Internal error in deleting blog!" });

                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpPost("deleteblogtags")]
        public async Task<IActionResult> DeleteBlogTags([FromBody] IEnumerable<Tag> tags)
        {
            try
            {
                foreach (var tag in tags)
                {
                    await _blogService.DeleteBlogTagsByIdAsync(tag.Id);
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
                var tags = await _blogService.GetTopTagsAsync(tag);
                return Ok(tags);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [AllowAnonymous]
        [HttpPost("createblogcomment")]
        public async Task<IActionResult> CreateBlogComment([FromBody] BlogComment blogComment)
        {
            try
            {
                if (blogComment == null) return BadRequest();
                var blogCommentData = await _blogService.CreateBlogCommentAsync(blogComment);
                return Ok(blogCommentData);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [AllowAnonymous]
        [HttpGet("getblogcommentsbyid/{id}")]
        public async Task<IActionResult> GetBlogCommentsById(int id)
        {
            try
            {
                var blogComments = await _blogService.GetBlogCommentsByBlogIdAsync(id);
                return Ok(blogComments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
        [AllowAnonymous]
        [HttpPost("deleteblogcommentbyid")]
        public async Task<IActionResult> DeleteBlogCommentById([FromBody] BlogComment blogComment)
        {
            try
            {
                var isDeleted = await _blogService.DeleteBlogCommentByIdAsync(blogComment.Id, blogComment.GroupId, blogComment.BlogId);

                if (!isDeleted)
                    return NotFound(new { message = "Internal error in deleting blog comment!" });

                return Ok(isDeleted);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }
    }
}