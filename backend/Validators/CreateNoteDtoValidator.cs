using FluentValidation;
using PrivateNote.DTOs;

namespace PrivateNote.Validators;

public class CreateNoteDtoValidator : AbstractValidator<CreateNoteDto>
{
    public CreateNoteDtoValidator()
    {
        RuleFor(x => x.EncryptedText)
            .NotEmpty().WithMessage("EncryptedText is required.");

        RuleFor(x => x.Slug)
            .Matches("^[a-z0-9_-]*$").WithMessage("Slug can only contain lower letters, numbers, underscores, and dashes.")
            .MaximumLength(32).WithMessage("Slug must be at most 32 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Slug));
    }
}