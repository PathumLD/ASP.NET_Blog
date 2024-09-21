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
        public async Task<ActionResult<Blog>> CreateBlog([FromBody] CreateBlogDTO createBlogDTO)
        {
            if (createBlogDTO == null)
            {
                return BadRequest("Invalid blog data.");
            }

            // Log all claims for debugging
            foreach (var claim in User.Claims)
            {
                _logger.LogInformation($"Claim: {claim.Type} = {claim.Value}");
            }

            // Try to get the ReaderId from various possible claim types
            var readerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst("sub")  // "sub" is commonly used for user ID in JWTs
                ?? User.FindFirst("ReaderId")  // custom claim we might have used
                ?? User.Claims.FirstOrDefault(c => c.Type.Contains("nameidentifier", StringComparison.OrdinalIgnoreCase));
            
            Console.Write("Reader Id : ", readerIdClaim);

            if (readerIdClaim == null)
            {
                _logger.LogWarning("Unable to find ReaderId in the token claims.");
                return Unauthorized("Unable to identify the user.");
            }

            _logger.LogInformation($"Found ReaderId claim: {readerIdClaim.Type} = {readerIdClaim.Value}");

            if (!int.TryParse(readerIdClaim.Value, out int readerId))
            {
                _logger.LogWarning($"Failed to parse ReaderId: {readerIdClaim.Value}");
                return BadRequest("Invalid user identification.");
            }

            // Check if the reader exists
            var reader = await _context.Readers.FindAsync(readerId);
            if (reader == null)
            {
                _logger.LogWarning($"Reader not found for ID: {readerId}");
                return NotFound("Reader not found.");
            }

            var newBlog = new Blog
            {
                Title = createBlogDTO.Title,
                Category = createBlogDTO.Category,
                Description = createBlogDTO.Description,
                CreatedAt = DateTime.UtcNow,
                ReaderId = readerId
            };

            try
            {
                _context.Blogs.Add(newBlog);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Created new blog with ID: {newBlog.BlogId} for reader: {readerId}");
                return CreatedAtAction(nameof(GetBlog), new { id = newBlog.BlogId }, newBlog);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating blog");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        
        // Get All Blogs
        [HttpGet("allBlogs")]
        [AllowAnonymous] // No need for authorization
        public async Task<ActionResult<IEnumerable<BlogDTO>>> GetAllBlogs()
        {
            var blogs = await _context.Blogs
                .Include<Blog, object>(b => b.Author)  // Include the related Reader to get the author's details
                .ToListAsync();

            if (blogs == null || !blogs.Any())
            {
                return NotFound("No blogs found.");
            }

            // Map blogs to BlogDTOs including the author's name
            var blogDTOs = blogs.Select(blog => new BlogDTO
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Category = blog.Category,
                Description = blog.Description,
                CreatedAt = blog.CreatedAt,
                Author = $"{blog.Author.FirstName} {blog.Author.LastName}"  // Combine first and last name for the author
            }).ToList();

            return Ok(blogDTOs);
        }


        // View a blog
        [HttpGet("viewBlog/{id}")]
        [AllowAnonymous] // No need for authorization
        public async Task<ActionResult<BlogDTO>> GetBlog(int id)
        {
            var blog = await _context.Blogs
                .Include<Blog, object>(b => b.Author)// Include the related Reader
                .Where(b => b.BlogId == id)
                .FirstOrDefaultAsync(b => b.BlogId == id);

            if (blog == null)
            {
                return NotFound();
            }

            // Return a BlogDTO that includes the blog details and the author's name
            var blogDTO = new BlogDTO
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Category = blog.Category,
                Description = blog.Description,
                CreatedAt = blog.CreatedAt,
                Author = $"{blog.Author.FirstName} {blog.Author.LastName}"  // Combine first and last name for the author
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
                Author = $"{blog.Author.FirstName} {blog.Author.LastName}"
            }).ToList();

            return Ok(blogDTOs);
        }




    }
}