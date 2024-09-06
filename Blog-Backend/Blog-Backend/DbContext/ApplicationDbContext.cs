using Blog_Backend.Models;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
        // Check if the database can be connected
        if (!Database.CanConnect())
        {
            Console.WriteLine("Cannot connect to the database.");
        }
    }
    
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<Reader> Readers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuring the one-to-many relationship between Reader and Blog
        modelBuilder.Entity<Blog>()
            .HasOne(b => b.Author)
            .WithMany(r => r.Blogs)
            .HasForeignKey(b => b.ReaderId);
    }
}