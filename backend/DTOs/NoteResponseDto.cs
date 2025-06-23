namespace PrivateNote.DTOs;

public class NoteResponseDto
{
    public string EncryptedText { get; set; } = null!;
    public long LastModifiedToken { get; set; }
}