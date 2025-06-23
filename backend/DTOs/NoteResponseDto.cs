namespace PrivateNote.DTOs;

public class NoteResponseDto
{
    public string EncryptedText { get; set; } = null!;
    public string LastModifiedToken { get; set; } = null!;
}