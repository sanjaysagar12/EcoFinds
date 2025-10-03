# Authentication API Schema Documentation

## Overview
The Authentication API provides secure user registration, login, and Google OAuth integration for the EcoFinds marketplace. It implements JWT-based authentication with bcrypt password hashing and comprehensive input validation.

## Base URL
```
/api/auth
```

## Authentication Methods
- **Email/Password**: Traditional registration and login
- **Google OAuth**: Single sign-on with Google accounts
- **JWT Tokens**: Stateless authentication for API access

## Endpoints

### 1. User Registration
**POST** `/api/auth/register`

Register a new user with email, username, and password.

#### Request Body Schema
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

#### Validation Rules
| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `username` | string | Yes | • Min length: 3 characters<br>• Max length: 20 characters<br>• Pattern: Only letters, numbers, and underscores<br>• Must be unique |
| `email` | string | Yes | • Must be valid email format<br>• Must be unique |
| `password` | string | Yes | • Min length: 8 characters<br>• Must contain at least one uppercase letter<br>• Must contain at least one lowercase letter<br>• Must contain at least one number<br>• Must contain at least one special character (@$!%*?&) |

#### Example Request
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe123",
  "email": "john.doe@example.com",
  "password": "MySecure@Pass123"
}
```

#### Success Response (201 Created)
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "user": {
    "id": "clm123abc456def789",
    "name": "john_doe123",
    "email": "john.doe@example.com",
    "role": "USER",
    "createdAt": "2025-09-06T12:30:45.123Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
```json
// Validation Error (400)
{
  "statusCode": 400,
  "message": "Validation failed: Username must be at least 3 characters long; Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
}

// Email Already Exists (409)
{
  "statusCode": 409,
  "message": "User with this email already exists"
}

// Username Already Taken (409)
{
  "statusCode": 409,
  "message": "Username is already taken"
}
```

### 2. User Login
**POST** `/api/auth/login`

Authenticate user with email and password.

#### Request Body Schema
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

#### Validation Rules
| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `email` | string | Yes | • Must be valid email format |
| `password` | string | Yes | • Cannot be empty |

#### Example Request
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "MySecure@Pass123"
}
```

#### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "user": {
    "id": "clm123abc456def789",
    "name": "john_doe123",
    "email": "john.doe@example.com",
    "role": "USER"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
```json
// Invalid Credentials (401)
{
  "statusCode": 401,
  "message": "Invalid email or password"
}

// OAuth User (401)
{
  "statusCode": 401,
  "message": "Please sign in with Google or reset your password"
}

// Validation Error (400)
{
  "statusCode": 400,
  "message": "Validation failed: Please provide a valid email address"
}
```

### 3. Google OAuth Sign In
**GET** `/api/auth/google/signin`

Initiate Google OAuth authentication flow.

#### Request
```http
GET /api/auth/google/signin
```

#### Response
Redirects to Google OAuth consent screen. No JSON response.

#### Google OAuth Configuration
- **Client ID**: Configured via `GOOGLE_CLIENT_ID` environment variable
- **Client Secret**: Configured via `GOOGLE_CLIENT_SECRET` environment variable
- **Callback URL**: `http://localhost:3000/api/auth/google/callback`
- **Scopes**: `email`, `profile`

### 4. Google OAuth Callback
**GET** `/api/auth/google/callback`

Handle Google OAuth callback and complete authentication.

#### Request
```http
GET /api/auth/google/callback?code=<auth_code>&state=<state>
```

#### Response
Sets HTTP-only cookie and redirects to frontend:
- **Cookie Name**: `auth_token`
- **Cookie Options**: 
  - `httpOnly: true`
  - `secure: false` (for localhost)
  - `sameSite: 'lax'`
  - `maxAge: 24 hours`
- **Redirect**: `http://localhost:3001/profile`

#### Google User Creation/Update
```json
{
  "id": "google_user_id",
  "email": "user@gmail.com",
  "name": "User Name",
  "avatar": "https://lh3.googleusercontent.com/...",
  "googleId": "google_user_id",
  "role": "USER",
  "password": null
}
```

## JWT Token Structure

### Payload
```json
{
  "sub": "user_id",
  "role": "USER|ADMIN",
  "iat": 1694001234,
  "exp": 1694004834
}
```

### Token Configuration
- **Algorithm**: HS256
- **Expiration**: 1 hour
- **Secret**: Configured via `JWT_SECRET` environment variable

## Security Features

### Password Security
- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 12
- **Password Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter  
  - At least one number
  - At least one special character

### Input Validation
- **Request Body Validation**: Applied per endpoint using ValidationPipe
- **Data Sanitization**: Whitelist approach - unknown fields are stripped
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Prevention**: Input validation and sanitization

### Error Handling
- **Structured Error Responses**: Consistent error format across all endpoints
- **Sensitive Information Protection**: Passwords and secrets never exposed
- **Validation Error Details**: Clear error messages for client debugging

## Data Transfer Objects (DTOs)

### RegisterDto
```typescript
class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  password: string;
}
```

### LoginDto
```typescript
class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
```

## Database Schema

### User Model
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  password  String?   // For local auth (bcrypt hashed)
  googleId  String?   // For Google OAuth
  avatar    String?   
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  
  // Relations
  productsForSale Product[] @relation("UserSellingProducts")
  orders          Order[]   @relation("UserBuyingProducts")
  reviews         Review[]
  
  @@index([email])
  @@index([role])
}

enum Role {
  USER   
  ADMIN
}
```

## Error Codes

| Status Code | Description | Common Scenarios |
|-------------|-------------|------------------|
| 200 | OK | Successful login |
| 201 | Created | Successful registration |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Invalid credentials, expired token |
| 409 | Conflict | Email/username already exists |
| 500 | Internal Server Error | Database errors, server issues |

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ecofinds` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-jwt-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-abcdef...` |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:3000/api/auth/google/callback` |

## Usage Examples

### Frontend Integration

#### Registration
```javascript
const register = async (userData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      return data;
    } else {
      throw new Error('Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
};
```

#### Login
```javascript
const login = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('access_token', data.access_token);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

#### Using JWT Token
```javascript
const authenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};
```

#### Google OAuth
```html
<!-- Simple redirect to Google OAuth -->
<a href="/api/auth/google/signin">
  Sign in with Google
</a>
```

## Testing Examples

### Registration Test
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "TestPass@123"
  }'
```

### Login Test
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass@123"
  }'
```

### Authenticated Request Test
```bash
curl -X GET http://localhost:3000/api/user/me \
  -H "Authorization: Bearer <jwt_token>"
```

## Common Integration Patterns

### Role-Based Access Control
```typescript
// Protect routes based on user roles
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get('admin-only')
async adminEndpoint() {
  // Only accessible by admins
}
```

### Current User Access
```typescript
// Get current authenticated user
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@GetUser() user: User) {
  return user;
}
```

## Notes

1. **Password Storage**: Passwords are never stored in plain text - always bcrypt hashed with salt rounds of 12
2. **OAuth Users**: Users who register via Google OAuth have `password: null` and must use OAuth for authentication
3. **Token Expiration**: JWT tokens expire after 1 hour and need to be refreshed
4. **Cookie Security**: For production, set `secure: true` for HTTPS environments
5. **Email Uniqueness**: Email addresses must be unique across both local and OAuth registrations
6. **Username Uniqueness**: Usernames must be unique and follow the specified pattern
7. **Error Logging**: All authentication failures are logged for security monitoring
8. **Rate Limiting**: Consider implementing rate limiting on auth endpoints in production
