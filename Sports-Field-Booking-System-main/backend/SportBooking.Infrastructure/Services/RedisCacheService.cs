using StackExchange.Redis;
using SportBooking.Application.Interfaces;
using System.Text.Json;

namespace SportBooking.Infrastructure.Services;

public class RedisCacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;

    public RedisCacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    private bool IsConnected => _redis.IsConnected;

    public async Task<T?> GetAsync<T>(string key)
    {
        if (!IsConnected)
            return default;

        try
        {
            var db = _redis.GetDatabase();
            var value = await db.StringGetAsync(key);

            if (value.IsNullOrEmpty)
                return default;

            return JsonSerializer.Deserialize<T>(value!);
        }
        catch (RedisConnectionException)
        {
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        if (!IsConnected)
            return;

        try
        {
            var db = _redis.GetDatabase();
            var serialized = JsonSerializer.Serialize(value);
            Expiration expiration = expiry.HasValue ? expiry.Value : default;
            await db.StringSetAsync(key, serialized, expiration);
        }
        catch (RedisConnectionException)
        {
            // Cache is optional — skip when Redis is unavailable
        }
    }

    public async Task RemoveAsync(string key)
    {
        if (!IsConnected)
            return;

        try
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(key);
        }
        catch (RedisConnectionException)
        {
            // Cache is optional — skip when Redis is unavailable
        }
    }
}
