using FluentValidation;
using PrivateNote.DTOs;

namespace PrivateNote.Validators;

public class UpdateNoteDtoValidator : AbstractValidator<UpdateNoteDto>
{
    public UpdateNoteDtoValidator()
    {
        RuleFor(x => x.EncryptedText)
            .NotEmpty().WithMessage("EncryptedText is required.");

        RuleFor(x => x.LastModifiedToken)
            .GreaterThan(0).WithMessage("Invalid LastModifiedToken.");
    }
}