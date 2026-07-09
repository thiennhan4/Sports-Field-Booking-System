using StackExchange.Redis;
using SportBooking.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace SportBooking.Infrastructure.Services;

public class RedisLockService : ILockService
{
    private readonly IConnectionMultiplexer _redis;

    public RedisLockService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<bool> AcquireLockAsync(string key, string token, TimeSpan expiry)
    {
        try
        {
            var db = _redis.GetDatabase();
            return await db.StringSetAsync(key, token, expiry, When.NotExists);
        }
        catch (Exception)
        {
            // If Redis is not available, return true to allow booking to proceed
            // This is a fallback for development/testing without Redis
            return true;
        }
    }

    public async Task ReleaseLockAsync(string key, string token)
    {
        try
        {
            var db = _redis.GetDatabase();
            // Safe lock release using Lua script
            var query = @"
                if redis.call('get', KEYS[1]) == ARGV[1] then
                    return redis.call('del', KEYS[1])
                else
                    return 0
                end";
            
            await db.ScriptEvaluateAsync(query, new RedisKey[] { key }, new RedisValue[] { token });
        }
        catch (Exception)
        {
            // Ignore release errors if Redis is not available
        }
    }
}
