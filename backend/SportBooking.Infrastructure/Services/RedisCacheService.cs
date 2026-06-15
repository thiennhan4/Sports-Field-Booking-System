using StackExchange.Redis;
using SportBooking.Application.Interfaces;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace SportBooking.Infrastructure.Services;

public class RedisCacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;

    public RedisCacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(key);
        
        if (value.IsNullOrEmpty)
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(value!);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var db = _redis.GetDatabase();
        var serialized = JsonSerializer.Serialize(value);
        Expiration expiration = expiry.HasValue ? expiry.Value : default;
        await db.StringSetAsync(key, serialized, expiration);
    }

    public async Task RemoveAsync(string key)
    {
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync(key);
    }
}
