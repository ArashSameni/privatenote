namespace PrivateNote.DTOs;

public class CreateNoteDto
{
    public string? Slug { get; set; }
    public string EncryptedText { get; set; } = null!;
}