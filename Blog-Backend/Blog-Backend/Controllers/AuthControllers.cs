using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Blog_Backend.DTO;
using Blog_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Blog_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            if (registerDTO == null)
            {
                return BadRequest("No data received.");
            }

            if (string.IsNullOrEmpty(registerDTO.FirstName) || 
                string.IsNullOrEmpty(registerDTO.LastName) || 
                string.IsNullOrEmpty(registerDTO.Email) || 
                string.IsNullOrEmpty(registerDTO.Password))
            {
                return BadRequest("All fields are required.");
            }

            // Logging the received data
            Console.WriteLine($"Received data: {registerDTO.FirstName}, {registerDTO.LastName}, {registerDTO.Email}");

            // Check if the email is already in use
            var existingReader = await _context.Readers
                .FirstOrDefaultAsync(r => r.Email == registerDTO.Email);
    
            if (existingReader != null)
            {
                return Conflict("Email is already in use.");
            }

            // Hash the password
            var hashedPassword = HashPassword(registerDTO.Password);

            // Create a new Reader
            var newReader = new Reader
            {
                FirstName = registerDTO.FirstName,
                LastName = registerDTO.LastName,
                Email = registerDTO.Email,
                Password = hashedPassword,
                RegisteredAt = DateTime.UtcNow
            };

            // Add the new reader to the database
            try
            {
                _context.Readers.Add(newReader);
                await _context.SaveChangesAsync();
                return Ok(newReader);
            }
            catch (Exception ex)
            {
                // Log the exception details
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            if (loginDTO == null || string.IsNullOrEmpty(loginDTO.Email) || string.IsNullOrEmpty(loginDTO.Password))
            {
                return BadRequest("Email and Password are required.");
            }

            // Find the reader by email
            var reader = await _context.Readers.FirstOrDefaultAsync(r => r.Email == loginDTO.Email);
            if (reader == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            // Verify the password
            if (!VerifyPassword(loginDTO.Password, reader.Password))
            {
                return Unauthorized("Invalid credentials.");
            }

            // Generate JWT Token
            var token = GenerateJwtToken(reader);

            return Ok(new { Token = token });
        }

        private bool VerifyPassword(string enteredPassword, string storedPasswordHash)
        {
            using (var sha256 = SHA256.Create())
            {
                var enteredPasswordHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(enteredPassword)));
                return enteredPasswordHash == storedPasswordHash;
            }
        }

        private string GenerateJwtToken(Reader reader)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, reader.ReaderId.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, reader.ReaderId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, $"{reader.FirstName} {reader.LastName}"),
                new Claim(ClaimTypes.Email, reader.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }





        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}
