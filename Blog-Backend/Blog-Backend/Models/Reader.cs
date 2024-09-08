namespace Blog_Backend.Models;

public class Reader
{
    public int ReaderId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public DateTime RegisteredAt { get; set; }

    // Navigation property
    public ICollection<Blog> Blogs { get; set; } = new List<Blog>();
}