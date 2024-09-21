using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
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



        //Get Current reader
        [HttpGet("getCurrentReader")]
        public async Task<IActionResult> GetCurrentReader()
        {
            var emailFromToken = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (emailFromToken == null)
            {
                return Unauthorized("Invalid token.");
            }

            var reader = await _context.Readers.FirstOrDefaultAsync(r => r.Email == emailFromToken);
            if (reader == null)
            {
                return NotFound("Reader not found.");
            }

            var readerDTO = new ReaderDTO
            {
                ReaderId = reader.ReaderId,
                FirstName = reader.FirstName,
                LastName = reader.LastName,
                Email = reader.Email,
                RegisteredAt = reader.RegisteredAt
            };

            return Ok(readerDTO);
        }


        //Update Profile
        [HttpPut("updateProfile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateReaderDTO updateReaderDTO)
        {
            var emailFromToken = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (emailFromToken == null) return Unauthorized("Invalid token.");

            var existingReader = await _context.Readers.FirstOrDefaultAsync(r => r.Email == emailFromToken);
            if (existingReader == null) return NotFound("Reader not found.");

            // Update only fields that are not null
            if (!string.IsNullOrEmpty(updateReaderDTO.FirstName))
            {
                existingReader.FirstName = updateReaderDTO.FirstName;
            }

            if (!string.IsNullOrEmpty(updateReaderDTO.LastName))
            {
                existingReader.LastName = updateReaderDTO.LastName;
            }

            if (!string.IsNullOrEmpty(updateReaderDTO.Email) && !emailFromToken.Equals(updateReaderDTO.Email, StringComparison.OrdinalIgnoreCase))
            {
                // Here, you could also add logic for email validation or password checks
                existingReader.Email = updateReaderDTO.Email;
            }

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


        //Email update
        [HttpPut("updateEmail")]
        public async Task<IActionResult> UpdateEmail([FromBody] UpdateEmailDTO updateEmailDTO)
        {
            var emailFromToken = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (emailFromToken == null) return Unauthorized("Invalid token.");

            if (updateEmailDTO.CurrentEmail != emailFromToken)
                return BadRequest("Current email does not match.");

            if (updateEmailDTO.NewEmail != updateEmailDTO.ConfirmNewEmail)
                return BadRequest("New email and confirmation email do not match.");

            var reader = await _context.Readers.FirstOrDefaultAsync(r => r.Email == emailFromToken);
            if (reader == null) return NotFound("Reader not found.");

            if (!VerifyPassword(updateEmailDTO.CurrentPassword, reader.Password))
                return Unauthorized("Incorrect password.");

            reader.Email = updateEmailDTO.NewEmail;

            try
            {
                _context.Readers.Update(reader);
                await _context.SaveChangesAsync();
                return Ok("Email updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool VerifyPassword(string enteredPassword, string storedPasswordHash)
        {
            using (var sha256 = SHA256.Create())
            {
                // Hash the entered password and compare it to the stored hash
                var enteredPasswordHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(enteredPassword)));
                return enteredPasswordHash == storedPasswordHash;
            }
        }


        //Update Password
        [HttpPut("updatePassword")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDTO updatePasswordDTO)
        {
            var emailFromToken = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (emailFromToken == null) return Unauthorized("Invalid token.");

            var reader = await _context.Readers.FirstOrDefaultAsync(r => r.Email == emailFromToken);
            if (reader == null) return NotFound("Reader not found.");

            if (!VerifyPassword(updatePasswordDTO.CurrentPassword, reader.Password))
                return Unauthorized("Incorrect current password.");

            if (updatePasswordDTO.NewPassword != updatePasswordDTO.ConfirmNewPassword)
                return BadRequest("New password and confirmation do not match.");

            reader.Password = HashPassword(updatePasswordDTO.NewPassword);

            try
            {
                _context.Readers.Update(reader);
                await _context.SaveChangesAsync();
                return Ok("Password updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
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
