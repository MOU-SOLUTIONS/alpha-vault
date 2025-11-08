# Troubleshooting Guide for Alpha Vault Backend

## 403 Forbidden Error - Common Causes and Solutions

### 1. **JWT Token Issues**
- **Missing Authorization Header**: Ensure your frontend sends the `Authorization: Bearer <token>` header
- **Invalid Token**: Check if the JWT token is valid and not expired
- **Token Format**: Token must start with "Bearer " (note the space)

### 2. **CORS Configuration**
The backend is configured to accept requests from:
- `http://localhost:*` (any port)
- `https://localhost:*` (any port)
- `http://127.0.0.1:*` (any port)
- `https://127.0.0.1:*` (any port)
- Specific ports: 4200 (Angular), 3000 (React), 8080 (Vue), 5173 (Vite)

### 3. **Testing Endpoints**
Use these endpoints to test connectivity (no authentication required):
- `GET /api/incomes/health` - Health check
- `GET /api/incomes/test` - Basic connectivity test

### 4. **Frontend Request Example**
```javascript
// Example of a proper authenticated request
fetch('/api/incomes/user/1', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### 5. **Common Frontend Issues**
- **Port Mismatch**: Ensure your frontend is running on one of the allowed ports
- **Protocol Mismatch**: Use `http://` for local development (not `https://`)
- **Missing Headers**: Always include the Authorization header for protected endpoints

### 6. **Debugging Steps**
1. Check browser console for CORS errors
2. Verify JWT token is valid and not expired
3. Test with `/api/incomes/health` endpoint first
4. Check network tab in browser dev tools
5. Look at backend logs for authentication details

### 7. **Backend Logs**
The application now includes debug logging for:
- JWT authentication process
- CORS handling
- Security filter chain

Check your console output for detailed information about requests and authentication.

### 8. **Quick Test Commands**
```bash
# Test health endpoint (no auth required)
curl http://localhost:8080/api/incomes/health

# Test with JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/incomes/user/1
```

## Still Having Issues?
1. Check that your JWT token is valid
2. Ensure your frontend is running on an allowed origin
3. Verify the Authorization header format
4. Check backend logs for specific error messages
5. Test with the health endpoint first to verify basic connectivity
