# User API Schema Documentation

## Overview
The User API provides endpoints for managing user profiles in the EcoFinds marketplace. It includes features for retrieving user information and updating user profiles with comprehensive validation and security.

## Base URL
```
/api/user
```

## Authentication
All endpoints require JWT authentication with the following headers:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get User Profile
**GET** `/api/user/me`

Retrieve the authenticated user's complete profile information.

#### Request Headers
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer JWT token |

#### Example Request
```http
GET /api/user/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "id": "clm123abc456def789",
    "name": "john_doe123",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "createdAt": "2025-09-06T12:30:45.123Z",
    "addresses": [
      {
        "id": "addr_123456",
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "county": "Manhattan",
        "pincode": "10001",
        "country": "USA",
        "isDefault": true,
        "createdAt": "2025-09-06T12:30:45.123Z",
        "updatedAt": "2025-09-06T12:30:45.123Z"
      }
    ]
  }
}
```

#### Error Responses
```json
// Unauthorized (401)
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// User Not Found (404)
{
  "statusCode": 404,
  "message": "User not found"
}
```

### 2. Update User Profile
**PUT** `/api/user/profile`

Update the authenticated user's profile information. All fields are optional for partial updates.

#### Request Body Schema
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "avatar": "string (optional)"
}
```

#### Validation Rules
| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `name` | string | No | • Min length: 2 characters<br>• Max length: 50 characters |
| `email` | string | No | • Must be valid email format<br>• Must be unique across all users |
| `phone` | string | No | • Must match pattern: `+1234567890` or `1234567890`<br>• Length: 10-15 digits |
| `avatar` | string | No | • Must be a valid string (URL recommended) |

#### Example Request
```http
PUT /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1987654321",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "clm123abc456def789",
    "name": "Updated Name",
    "email": "john.doe@example.com",
    "phone": "+1987654321",
    "avatar": "https://example.com/new-avatar.jpg",
    "role": "USER",
    "createdAt": "2025-09-06T12:30:45.123Z"
  }
}
```

#### Error Responses
```json
// Validation Error (400)
{
  "statusCode": 400,
  "message": "Validation failed: Name must be at least 2 characters long"
}

// Email Already Exists (409)
{
  "statusCode": 409,
  "message": "Email is already taken by another user"
}

// Invalid Phone Format (400)
{
  "statusCode": 400,
  "message": "Validation failed: Phone number must be a valid format (e.g., +1234567890 or 1234567890, 10-15 digits)"
}
```

## Data Transfer Objects (DTOs)

### UpdateUserProfileDto
```typescript
class UpdateUserProfileDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^[+]?[1-9]\d{9,14}$/, { 
    message: 'Phone number must be a valid format (e.g., +1234567890 or 1234567890, 10-15 digits)' 
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  avatar?: string;
}
```

## Database Schema

### User Model
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  phone     String?   // Phone number
  password  String?   // For local auth (bcrypt hashed)
  googleId  String?   // For Google OAuth
  avatar    String?   
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  
  // Relations
  addresses       Address[] // User addresses
  productsForSale Product[] @relation("UserSellingProducts")
  orders          Order[]   @relation("UserBuyingProducts")
  reviews         Review[]
  
  @@index([email])
  @@index([role])
}
```

## Security Features

### Input Validation
- **Email Uniqueness**: Checks against all existing users (excluding current user)
- **Phone Format**: Validates international phone number formats
- **String Length**: Enforces minimum and maximum character limits
- **Data Sanitization**: Removes unknown fields from requests

### Authorization
- **JWT Required**: All endpoints require valid JWT token
- **Role-Based Access**: Supports USER and ADMIN roles
- **User Isolation**: Users can only access/modify their own profiles

## Error Codes

| Status Code | Description | Common Scenarios |
|-------------|-------------|------------------|
| 200 | OK | Successful profile update |
| 400 | Bad Request | Validation errors, invalid data format |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User not found |
| 409 | Conflict | Email already exists |
| 500 | Internal Server Error | Database errors, server issues |

## Usage Examples

### Frontend Integration

#### Get User Profile
```javascript
const getUserProfile = async () => {
  try {
    const response = await fetch('/api/user/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    const data = await response.json();
    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Get profile error:', error);
  }
};
```

#### Update User Profile
```javascript
const updateProfile = async (profileData) => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Update profile error:', error);
  }
};
```

## Testing Examples

### Get Profile Test
```bash
curl -X GET http://localhost:3000/api/user/me \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Profile Test
```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "name": "New Name",
    "phone": "+1234567890"
  }'
```

### Validation Test Cases
```bash
# Test invalid email
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "email": "invalid-email"
  }'

# Test invalid phone
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "phone": "abc123"
  }'
```

## Common Integration Patterns

### Profile Update with Validation
```typescript
// Frontend form validation before API call
const validateProfile = (data) => {
  const errors = {};
  
  if (data.name && (data.name.length < 2 || data.name.length > 50)) {
    errors.name = 'Name must be 2-50 characters';
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (data.phone && !/^[+]?[1-9]\d{9,14}$/.test(data.phone)) {
    errors.phone = 'Invalid phone format';
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
};
```

### Profile State Management
```javascript
// React example with state management
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(false);

const loadProfile = async () => {
  setLoading(true);
  try {
    const profileData = await getUserProfile();
    setProfile(profileData);
  } catch (error) {
    console.error('Failed to load profile:', error);
  } finally {
    setLoading(false);
  }
};

const handleProfileUpdate = async (updates) => {
  setLoading(true);
  try {
    const updatedProfile = await updateProfile(updates);
    setProfile(updatedProfile);
  } catch (error) {
    console.error('Failed to update profile:', error);
  } finally {
    setLoading(false);
  }
};
```

## Notes

1. **Address Integration**: User profile includes associated addresses from the Address API
2. **Partial Updates**: Only provided fields are updated; omitted fields remain unchanged
3. **Email Validation**: Server-side uniqueness check excludes the current user
4. **Phone Format**: Supports international formats with optional country code
5. **Avatar Storage**: API accepts string URLs; actual file upload handling is separate
6. **Profile Privacy**: Users can only access and modify their own profiles
7. **Real-time Updates**: Profile changes are immediately reflected in the database
8. **Audit Trail**: All updates are logged with timestamps
