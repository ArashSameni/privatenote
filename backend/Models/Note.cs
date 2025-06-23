using System.ComponentModel.DataAnnotations;

namespace PrivateNote.Models;

public class Note
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string UrlSlug { get; set; } = null!;

    [Required]
    public string EncryptedText { get; set; } = null!;

    [Required]
    public string Salt { get; set; } = null!;

    [Required]
    public string IV { get; set; } = null!;

    public long LastModifiedToken { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
