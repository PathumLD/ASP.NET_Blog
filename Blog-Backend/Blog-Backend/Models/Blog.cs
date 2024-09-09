namespace Blog_Backend.Models;

public class Blog
{
    public int BlogId { get; set; }
    public string? Title { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int BlogStatus { get; set; } = 1;

    // Foreign key
    public int ReaderId { get; set; }

    // Navigation property
    public Reader Author { get; set; }
}