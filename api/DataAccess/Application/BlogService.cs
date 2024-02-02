using System.Threading.Tasks;
using ByzmoApi.Models;
using ByzmoApi.Helpers;
using Npgsql;
using System.Collections.Generic;

namespace ByzmoApi.DataAccess.Applcation
{
    public interface IBlogService
    {
        Task<Blog> CreateBlogAsync(Blog blog);
        Blog CreateBlog(Blog blog);
        Task<IEnumerable<Blog>> GetBlogsListRangeAsync(Filter filter);
        IEnumerable<Blog> GetBlogsListRange(Filter filter);
        Task<BlogContent> CreateBlogContentAsync(BlogContent blogContent);
        BlogContent CreateBlogContent(BlogContent blogContent);
        Task<FileMapper> CreateBlogImagesAsync(FileMapper blogImages);
        FileMapper CreateBlogImages(FileMapper blogImages);
        Task<Blog> GetBlogByIdAsync(int id);
        Blog GetBlogById(int id);

        Task<Blog> GetBlogByTitleAsync(string title);
        Blog GetBlogByTitle(string title);
        Task<IEnumerable<BlogContent>> GetBlogContentsByBlogIdAsync(int blogId);
        IEnumerable<BlogContent> GetBlogContentsByBlogId(int blogId);
        Task<IEnumerable<BlogImage>> GetBlogContentImagesbyBlogContentIdAsync(int blogContentId);
        IEnumerable<BlogImage> GetBlogContentImagesbyBlogContentId(int blogContentId);
        Task<Blog> UpdateBlogAsync(Blog blog);
        Blog UpdateBlog(Blog blog);
        Task<BlogContent> UpdateBlogContentAsync(BlogContent blogContent);
        BlogContent UpdateBlogContent(BlogContent blogContent);
        Task<bool> DeleteBlogContentByIdAsync(int contentId);
        bool DeleteBlogContentById(int contentId);
        Task<bool> DeleteBlogImageAsync(string filename);
        bool DeleteBlogImage(string filename);
        Task<bool> DeleteBlogByIdAsync(int id);
        bool DeleteBlogById(int id);
        Task<IEnumerable<Blog>> GetMostBlogContentAsync();
        IEnumerable<Blog> GetMostBlogContent();
        Task<IEnumerable<Blog>> GetTrendingBlogContentAsync();
        IEnumerable<Blog> GetTrendingBlogContent();
        Task<IEnumerable<Tag>> GetTagsByIdAsync(int blogId);
        IEnumerable<Tag> GetTagsById(int blogId);
        Task<Tag> CreateBlogTagAsync(Tag tag, int blogId);
        Tag CreateBlogTag(Tag tag, int blogId);
        Task<bool> DeleteBlogTagsByIdAsync(int id);
        bool DeleteBlogTagsById(int id);
        Task<IEnumerable<Tag>> GetTopTagsAsync(string tag);
        IEnumerable<Tag> GetTopTags(string tag);
        Task<IEnumerable<Blog>> GetBlogsListRangeDateAsync(Filter filter);
        IEnumerable<Blog> GetBlogsListRangeDate(Filter filter);
        Task<BlogComment> CreateBlogCommentAsync(BlogComment blogComment);
        BlogComment CreateBlogComment(BlogComment blogComment);
        Task<IEnumerable<BlogComment>> GetBlogCommentsByBlogIdAsync(int blogId);
        IEnumerable<BlogComment> GetBlogCommentsByBlogId(int blogId);
        Task<bool> DeleteBlogCommentByIdAsync(int id, int groupId, int blogId);
        bool DeleteBlogCommentById(int id, int groupId, int blogId);

        Task<IEnumerable<Blog>> GetPopularContentAsync();
        IEnumerable<Blog> GetPopularContent();
    }

    public class BlogService : BaseNpgSqlServerService, IBlogService
    {

        public BlogService(INpgSqlServerRepository npgSqlServerRepository, IAppSettings appSettings) : base(npgSqlServerRepository, appSettings)
        {

        }

        public async Task<Blog> CreateBlogAsync(Blog blog)
        {
            return await Task.Run(() => CreateBlog(blog));
        }
        public Blog CreateBlog(Blog blog)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Blog>("blog.createblog", new
                {
                    p_title = blog.Title,
                    p_description = blog.Description,
                    p_startdate = blog.StartDate,
                    p_enddate = blog.EndDate,
                    p_allday = blog.AllDay,
                    p_coverid = blog.CoverId,
                    p_coverfilename = blog.CoverFileName,
                    p_isactive = blog.IsActive,
                    p_isdraft = blog.IsDraft,
                    p_titleurl = blog.TitleUrl
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Blog>> GetBlogsListRangeAsync(Filter filter)
        {
            return await Task.Run(() => GetBlogsListRange(filter));
        }


        public IEnumerable<Blog> GetBlogsListRange(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Blog>("blog.getblogslistrange", new
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

        public async Task<BlogContent> CreateBlogContentAsync(BlogContent blogContent)
        {
            return await Task.Run(() => CreateBlogContent(blogContent));
        }
        public BlogContent CreateBlogContent(BlogContent blogContent)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<BlogContent>("blog.createblogcontent", new
                {
                    p_blogid = blogContent.BlogId,
                    p_headertext = blogContent.HeaderText,
                    p_description = blogContent.Description,
                    p_typeid = blogContent.TypeId,
                    p_sortid = blogContent.SortId,
                    p_videolink = blogContent.VideoLink
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<FileMapper> CreateBlogImagesAsync(FileMapper blogImages)
        {
            return await Task.Run(() => CreateBlogImages(blogImages));
        }

        public FileMapper CreateBlogImages(FileMapper blogImages)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<FileMapper>("blog.createblogimages", new
                {
                    p_blogcontentid = blogImages.Key,
                    p_filestorageid = blogImages.Id,
                    p_filename = blogImages.FileName
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<BlogContent>> GetBlogContentsByBlogIdAsync(int blogId)
        {
            return await Task.Run(() => GetBlogContentsByBlogId(blogId));
        }
        public IEnumerable<BlogContent> GetBlogContentsByBlogId(int blogId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<BlogContent>("blog.getblogcontentsbyblogid", new
                {
                    p_blogid = blogId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<BlogImage>> GetBlogContentImagesByBlogContentIdAsync(int blogContentId)
        {
            return await Task.Run(() => GetBlogContentImagesByBlogContentId(blogContentId));
        }
        public IEnumerable<BlogImage> GetBlogContentImagesByBlogContentId(int blogContentId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<BlogImage>("blog.getblogcontentimagesbyblogcontentid", new
                {
                    p_contentid = blogContentId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<Blog> GetBlogByIdAsync(int id)
        {
            return await Task.Run(() => GetBlogById(id));
        }
        public Blog GetBlogById(int id)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Blog>("blog.getblogbyid", new
                {
                    p_id = id
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Blog> GetBlogByTitleAsync(string title)
        {
            return await Task.Run(() => GetBlogByTitle(title));
        }
        public Blog GetBlogByTitle(string title)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Blog>("blog.getblogbytitle", new
                {
                    p_title = title
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<Blog>> GetMostBlogContentAsync()
        {
            return await Task.Run(() => GetMostBlogContent());
        }
        public IEnumerable<Blog> GetMostBlogContent()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Blog>("blog.getmostblogcontent");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Blog>> GetPopularContentAsync()
        {
            return await Task.Run(() => GetPopularContent());
        }
        public IEnumerable<Blog> GetPopularContent()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Blog>("blog.getpopularcontent");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<IEnumerable<Blog>> GetTrendingBlogContentAsync()
        {
            return await Task.Run(() => GetTrendingBlogContent());
        }
        public IEnumerable<Blog> GetTrendingBlogContent()
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Blog>("blog.gettrendingblogcontent");
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<IEnumerable<BlogImage>> GetBlogContentImagesbyBlogContentIdAsync(int blogContentId)
        {
            return await Task.Run(() => GetBlogContentImagesbyBlogContentId(blogContentId));
        }
        public IEnumerable<BlogImage> GetBlogContentImagesbyBlogContentId(int blogContentId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<BlogImage>("blog.getblogcontentimagesbyblogcontentid", new
                {
                    p_contentid = blogContentId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<Blog> UpdateBlogAsync(Blog blog)
        {
            return await Task.Run(() => UpdateBlog(blog));
        }

        public Blog UpdateBlog(Blog blog)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Blog>("blog.updateblog", new
                {
                    p_id = blog.Id,
                    p_title = blog.Title,
                    p_description = blog.Description,
                    p_startdate = blog.StartDate,
                    p_enddate = blog.EndDate,
                    p_allday = blog.AllDay,
                    p_coverid = blog.CoverId,
                    p_coverfilename = blog.CoverFileName,
                    p_isdraft = blog.IsDraft,
                    p_titleurl = blog.TitleUrl
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<BlogContent> UpdateBlogContentAsync(BlogContent blogContent)
        {
            return await Task.Run(() => UpdateBlogContent(blogContent));
        }
        public BlogContent UpdateBlogContent(BlogContent blogContent)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<BlogContent>("blog.updateblogcontent", new
                {
                    p_id = blogContent.Id,
                    p_blogid = blogContent.BlogId,
                    p_headertext = blogContent.HeaderText,
                    p_description = blogContent.Description,
                    p_typeid = blogContent.TypeId,
                    p_sortid = blogContent.SortId,
                    p_videolink = blogContent.VideoLink
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteBlogContentByIdAsync(int contentId)
        {
            return await Task.Run(() => DeleteBlogContentById(contentId));
        }
        public bool DeleteBlogContentById(int contentId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("blog.deleteblogcontentbyid", new
                {
                    p_contentid = contentId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<bool> DeleteBlogImageAsync(string filename)
        {
            return await Task.Run(() => DeleteBlogImage(filename));
        }

        public bool DeleteBlogImage(string filename)
        {
            try
            {
                _npgSqlServerRepository.ExecuteThenReturn<bool>("blog.deleteblogimage", new
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

        public async Task<bool> DeleteBlogByIdAsync(int id)
        {
            return await Task.Run(() => DeleteBlogById(id));
        }

        public bool DeleteBlogById(int id)
        {
            try
            {
                _npgSqlServerRepository.ExecuteThenReturn<bool>("blog.deleteblogbyid", new
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
        public async Task<IEnumerable<Tag>> GetTagsByIdAsync(int blogId)
        {
            return await Task.Run(() => GetTagsById(blogId));
        }


        public IEnumerable<Tag> GetTagsById(int blogId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Tag>("blog.getblogtagsbyid", new
                {
                    p_blogid = blogId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<Tag> CreateBlogTagAsync(Tag tag, int blogId)
        {
            return await Task.Run(() => CreateBlogTag(tag, blogId));
        }

        public Tag CreateBlogTag(Tag tag, int blogId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<Tag>("blog.createblogtags", new
                {
                    p_name = tag.Name,
                    p_blogid = blogId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<bool> DeleteBlogTagsByIdAsync(int tagId)
        {
            return await Task.Run(() => DeleteBlogTagsById(tagId));
        }

        public bool DeleteBlogTagsById(int tagId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("blog.deleteblogtagsbyid", new
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
                return _npgSqlServerRepository.ExecuteThenReturnList<Tag>("blog.gettoptags", new
                {
                    p_tag = tag
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<IEnumerable<Blog>> GetBlogsListRangeDateAsync(Filter filter)
        {
            return await Task.Run(() => GetBlogsListRangeDate(filter));
        }


        public IEnumerable<Blog> GetBlogsListRangeDate(Filter filter)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<Blog>("blog.getblogslistrangedate", new
                {
                    p_blogname = filter.BlogName,
                    p_offset = filter.Offset,
                    p_limit = filter.Limit
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }

        public async Task<BlogComment> CreateBlogCommentAsync(BlogComment blogComment)
        {
            return await Task.Run(() => CreateBlogComment(blogComment));
        }
        public BlogComment CreateBlogComment(BlogComment blogComment)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<BlogComment>("blog.createblogcomments", new
                {
                    p_commentid = blogComment.CommentId,
                    p_blogid = blogComment.BlogId,
                    p_commentcontent = blogComment.CommentContent,
                    p_userid = blogComment.UserId,
                    p_parentid = blogComment.ParentId,
                    p_fromuserid = blogComment.FromUserId,
                    p_groupid = blogComment.GroupId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<IEnumerable<BlogComment>> GetBlogCommentsByBlogIdAsync(int blogId)
        {
            return await Task.Run(() => GetBlogCommentsByBlogId(blogId));
        }
        public IEnumerable<BlogComment> GetBlogCommentsByBlogId(int blogId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturnList<BlogComment>("blog.getblogcommentsbyid", new
                {
                    p_blogid = blogId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
        public async Task<bool> DeleteBlogCommentByIdAsync(int id, int groupId, int blogId)
        {
            return await Task.Run(() => DeleteBlogCommentById(id, groupId, blogId));
        }
        public bool DeleteBlogCommentById(int id, int groupId, int blogId)
        {
            try
            {
                return _npgSqlServerRepository.ExecuteThenReturn<bool>("blog.deleteblogcommentbyid", new
                {
                    p_id = id,
                    p_groupid = groupId,
                    p_blogid = blogId
                });
            }
            catch (NpgsqlException ex)
            {
                throw ex;
            }
        }
    }
}