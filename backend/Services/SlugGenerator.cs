using System.Security.Cryptography;

namespace PrivateNote.Services;

public static class SlugGenerator
{
    public static string GenerateSlug(int length = 8)
    {
        const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        var random = RandomNumberGenerator.GetBytes(length);
        return new string(random.Select(b => chars[b % chars.Length]).ToArray());
    }
}