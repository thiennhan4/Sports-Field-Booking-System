# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["SportBooking.API/SportBooking.API.csproj", "SportBooking.API/"]
COPY ["SportBooking.Application/SportBooking.Application.csproj", "SportBooking.Application/"]
COPY ["SportBooking.Domain/SportBooking.Domain.csproj", "SportBooking.Domain/"]
COPY ["SportBooking.Infrastructure/SportBooking.Infrastructure.csproj", "SportBooking.Infrastructure/"]
RUN dotnet restore "./SportBooking.API/SportBooking.API.csproj"
COPY . .
WORKDIR "/src/SportBooking.API"
RUN dotnet build "./SportBooking.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./SportBooking.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SportBooking.API.dll"]
