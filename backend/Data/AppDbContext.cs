using Microsoft.EntityFrameworkCore;
using PrivateNote.Models;

namespace PrivateNote.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Note> Notes => Set<Note>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Note>()
            .HasIndex(n => n.UrlSlug)
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}
