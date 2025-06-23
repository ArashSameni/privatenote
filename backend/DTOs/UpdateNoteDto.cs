namespace PrivateNote.DTOs;

public class UpdateNoteDto
{
    public string EncryptedText { get; set; } = null!;
    public string LastModifiedToken { get; set; } = null!;
}