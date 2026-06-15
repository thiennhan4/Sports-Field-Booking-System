using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using StackExchange.Redis;
using SportBooking.Application.Features.Bookings.Commands;
using SportBooking.Application.Interfaces;
using SportBooking.Domain.Entities;
using SportBooking.Domain.Enums;
using SportBooking.Domain.Exceptions;
using SportBooking.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace SportBooking.UnitTests;

public class CreateBookingCommandHandlerTests
{
    private readonly DbContextOptions<AppDbContext> _dbOptions;
    private readonly Mock<ILockService> _lockServiceMock;
    private readonly Mock<IConnectionMultiplexer> _redisMock;
    private readonly Mock<IDatabase> _redisDbMock;

    public CreateBookingCommandHandlerTests()
    {
        // Setup in-memory EF database, suppressing transaction warnings
        _dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _lockServiceMock = new Mock<ILockService>();
        _redisMock = new Mock<IConnectionMultiplexer>();
        _redisDbMock = new Mock<IDatabase>();

        _redisMock.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
            .Returns(_redisDbMock.Object);
    }

    private AppDbContext CreateDbContext()
    {
        return new AppDbContext(_dbOptions);
    }

    [Fact]
    public async Task Handle_ShouldCreateBooking_WhenSlotsAreAvailable()
    {
        // Arrange
        using var context = CreateDbContext();
        
        var court = new Court { Name = "Sân bóng A", PricePerHour = 100000 };
        context.Courts.Add(court);

        var slot = new TimeSlot
        {
            Court = court,
            CourtId = court.Id,
            Date = DateTime.UtcNow.Date,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(9),
            Price = 100000,
            Status = SlotStatus.Available
        };
        context.TimeSlots.Add(slot);
        await context.SaveChangesAsync();

        // Setup lock behavior to succeed
        _lockServiceMock.Setup(x => x.AcquireLockAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan>()))
            .ReturnsAsync(true);

        // Setup Redis hold check to return null (no one holds it)
        _redisDbMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync(RedisValue.Null);

        var handler = new CreateBookingCommandHandler(context, _lockServiceMock.Object, _redisMock.Object);
        var command = new CreateBookingCommand(Guid.NewGuid(), court.Id, DateTime.UtcNow.Date, new List<Guid> { slot.Id });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Pending", result.Status);
        Assert.Equal(100000, result.TotalPrice);
        
        // Verify lock was acquired and hold was set in Redis
        _lockServiceMock.Verify(x => x.AcquireLockAsync($"booking:lock:slot:{slot.Id}", It.IsAny<string>(), It.IsAny<TimeSpan>()), Times.Once);
        _redisDbMock.Verify(x => x.StringSetAsync($"booking:hold:slot:{slot.Id}", It.IsAny<RedisValue>(), TimeSpan.FromMinutes(15), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowConflict_WhenLockCannotBeAcquired()
    {
        // Arrange
        using var context = CreateDbContext();
        
        _lockServiceMock.Setup(x => x.AcquireLockAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan>()))
            .ReturnsAsync(false); // Lock acquisition fails

        var handler = new CreateBookingCommandHandler(context, _lockServiceMock.Object, _redisMock.Object);
        var command = new CreateBookingCommand(Guid.NewGuid(), Guid.NewGuid(), DateTime.UtcNow.Date, new List<Guid> { Guid.NewGuid() });

        // Act & Assert
        var exception = await Assert.ThrowsAsync<AppException>(() => handler.Handle(command, CancellationToken.None));
        Assert.Equal(409, exception.StatusCode);
        Assert.Contains("đang được giao dịch bởi người khác", exception.Message);
    }

    [Fact]
    public async Task Handle_ShouldThrowConflict_WhenSlotIsAlreadyHeldInRedis()
    {
        // Arrange
        using var context = CreateDbContext();

        var court = new Court { Name = "Sân bóng B", PricePerHour = 100000 };
        context.Courts.Add(court);

        var slot = new TimeSlot
        {
            Court = court,
            CourtId = court.Id,
            Date = DateTime.UtcNow.Date,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(9),
            Price = 100000,
            Status = SlotStatus.Available
        };
        context.TimeSlots.Add(slot);
        await context.SaveChangesAsync();

        _lockServiceMock.Setup(x => x.AcquireLockAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan>()))
            .ReturnsAsync(true);

        // Redis returns a value meaning another user holds it
        _redisDbMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync("ANOTHER_USER_ID");

        var handler = new CreateBookingCommandHandler(context, _lockServiceMock.Object, _redisMock.Object);
        var command = new CreateBookingCommand(Guid.NewGuid(), court.Id, DateTime.UtcNow.Date, new List<Guid> { slot.Id });

        // Act & Assert
        var exception = await Assert.ThrowsAsync<AppException>(() => handler.Handle(command, CancellationToken.None));
        Assert.Equal(409, exception.StatusCode);
        Assert.Contains("đã được giữ chỗ tạm thời", exception.Message);
    }

    [Fact]
    public async Task Handle_ShouldThrowConflict_WhenSlotIsBookedInDatabase()
    {
        // Arrange
        using var context = CreateDbContext();

        var court = new Court { Name = "Sân bóng C", PricePerHour = 100000 };
        context.Courts.Add(court);

        var slot = new TimeSlot
        {
            Court = court,
            CourtId = court.Id,
            Date = DateTime.UtcNow.Date,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(9),
            Price = 100000,
            Status = SlotStatus.Booked // Already booked!
        };
        context.TimeSlots.Add(slot);
        await context.SaveChangesAsync();

        _lockServiceMock.Setup(x => x.AcquireLockAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan>()))
            .ReturnsAsync(true);

        _redisDbMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync(RedisValue.Null);

        var handler = new CreateBookingCommandHandler(context, _lockServiceMock.Object, _redisMock.Object);
        var command = new CreateBookingCommand(Guid.NewGuid(), court.Id, DateTime.UtcNow.Date, new List<Guid> { slot.Id });

        // Act & Assert
        var exception = await Assert.ThrowsAsync<AppException>(() => handler.Handle(command, CancellationToken.None));
        Assert.Equal(409, exception.StatusCode);
        Assert.Contains("đã được đặt hoặc bị khóa", exception.Message);
    }
}
