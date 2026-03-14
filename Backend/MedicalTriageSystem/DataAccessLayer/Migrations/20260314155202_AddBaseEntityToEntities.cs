using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseEntityToEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "TimeSlots",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "TimeSlots",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "TimeSlots",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "TimeSlots",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Reviews",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "Reviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "Reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "LabRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "LabRequests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "LabRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "LabRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "DoctorSchedules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "DoctorSchedules",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "DoctorSchedules",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "DoctorSchedules",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "DoctorLeaves",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedOn",
                table: "DoctorLeaves",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "DoctorLeaves",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "DoctorLeaves",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedOn",
                table: "DoctorLeaves",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "DoctorLeaves",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "LabRequests");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "LabRequests");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "LabRequests");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "LabRequests");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorSchedules");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "DoctorSchedules");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "DoctorSchedules");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "DoctorSchedules");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "CreatedOn",
                table: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "ModifiedOn",
                table: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "DoctorLeaves");
        }
    }
}
