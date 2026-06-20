using SportBooking.Domain.Entities;

namespace SportBooking.Application.Interfaces;

public interface IAdminService
{
    Task ApproveOwnerAsync(Guid ownerId);
    Task RejectOwnerAsync(Guid ownerId);
    Task<IEnumerable<User>> GetPendingOwnersAsync();
}
