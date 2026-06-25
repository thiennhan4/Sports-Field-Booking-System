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
        var db = _redis.GetDatabase();
        return await db.StringSetAsync(key, token, expiry, When.NotExists);
    }

    public async Task ReleaseLockAsync(string key, string token)
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
}
