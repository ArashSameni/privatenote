namespace PrivateNote.DTOs;

public class UpdateNoteDto
{
    public string EncryptedText { get; set; } = null!;
    public long LastModifiedToken { get; set; }
}