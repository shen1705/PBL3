using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarRental.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingPriceBreakdown : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "delivery_fee",
                table: "bookings",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "insurance_fee",
                table: "bookings",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "price_per_day_at_booking",
                table: "bookings",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "rental_subtotal",
                table: "bookings",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "delivery_fee",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "insurance_fee",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "price_per_day_at_booking",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "rental_subtotal",
                table: "bookings");
        }
    }
}
