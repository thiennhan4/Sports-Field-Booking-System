# ============================================================
# Stage 1: Build — dùng .NET 9 SDK để compile
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy các file .csproj trước để tận dụng Docker layer cache
COPY ["SportBooking.API/SportBooking.API.csproj",             "SportBooking.API/"]
COPY ["SportBooking.Application/SportBooking.Application.csproj", "SportBooking.Application/"]
COPY ["SportBooking.Domain/SportBooking.Domain.csproj",       "SportBooking.Domain/"]
COPY ["SportBooking.Infrastructure/SportBooking.Infrastructure.csproj", "SportBooking.Infrastructure/"]

# Restore packages
RUN dotnet restore "SportBooking.API/SportBooking.API.csproj"

# Copy toàn bộ source code
COPY . .

# Build
WORKDIR /src/SportBooking.API
RUN dotnet build "SportBooking.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# ============================================================
# Stage 2: Publish — tạo bản release tối ưu
# ============================================================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "SportBooking.API.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

# ============================================================
# Stage 3: Runtime — image nhỏ gọn chỉ chứa runtime
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

# Cài curl để dùng HEALTHCHECK
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Chạy với user không phải root (bảo mật)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

COPY --from=publish /app/publish .

# Port mà ASP.NET Core lắng nghe bên trong container
EXPOSE 8080

# Health check — AWS ECS dùng để kiểm tra container còn sống không
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Environment mặc định — sẽ bị override bởi ECS Task Definition
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "SportBooking.API.dll"]