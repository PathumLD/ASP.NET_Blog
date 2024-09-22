public class UpdateBlogDTO
{
    // Other properties
    public string? Title { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }

    // Make Image optional for update
    public IFormFile? Image { get; set; }
}
