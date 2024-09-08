using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Blog_Backend.DTO;
using Blog_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blog_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Ensure that only authenticated users can access this controller
    public class ReaderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public ReaderController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Update reader details (identify by email from JWT)
        [HttpPut("update/{readerId}")]
        public async Task<IActionResult> UpdateReader([FromBody] UpdateReaderDTO updateReaderDTO)
        {
            if (updateReaderDTO == null)
            {
                return BadRequest("Invalid reader data.");
            }

            // Get the email from the JWT token
            var emailFromToken = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            Console.WriteLine("Email: ",emailFromToken);

            if (emailFromToken == null)
            {
                return Unauthorized("Invalid token.");
            }

            // Ensure that the authenticated user is updating their own details
            if (!emailFromToken.Equals(updateReaderDTO.Email, System.StringComparison.OrdinalIgnoreCase))
            {
                return Forbid("You can only update your own details.");
            }

            // Find the reader in the database by email
            var existingReader = await _context.Readers.FirstOrDefaultAsync(r => r.Email == emailFromToken);
            if (existingReader == null)
            {
                return NotFound("Reader not found.");
            }

            // Update the reader details
            existingReader.FirstName = updateReaderDTO.FirstName;
            existingReader.LastName = updateReaderDTO.LastName;

            try
            {
                _context.Readers.Update(existingReader);
                await _context.SaveChangesAsync();
                return Ok(existingReader);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    
}
