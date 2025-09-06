# Address API Schema Documentation

## Overview
The Address API provides complete address management functionality for the EcoFinds marketplace. Users can create, read, update, and delete their addresses with support for default address management and comprehensive validation.

## Base URL
```
/api/address
```

## Authentication
All endpoints require JWT authentication with the following headers:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get All User Addresses
**GET** `/api/address`

Retrieve all addresses belonging to the authenticated user, sorted by default status and creation date.

#### Request Headers
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer JWT token |

#### Example Request
```http
GET /api/address
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Addresses fetched successfully",
  "data": [
    {
      "id": "addr_123456",
      "street": "123 Main Street, Apt 4B",
      "city": "New York",
      "state": "NY",
      "county": "Manhattan",
      "pincode": "10001",
      "country": "USA",
      "isDefault": true,
      "createdAt": "2025-09-06T12:30:45.123Z",
      "updatedAt": "2025-09-06T12:30:45.123Z"
    },
    {
      "id": "addr_789012",
      "street": "456 Oak Avenue",
      "city": "Brooklyn",
      "state": "NY", 
      "county": "Kings",
      "pincode": "11201",
      "country": "USA",
      "isDefault": false,
      "createdAt": "2025-09-05T10:15:30.456Z",
      "updatedAt": "2025-09-05T10:15:30.456Z"
    }
  ]
}
```

### 2. Get Specific Address
**GET** `/api/address/:id`

Retrieve a specific address by ID. Only the address owner can access it.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Address ID |

#### Example Request
```http
GET /api/address/addr_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Address fetched successfully",
  "data": {
    "id": "addr_123456",
    "street": "123 Main Street, Apt 4B",
    "city": "New York",
    "state": "NY",
    "county": "Manhattan",
    "pincode": "10001",
    "country": "USA",
    "isDefault": true,
    "createdAt": "2025-09-06T12:30:45.123Z",
    "updatedAt": "2025-09-06T12:30:45.123Z"
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Address not found"
}
```

### 3. Create New Address
**POST** `/api/address`

Create a new address for the authenticated user.

#### Request Body Schema
```json
{
  "street": "string (required)",
  "city": "string (required)", 
  "state": "string (required)",
  "county": "string (optional)",
  "pincode": "string (required)",
  "country": "string (optional, default: India)",
  "isDefault": "boolean (optional, default: false)"
}
```

#### Validation Rules
| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `street` | string | Yes | • Must be non-empty string |
| `city` | string | Yes | • Must be non-empty string |
| `state` | string | Yes | • Must be non-empty string |
| `county` | string | No | • Optional string |
| `pincode` | string | Yes | • Must be non-empty string |
| `country` | string | No | • Defaults to "India" |
| `isDefault` | boolean | No | • Defaults to false<br>• Auto-unsets other default addresses |

#### Example Request
```http
POST /api/address
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "street": "123 Main Street, Apt 4B",
  "city": "New York",
  "state": "NY",
  "county": "Manhattan",
  "pincode": "10001",
  "country": "USA",
  "isDefault": true
}
```

#### Success Response (201 Created)
```json
{
  "statusCode": 201,
  "message": "Address created successfully",
  "data": {
    "id": "addr_123456",
    "street": "123 Main Street, Apt 4B",
    "city": "New York",
    "state": "NY",
    "county": "Manhattan", 
    "pincode": "10001",
    "country": "USA",
    "isDefault": true,
    "createdAt": "2025-09-06T12:30:45.123Z",
    "updatedAt": "2025-09-06T12:30:45.123Z"
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Validation failed: Street is required; City is required"
}
```

### 4. Update Address
**PUT** `/api/address/:id`

Update an existing address. Only the address owner can update it. All fields are optional for partial updates.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Address ID to update |

#### Request Body Schema
```json
{
  "street": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)", 
  "county": "string (optional)",
  "pincode": "string (optional)",
  "country": "string (optional)",
  "isDefault": "boolean (optional)"
}
```

#### Example Request
```http
PUT /api/address/addr_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "street": "456 Updated Street",
  "isDefault": true
}
```

#### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Address updated successfully",
  "data": {
    "id": "addr_123456",
    "street": "456 Updated Street",
    "city": "New York",
    "state": "NY",
    "county": "Manhattan",
    "pincode": "10001", 
    "country": "USA",
    "isDefault": true,
    "createdAt": "2025-09-06T12:30:45.123Z",
    "updatedAt": "2025-09-06T13:45:20.789Z"
  }
}
```

### 5. Delete Address
**DELETE** `/api/address/:id`

Delete an address. Only the address owner can delete it.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Address ID to delete |

#### Example Request
```http
DELETE /api/address/addr_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Address deleted successfully"
}
```

#### Error Response (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Address not found"
}
```

## Data Transfer Objects (DTOs)

### CreateAddressDto
```typescript
class CreateAddressDto {
  @IsString({ message: 'Street is required' })
  street: string;

  @IsString({ message: 'City is required' })
  city: string;

  @IsString({ message: 'State is required' })
  state: string;

  @IsOptional()
  @IsString({ message: 'County must be a string' })
  county?: string;

  @IsString({ message: 'Pincode is required' })
  pincode: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @IsOptional()
  @IsBoolean({ message: 'isDefault must be a boolean' })
  isDefault?: boolean;
}
```

### UpdateAddressDto
```typescript
class UpdateAddressDto {
  @IsOptional()
  @IsString({ message: 'Street must be a string' })
  street?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'County must be a string' })
  county?: string;

  @IsOptional()
  @IsString({ message: 'Pincode must be a string' })
  pincode?: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @IsOptional()
  @IsBoolean({ message: 'isDefault must be a boolean' })
  isDefault?: boolean;
}
```

## Database Schema

### Address Model
```prisma
model Address {
  id        String   @id @default(cuid())
  street    String   // Street address
  city      String   // City
  state     String   // State/Province
  county    String?  // County (optional)
  pincode   String   // Postal/ZIP code
  country   String   @default("India") // Country
  isDefault Boolean  @default(false) // Is this the default address
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  
  @@index([userId])
}
```

## Business Logic

### Default Address Management
- **Single Default**: Only one address per user can be marked as default
- **Auto-Update**: Setting a new default automatically unsets the previous default
- **Ordering**: Default addresses are returned first in lists

### User Isolation
- **Owner Access**: Users can only access addresses they own
- **Automatic Association**: New addresses are automatically linked to the authenticated user
- **Cascade Delete**: Addresses are deleted when the user account is deleted

## Security Features

### Input Validation
- **Required Fields**: Street, city, state, and pincode are mandatory
- **String Validation**: All text fields must be valid strings
- **Boolean Validation**: isDefault must be a proper boolean value

### Authorization
- **JWT Required**: All endpoints require valid JWT token
- **Owner Verification**: Users can only access their own addresses
- **Role-Based Access**: Supports USER and ADMIN roles

## Error Codes

| Status Code | Description | Common Scenarios |
|-------------|-------------|------------------|
| 200 | OK | Successful retrieval, update, or deletion |
| 201 | Created | Successful address creation |
| 400 | Bad Request | Validation errors, missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Address not found or not accessible |
| 500 | Internal Server Error | Database errors, server issues |

## Usage Examples

### Frontend Integration

#### Get All Addresses
```javascript
const getAddresses = async () => {
  try {
    const response = await fetch('/api/address', {
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
    console.error('Get addresses error:', error);
  }
};
```

#### Create Address
```javascript
const createAddress = async (addressData) => {
  try {
    const response = await fetch('/api/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(addressData)
    });
    
    const data = await response.json();
    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Create address error:', error);
  }
};
```

#### Update Address
```javascript
const updateAddress = async (addressId, updates) => {
  try {
    const response = await fetch(`/api/address/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    if (response.ok) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Update address error:', error);
  }
};
```

#### Delete Address
```javascript
const deleteAddress = async (addressId) => {
  try {
    const response = await fetch(`/api/address/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Delete address error:', error);
  }
};
```

## Testing Examples

### Get All Addresses
```bash
curl -X GET http://localhost:3000/api/address \
  -H "Authorization: Bearer <jwt_token>"
```

### Create Address
```bash
curl -X POST http://localhost:3000/api/address \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "street": "123 Test Street",
    "city": "Test City",
    "state": "Test State",
    "pincode": "12345",
    "isDefault": true
  }'
```

### Update Address
```bash
curl -X PUT http://localhost:3000/api/address/addr_123456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "street": "456 Updated Street",
    "isDefault": false
  }'
```

### Delete Address
```bash
curl -X DELETE http://localhost:3000/api/address/addr_123456 \
  -H "Authorization: Bearer <jwt_token>"
```

## Common Integration Patterns

### Address Form Validation
```javascript
const validateAddress = (addressData) => {
  const errors = {};
  
  if (!addressData.street || addressData.street.trim() === '') {
    errors.street = 'Street address is required';
  }
  
  if (!addressData.city || addressData.city.trim() === '') {
    errors.city = 'City is required';
  }
  
  if (!addressData.state || addressData.state.trim() === '') {
    errors.state = 'State is required';
  }
  
  if (!addressData.pincode || addressData.pincode.trim() === '') {
    errors.pincode = 'Pincode is required';
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
};
```

### Default Address Management
```javascript
const setDefaultAddress = async (addressId) => {
  // Update the specific address to be default
  const result = await updateAddress(addressId, { isDefault: true });
  
  // Refresh the address list to see updated default status
  const updatedAddresses = await getAddresses();
  return { updatedAddress: result, allAddresses: updatedAddresses };
};
```

### Address Selection Component
```javascript
const AddressSelector = ({ addresses, selectedId, onSelect }) => {
  const defaultAddress = addresses.find(addr => addr.isDefault);
  
  return (
    <div>
      {defaultAddress && (
        <div className="default-address">
          <h3>Default Address</h3>
          <AddressCard address={defaultAddress} />
        </div>
      )}
      
      <div className="other-addresses">
        {addresses.filter(addr => !addr.isDefault).map(address => (
          <AddressCard
            key={address.id}
            address={address}
            isSelected={selectedId === address.id}
            onSelect={() => onSelect(address.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

## Notes

1. **Default Address Logic**: Only one default address per user is allowed
2. **Automatic Sorting**: Addresses are sorted with default first, then by creation date
3. **User Ownership**: All address operations are scoped to the authenticated user
4. **Partial Updates**: PUT requests support partial updates of address fields
5. **Country Default**: Country field defaults to "India" if not specified
6. **Cascade Deletion**: Addresses are automatically deleted when user account is deleted
7. **Validation**: Server-side validation ensures data integrity
8. **Index Optimization**: Database is indexed on userId for efficient queries
