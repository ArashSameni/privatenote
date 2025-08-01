﻿namespace PrivateNote.DTOs;

public class UpdateNoteDto
{
    public string EncryptedText { get; set; } = null!;
    public string UpdatePassword { get; set; } = null!;
    public string Salt { get; set; } = null!;
    public string IV { get; set; } = null!;
    public string LastModifiedToken { get; set; } = null!;
}