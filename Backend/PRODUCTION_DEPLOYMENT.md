# Production Deployment Guide

## Required Environment Variables

Set these environment variables before deploying:

```bash
# Database Configuration
export DB_URL=jdbc:postgresql://your-db-host:5432/alphavault
export DB_USERNAME=your_db_username
export DB_PASSWORD=your_secure_password

# JWT Configuration (REQUIRED - use a strong random string, at least 256 bits)
export JWT_SECRET=your-very-secure-random-secret-key-here
export JWT_EXPIRATION_MS=86400000

# File Upload Directory (absolute path)
export FILE_UPLOAD_DIR=/var/alphavault/uploads

# CORS Configuration (comma-separated list of production domains)
export ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Generating JWT Secret

Generate a secure JWT secret (256 bits minimum):

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Running in Production

```bash
# Set Spring profile to production
export SPRING_PROFILES_ACTIVE=prod

# Run the application
java -jar alphavault-0.0.1-SNAPSHOT.jar
```

Or with Maven:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## Security Checklist

- ✅ All secrets moved to environment variables
- ✅ Test endpoints disabled in production
- ✅ SQL logging disabled
- ✅ Debug logging disabled
- ✅ CORS restricted to production domains
- ✅ File upload directory uses absolute path
- ✅ Health check endpoints configured

## Health Check

Once deployed, check application health:

```bash
curl http://your-server:8080/actuator/health
```

