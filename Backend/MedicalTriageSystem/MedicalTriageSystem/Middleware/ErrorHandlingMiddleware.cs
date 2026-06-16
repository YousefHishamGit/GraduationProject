// Middleware/ErrorHandlingMiddleware.cs
using MedicalTriageSystem.Exceptions;
using MedicalTriageSystem.Exceptions.MedicalTriageSystem.Exceptions;
using MedicalTriageSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;

namespace MedicalTriageSystem.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            var response = ex switch
            {
                NotFoundException e => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Message = e.Message
                },
                Exceptions.ValidationException e => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.BadRequest,
                    Message = e.Message
                },
                UnauthorizedException e => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.Unauthorized,
                    Message = e.Message
                },
                UnauthorizedAccessException e => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.Unauthorized,
                    Message = e.Message
                },
                DbUpdateException e => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.BadRequest,
                    Message = GetDbFriendlyMessage(e)
                },
                _ => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.InternalServerError,
                    Message = "An unexpected error occurred"
                }
            };

            context.Response.StatusCode = response.StatusCode;

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }

        private static string GetDbFriendlyMessage(DbUpdateException ex)
        {
            var deepest = ex as Exception;
            while (deepest.InnerException != null)
                deepest = deepest.InnerException;

            string msg = deepest.Message;

            if (msg.Contains("NationalID", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("IX_Persons_NationalID", StringComparison.OrdinalIgnoreCase))
                return "This National ID is already registered.";

            if (msg.Contains("IX_Persons_Phone", StringComparison.OrdinalIgnoreCase)
                || (msg.Contains("Phone", StringComparison.OrdinalIgnoreCase) && msg.Contains("duplicate", StringComparison.OrdinalIgnoreCase)))
                return "This Phone number is already registered.";

            if (msg.Contains("LicenseNumber", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("IX_Doctors_LicenseNumber", StringComparison.OrdinalIgnoreCase))
                return "This License Number is already registered.";

            if (msg.Contains("UserName", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("Email", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("NormalizedUserName", StringComparison.OrdinalIgnoreCase))
                return "This Email is already registered.";

            return "A database error occurred. Please check your data and try again.";
        }
    }
}