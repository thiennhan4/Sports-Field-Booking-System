using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using SportBooking.API.Middlewares;
using SportBooking.Infrastructure.Data;
using SportBooking.Application.Interfaces;
using SportBooking.Application.Services;
using SportBooking.Infrastructure.Repositories;
using SportBooking.Infrastructure.Services;
using StackExchange.Redis;
using Hangfire;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

// Redis Registration
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var config = builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379";
    return ConnectionMultiplexer.Connect(config);
});

// Redis Caching and Locking services
builder.Services.AddScoped<ILockService, RedisLockService>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();

// Repositories DI
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IVenueRepository, VenueRepository>();
builder.Services.AddScoped<ICourtRepository, CourtRepository>();
builder.Services.AddScoped<ISlotRepository, SlotRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();

// Services DI
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IVenueService, VenueService>();
builder.Services.AddScoped<ICourtService, CourtService>();
builder.Services.AddScoped<ISlotService, SlotService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// CQRS MediatR Registrations
builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(SportBooking.Application.Features.Bookings.Commands.CreateBookingCommand).Assembly));

// FluentValidation Registrations
builder.Services.AddValidatorsFromAssembly(typeof(SportBooking.Application.Features.Bookings.Commands.CreateBookingCommand).Assembly);

// AutoMapper Registrations
builder.Services.AddAutoMapper(typeof(SportBooking.Application.Interfaces.IAuthService).Assembly);

// Hangfire Registration
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SportBooking API", Version = "v1" });
    
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token **_only_**",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };
    
    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? "super_secret_key_change_me_in_production_environment_to_be_secure";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    await DataSeeder.SeedDataAsync(context);
}

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SportBooking API v1");
    });
}

app.UseSerilogRequestLogging();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// Configure Hangfire Dashboard
app.UseHangfireDashboard();

// Register background jobs
RecurringJob.AddOrUpdate<SlotGenerator>(
    "slot-generation-job",
    x => x.GenerateSlotsForNext30DaysAsync(),
    Cron.Daily
);

RecurringJob.AddOrUpdate<UnpaidBookingCancelJob>(
    "auto-cancel-unpaid-bookings-job",
    x => x.CancelExpiredBookingsAsync(),
    "*/5 * * * *"
);

app.MapControllers();

app.Run();
