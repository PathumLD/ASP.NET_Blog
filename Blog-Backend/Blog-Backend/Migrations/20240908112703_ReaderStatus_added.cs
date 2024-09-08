using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Blog_Backend.Migrations
{
    /// <inheritdoc />
    public partial class ReaderStatus_added : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReaderStatus",
                table: "Readers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReaderStatus",
                table: "Readers");
        }
    }
}
