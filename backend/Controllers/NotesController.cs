using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrivateNote.Data;
using PrivateNote.DTOs;
using PrivateNote.Models;
using PrivateNote.Services;

namespace PrivateNote.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> CreateNote([FromBody] CreateNoteDto dto)
    {
        var slug = dto.Slug?.Trim().ToLower() ?? SlugGenerator.GenerateSlug();

        if (await _db.Notes.AnyAsync(n => n.UrlSlug == slug))
            return Conflict(new { message = "Slug already exists." });

        var now = DateTime.UtcNow;

        var updatePasswordHash = BcryptPasswordHasher.HashPassword(dto.UpdatePassword);
        var note = new Note
        {
            Id = Guid.NewGuid(),
            UrlSlug = slug,
            EncryptedText = dto.EncryptedText,
            Salt = dto.Salt,
            IV = dto.IV,
            UpdatePasswordHash = updatePasswordHash,
            CreatedAt = now,
            UpdatedAt = now,
            LastModifiedToken = now.Ticks
        };

        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNote), new { slug = note.UrlSlug }, new { slug = note.UrlSlug });
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<NoteResponseDto>> GetNote(string slug)
    {
        var note = await _db.Notes.SingleOrDefaultAsync(n => n.UrlSlug == slug);

        if (note == null)
            return NotFound();

        return new NoteResponseDto
        {
            EncryptedText = note.EncryptedText,
            Salt = note.Salt,
            IV = note.IV,
            LastModifiedToken = note.LastModifiedToken.ToString()
        };
    }

    [HttpPut("{slug}")]
    public async Task<IActionResult> UpdateNote(string slug, [FromBody] UpdateNoteDto dto)
    {
        var note = await _db.Notes.SingleOrDefaultAsync(n => n.UrlSlug == slug);

        if (note == null)
            return NotFound();

        if (!BcryptPasswordHasher.VerifyPassword(dto.UpdatePassword, note.UpdatePasswordHash))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Invalid update password." });

        if (long.Parse(dto.LastModifiedToken) != note.LastModifiedToken)
            return Conflict(new { message = "Note has been modified by someone else. Please refresh the page." });

        note.EncryptedText = dto.EncryptedText;
        note.Salt = dto.Salt;
        note.IV = dto.IV;
        note.UpdatedAt = DateTime.UtcNow;
        note.LastModifiedToken = note.UpdatedAt.Ticks;

        await _db.SaveChangesAsync();

        return Ok(new { LastModifiedToken = note.LastModifiedToken.ToString() });
    }
}