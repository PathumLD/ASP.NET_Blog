# Base image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0.202 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Blog-Backend.csproj", "./"]
RUN dotnet restore "Blog-Backend.csproj"

# Copy the rest of the project files
COPY . .

# Build the application
RUN dotnet build "Blog-Backend.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "Blog-Backend.csproj" -c Release -o /app/publish

# Final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables
# ENV ASPNETCORE_URLS=http://+:80
# ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port 80
EXPOSE 7140
# EXPOSE 8081

# Set the entry point
ENTRYPOINT ["dotnet", "Blog-Backend.dll"]