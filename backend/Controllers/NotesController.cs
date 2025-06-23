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

        var note = new Note
        {
            Id = Guid.NewGuid(),
            UrlSlug = slug,
            EncryptedText = dto.EncryptedText,
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
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.UrlSlug == slug);

        if (note == null)
            return NotFound();

        return new NoteResponseDto
        {
            EncryptedText = note.EncryptedText,
            LastModifiedToken = note.LastModifiedToken.ToString()
        };
    }

    [HttpPut("{slug}")]
    public async Task<IActionResult> UpdateNote(string slug, [FromBody] UpdateNoteDto dto)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.UrlSlug == slug);

        if (note == null)
            return NotFound();

        if (long.Parse(dto.LastModifiedToken) != note.LastModifiedToken)
            return Conflict(new { message = "Note has been modified by someone else." });

        note.EncryptedText = dto.EncryptedText;
        note.UpdatedAt = DateTime.UtcNow;
        note.LastModifiedToken = note.UpdatedAt.Ticks;

        await _db.SaveChangesAsync();

        return Ok(new { LastModifiedToken = note.LastModifiedToken.ToString() });
    }
}