using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarRental.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHandoverDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "fuel_level",
                table: "handover_confirmations",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "handover_confirmations",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "odometer",
                table: "handover_confirmations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "remaining_payment_method",
                table: "handover_confirmations",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fuel_level",
                table: "handover_confirmations");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "handover_confirmations");

            migrationBuilder.DropColumn(
                name: "odometer",
                table: "handover_confirmations");

            migrationBuilder.DropColumn(
                name: "remaining_payment_method",
                table: "handover_confirmations");
        }
    }
}
