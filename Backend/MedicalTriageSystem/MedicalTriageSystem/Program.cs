using BusinessLogicLayer;
using BusinessLogicLayer.Services.Implementation;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Implementation;
using DataAccessLayer.Repositories.Interfaces;
using MedicalTriageSystem.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace MedicalTriageSystem
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ── Controllers ───────────────────────────────────────
            builder.Services.AddControllers();

            // ── Swagger ───────────────────────────────────────────
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new() { Title = "MedicalTriage API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new()
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Enter your JWT token"
                });
                c.AddSecurityRequirement(new()
                {
                    {
                        new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
                        Array.Empty<string>()
                    }
                });
            });

            // ── CORS ──────────────────────────────────────────────
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngular", policy =>
                {
                    policy.WithOrigins("http://localhost:4200", "http://localhost:62683")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            // ── Identity ← لازم قبل AddAuthentication ────────────
            builder.Services.AddIdentity<User, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddEntityFrameworkStores<MedicalTriageDbContext>()
            .AddDefaultTokenProviders();

            // ── JWT ← لازم بعد AddIdentity عشان يـ override الـ Default ──
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };
            });

            // ── يوقف Cookie Redirect ──────────────────────────────
            builder.Services.ConfigureApplicationCookie(options =>
            {
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = 403;
                    return Task.CompletedTask;
                };
            });

            // ── Database ──────────────────────────────────────────
            builder.Services.AddDbContext<MedicalTriageDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // ── Repositories & UnitOfWork ─────────────────────────
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

            // ── Services ──────────────────────────────────────────
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IDoctorService, DoctorService>();
            builder.Services.AddScoped<IPatientService, PatientService>();
            builder.Services.AddScoped<IReceptionistService, ReceptionistService>();
            builder.Services.AddScoped<IPersonService, PersonService>();
            builder.Services.AddScoped<IAppointmentService, AppointmentService>();
            builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
            builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
            builder.Services.AddScoped<ILabRequestService, LabRequestService>();
            builder.Services.AddScoped<IReviewService, ReviewService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();
            builder.Services.AddScoped<IAdminService, AdminService>();

            // ── AI Service ────────────────────────────────────────
            builder.Services.AddHttpClient<IAIService, AIService>();
            builder.Services.AddScoped<IAIService, AIService>();

            // ── AutoMapper ────────────────────────────────────────
            builder.Services.AddAutoMapper(x => x.AddProfile(new MappingProfile()));

            // ─────────────────────────────────────────────────────
            var app = builder.Build();
            // ─────────────────────────────────────────────────────

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // ── Middleware ────────────────────────────────────────
            app.UseMiddleware<ErrorHandlingMiddleware>();
            app.UseCors("AllowAngular");
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.Run();
        }
    }
}