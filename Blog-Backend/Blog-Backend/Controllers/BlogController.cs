using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Blog_Backend.DTO;
using Blog_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Blog_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BlogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BlogController> _logger;

        public BlogController(ApplicationDbContext context, ILogger<BlogController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("createBlog")]
        public async Task<IActionResult> CreateBlog([FromForm] CreateBlogDTO createBlogDTO, IFormFile? image)
        {
            try
            {
                if (createBlogDTO == null)
                {
                    return BadRequest("Invalid blog data.");
                }

                var readerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (readerIdClaim == null || !int.TryParse(readerIdClaim.Value, out int readerId))
                {
                    return Unauthorized("Unable to identify the user.");
                }

                var reader = await _context.Readers.FindAsync(readerId);
                if (reader == null)
                {
                    return NotFound("Reader not found.");
                }

                string imageUrl = null;
                if (image != null && image.Length > 0)
                {
                    try
                    {
                        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                        if (!Directory.Exists(uploads))
                        {
                            Directory.CreateDirectory(uploads);
                        }

                        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                        var filePath = Path.Combine(uploads, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        imageUrl = $"/images/{fileName}";
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error occurred while saving the image.");
                        return StatusCode(500, "An error occurred while uploading the image.");
                    }
                }

                var newBlog = new Blog
                {
                    Title = createBlogDTO.Title,
                    Category = createBlogDTO.Category,
                    Description = createBlogDTO.Description,
                    CreatedAt = DateTime.UtcNow,
                    ReaderId = readerId,
                    ImageUrl = imageUrl
                };

                _context.Blogs.Add(newBlog);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetBlog), new { id = newBlog.BlogId }, newBlog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating blog.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }




        // Get All Blogs
        [HttpGet("allBlogs")]
        [AllowAnonymous] // No need for authorization to view all blogs
        public async Task<ActionResult<IEnumerable<BlogDTO>>> GetAllBlogs()
        {
            var blogs = await _context.Blogs
                .Include(b => b.Author)  // Include the related Reader to get the author's details
                .ToListAsync();

            if (blogs == null || !blogs.Any())
            {
                return NotFound("No blogs found.");
            }

            // Map blogs to BlogDTOs, including the author's name and image URL
            var blogDTOs = blogs.Select(blog => new BlogDTO
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Category = blog.Category,
                Description = blog.Description,
                CreatedAt = blog.CreatedAt,
                BlogStatus = blog.BlogStatus,
                Author = $"{blog.Author.FirstName} {blog.Author.LastName}",  // Combine first and last name for the author
                ImageUrl = blog.ImageUrl  // Add image URL to the response
            }).ToList();

            return Ok(blogDTOs);
        }


        // View a specific blog
        [HttpGet("viewBlog/{id}")]
        [AllowAnonymous] // No need for authorization to view a blog
        public async Task<ActionResult<BlogDTO>> GetBlog(int id)
        {
            var blog = await _context.Blogs
                .Include(b => b.Author)  // Include the related Reader (Author)
                .FirstOrDefaultAsync(b => b.BlogId == id);

            if (blog == null)
            {
                return NotFound();
            }

            // Return a BlogDTO that includes the blog details, the author's name, and the image URL
            var blogDTO = new BlogDTO
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Category = blog.Category,
                Description = blog.Description,
                CreatedAt = blog.CreatedAt,
                Author = $"{blog.Author.FirstName} {blog.Author.LastName}",  // Combine first and last name for the author
                ImageUrl = blog.ImageUrl  // Include the image URL
            };

            return Ok(blogDTO);
        }


        //Update Blog
        [HttpPut("updateBlog/{id}")]
        public async Task<IActionResult> UpdateBlog(int id, [FromBody] UpdateBlogDTO updateBlogDTO)
        {
            if (updateBlogDTO == null)
            {
                return BadRequest("Invalid blog data.");
            }

            // Fetch the blog to update
            var blog = await _context.Blogs.Include(b => b.Author).FirstOrDefaultAsync(b => b.BlogId == id);
            if (blog == null)
            {
                return NotFound("Blog not found.");
            }

            // Log the current claims
            foreach (var claim in User.Claims)
            {
                _logger.LogInformation($"Claim: {claim.Type} = {claim.Value}");
            }

            // Get the current user's ReaderId from claims
            var readerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst("sub") 
                ?? User.FindFirst("ReaderId")
                ?? User.Claims.FirstOrDefault(c => c.Type.Contains("nameidentifier", StringComparison.OrdinalIgnoreCase));

            if (readerIdClaim == null)
            {
                _logger.LogWarning("Unable to find ReaderId in the token claims.");
                return Unauthorized("Unable to identify the user.");
            }

            if (!int.TryParse(readerIdClaim.Value, out int readerId))
            {
                _logger.LogWarning($"Failed to parse ReaderId: {readerIdClaim.Value}");
                return BadRequest("Invalid user identification.");
            }

            // Ensure the current user is the author of the blog
            if (blog.ReaderId != readerId)
            {
                return Forbid("You are not authorized to update this blog.");
            }

            // Show current content before update
            _logger.LogInformation($"Blog before update: Title: {blog.Title}, Category: {blog.Category}, Description: {blog.Description}");

            // Update the blog fields
            blog.Title = updateBlogDTO.Title;
            blog.Category = updateBlogDTO.Category;
            blog.Description = updateBlogDTO.Description;
            
            // Save changes
            try
            {
                _context.Blogs.Update(blog);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Blog with ID: {blog.BlogId} updated successfully by reader: {readerId}");
                return Ok($"Blog with ID {id} updated successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating blog");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        
        //Delete Blog
        [HttpPut("deleteBlog/{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            // Fetch the blog to delete
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.BlogId == id);
            if (blog == null)
            {
                return NotFound("Blog not found.");
            }

            // Log the current claims
            foreach (var claim in User.Claims)
            {
                _logger.LogInformation($"Claim: {claim.Type} = {claim.Value}");
            }

            // Get the current user's ReaderId from claims
            var readerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                                ?? User.FindFirst("sub") 
                                ?? User.FindFirst("ReaderId")
                                ?? User.Claims.FirstOrDefault(c => c.Type.Contains("nameidentifier", StringComparison.OrdinalIgnoreCase));

            if (readerIdClaim == null)
            {
                _logger.LogWarning("Unable to find ReaderId in the token claims.");
                return Unauthorized("Unable to identify the user.");
            }

            if (!int.TryParse(readerIdClaim.Value, out int readerId))
            {
                _logger.LogWarning($"Failed to parse ReaderId: {readerIdClaim.Value}");
                return BadRequest("Invalid user identification.");
            }

            // Ensure the current user is the author of the blog
            if (blog.ReaderId != readerId)
            {
                return Forbid("You are not authorized to delete this blog.");
            }

            // Update the blog status to "deleted" (0)
            blog.BlogStatus = 0; // Assuming blogStatus is 1 for active and 0 for deleted

            try
            {
                _context.Blogs.Update(blog);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Blog with ID: {blog.BlogId} soft deleted successfully by reader: {readerId}");
                return Ok($"Blog with ID {id} has been deleted successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting blog");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("myBlogs")]
        public async Task<ActionResult<IEnumerable<BlogDTO>>> GetMyBlogs()
        {
            var readerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (readerIdClaim == null || !int.TryParse(readerIdClaim.Value, out int readerId))
            {
                return Unauthorized("Unable to identify the user.");
            }

            var blogs = await _context.Blogs
                .Where(b => b.ReaderId == readerId)
                .Include(b => b.Author)
                .ToListAsync();

            if (blogs == null || !blogs.Any())
            {
                return NotFound("No blogs found for the current user.");
            }

            var blogDTOs = blogs.Select(blog => new BlogDTO
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Category = blog.Category,
                Description = blog.Description,
                CreatedAt = blog.CreatedAt,
                BlogStatus = blog.BlogStatus,
                Author = $"{blog.Author.FirstName} {blog.Author.LastName}",
                ImageUrl = blog.ImageUrl
            }).ToList();

            return Ok(blogDTOs);
        }




    }
}