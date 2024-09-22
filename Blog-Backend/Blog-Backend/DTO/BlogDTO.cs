public class BlogDTO
{
    public int BlogId { get; set; }
    public string Title { get; set; }
    public string Category { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int BlogStatus { get; set; }
    public string Author { get; set; }  // Author's name (first and last name combined)

    public string? ImageUrl { get; set; }
}