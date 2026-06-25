namespace SportBooking.Domain.Enums;

public enum UserRole
{
    Admin = 1,
    Owner = 2,
    Customer = 3
}

public enum BookingStatus
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Completed = 4
}

public enum SportType
{
    Football = 1,
    Tennis = 2,
    Badminton = 3,
    Basketball = 4,
    Volleyball = 5
}

public enum VenueStatus
{
    Active = 1,
    Inactive = 2,
    Maintenance = 3
}

public enum PaymentProvider
{
    Cash = 1,
    Stripe = 2,
    Momo = 3,
    VNPay = 4
}

public enum SlotStatus
{
    Available = 1,
    Booked = 2,
    Blocked = 3
}
