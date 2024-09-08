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
        
        // Get all readers
        [HttpGet("getAll")]
        [AllowAnonymous] // This allows the method to be accessed without authorization
        public async Task<ActionResult<IEnumerable<ReaderDTO>>> GetAllReaders()
        {
            var readers = await _context.Readers
                .Select(r => new ReaderDTO
                {
                    ReaderId = r.ReaderId,
                    FirstName = r.FirstName,
                    LastName = r.LastName,
                    Email = r.Email,
                    RegisteredAt = r.RegisteredAt
                })
                .ToListAsync();

            return Ok(readers);
        }
        
        
        [HttpGet("getReader/{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReaderDTO>> GetReaderById(int id)
        {
            var reader = await _context.Readers
                .Where(r => r.ReaderId == id)
                .Select(r => new ReaderDTO
                {
                    ReaderId = r.ReaderId,
                    FirstName = r.FirstName,
                    LastName = r.LastName,
                    Email = r.Email,
                    RegisteredAt = r.RegisteredAt
                })
                .FirstOrDefaultAsync();

            if (reader == null)
            {
                return NotFound($"Reader with ID {id} not found.");
            }

            return Ok(reader);
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
        
        
        // New delete method
        [HttpPut("delete/{readerId}")]
        public async Task<IActionResult> DeleteReader(int readerId)
        {
            // Get the email from the JWT token
            var emailFromToken = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (emailFromToken == null)
            {
                return Unauthorized("Invalid token.");
            }

            // Find the reader in the database by ID
            var reader = await _context.Readers.FindAsync(readerId);

            if (reader == null)
            {
                return NotFound("Reader not found.");
            }

            // Ensure that the authenticated user is deleting their own account
            if (!emailFromToken.Equals(reader.Email, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid("You can only delete your own account.");
            }

            // Update the reader status to inactive (0)
            reader.ReaderStatus = 0;

            try
            {
                await _context.SaveChangesAsync();
                return Ok("Reader account deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        
        
    }
}
