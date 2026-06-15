using System;
using System.Threading.Tasks;

namespace SportBooking.Application.Interfaces;

public interface ILockService
{
    Task<bool> AcquireLockAsync(string key, string token, TimeSpan expiry);
    Task ReleaseLockAsync(string key, string token);
}
