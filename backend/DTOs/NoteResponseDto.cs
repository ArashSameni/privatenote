namespace PrivateNote.DTOs;

public class NoteResponseDto
{
    public string EncryptedText { get; set; } = null!;
    public string Salt { get; set; } = null!;
    public string IV { get; set; } = null!;
    public string LastModifiedToken { get; set; } = null!;
}