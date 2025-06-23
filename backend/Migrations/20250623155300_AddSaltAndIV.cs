using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrivateNote.Migrations
{
    /// <inheritdoc />
    public partial class AddSaltAndIV : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IV",
                table: "Notes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Salt",
                table: "Notes",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IV",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Salt",
                table: "Notes");
        }
    }
}
