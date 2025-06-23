using System.ComponentModel.DataAnnotations;

namespace PrivateNote.Models;

public class Note
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(128)]
    public string UrlSlug { get; set; } = null!;

    [Required]
    public string EncryptedText { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string Salt { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string IV { get; set; } = null!;

    [Required]
    [MaxLength(128)]
    [DataType(DataType.Password)]
    public string UpdatePasswordHash { get; set; } = null!;

    public long LastModifiedToken { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
