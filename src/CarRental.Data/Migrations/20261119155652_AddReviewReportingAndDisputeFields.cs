using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarRental.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewReportingAndDisputeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_reported",
                table: "reviews",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "moderated_at",
                table: "reviews",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "moderated_by_user_id",
                table: "reviews",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "moderation_notes",
                table: "reviews",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "report_reason",
                table: "reviews",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "reported_at",
                table: "reviews",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "reported_by_user_id",
                table: "reviews",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "disputes",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "proposed_amount",
                table: "disputes",
                type: "decimal(65,30)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_reported",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "moderated_at",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "moderated_by_user_id",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "moderation_notes",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "report_reason",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "reported_at",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "reported_by_user_id",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "category",
                table: "disputes");

            migrationBuilder.DropColumn(
                name: "proposed_amount",
                table: "disputes");
        }
    }
}
