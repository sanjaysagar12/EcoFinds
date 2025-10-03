# Order API Schema Documentation

## Overview
The Order API provides endpoints for managing orders in the EcoFinds marketplace. Users can create orders, view their order history, and update order status with proper authentication and authorization.

## Base URL
```
/api/orders
```

## Authentication
All endpoints require JWT authentication with the following headers:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Order
**POST** `/api/orders`

Create a new order. Requires authentication and USER/ADMIN role.

#### Request Body Schema
```json
{
  "items": [
    {
      "productId": "string (required)",
      "quantity": "number (required, min: 1)"
    }
  ],
  "shippingInfo": "string (optional)" // JSON string with shipping address
}
```

#### Example Request
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "items": [
    {
      "productId": "clm123abc456",
      "quantity": 2
    },
    {
      "productId": "clm789def012", 
      "quantity": 1
    }
  ],
  "shippingInfo": "{\"address\":\"123 Main St\",\"city\":\"New York\",\"state\":\"NY\",\"zipCode\":\"10001\",\"country\":\"USA\"}"
}
```

#### Response Schema
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Order created successfully",
  "data": {
    "id": "string",
    "orderNumber": "string",
    "buyerId": "string",
    "total": "number",
    "status": "PENDING",
    "shippingInfo": "string | null",
    "adminNotes": "string | null",
    "createdAt": "string (ISO date)",
    "deliveredAt": "string (ISO date) | null",
    "buyer": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string | null"
    },
    "items": [
      {
        "id": "string",
        "orderId": "string",
        "productId": "string",
        "productName": "string",
        "price": "number",
        "quantity": "number",
        "subtotal": "number",
        "product": {
          "id": "string",
          "title": "string",
          "description": "string",
          "thumbnail": "string | null",
          "seller": {
            "id": "string",
            "name": "string",
            "email": "string",
            "avatar": "string | null"
          }
        }
      }
    ]
  }
}
```

#### Error Responses
```json
{
  "status": "error",
  "message": "Product with ID clm123abc456 not found"
}
```

```json
{
  "status": "error", 
  "message": "Insufficient stock for product MacBook Pro. Available: 2, Requested: 5"
}
```

### 2. Get User Orders
**GET** `/api/orders`

Retrieve a paginated list of orders for the authenticated user.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page |
| `status` | string | No | - | Filter by order status |

#### Example Request
```http
GET /api/orders?page=1&limit=5&status=PENDING
Authorization: Bearer <jwt_token>
```

#### Response Schema
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "id": "string",
        "orderNumber": "string",
        "buyerId": "string",
        "total": "number",
        "status": "string",
        "shippingInfo": "string | null",
        "adminNotes": "string | null",
        "createdAt": "string (ISO date)",
        "deliveredAt": "string (ISO date) | null",
        "buyer": {
          "id": "string",
          "name": "string",
          "email": "string",
          "avatar": "string | null"
        },
        "items": [
          {
            "id": "string",
            "orderId": "string",
            "productId": "string",
            "productName": "string",
            "price": "number",
            "quantity": "number",
            "subtotal": "number",
            "product": {
              "id": "string",
              "title": "string",
              "description": "string",
              "thumbnail": "string | null",
              "seller": {
                "id": "string",
                "name": "string",
                "email": "string",
                "avatar": "string | null"
              }
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number",
      "hasNext": "boolean",
      "hasPrev": "boolean"
    }
  }
}
```

### 3. Get Order by ID
**GET** `/api/orders/:id`

Retrieve a specific order by ID. Users can only access their own orders.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Order ID |

#### Example Request
```http
GET /api/orders/clm456order789
Authorization: Bearer <jwt_token>
```

#### Response Schema
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Order retrieved successfully",
  "data": {
    "id": "string",
    "orderNumber": "string",
    "buyerId": "string",
    "total": "number",
    "status": "string",
    "shippingInfo": "string | null",
    "adminNotes": "string | null",
    "createdAt": "string (ISO date)",
    "deliveredAt": "string (ISO date) | null",
    "buyer": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string | null"
    },
    "items": [
      {
        "id": "string",
        "orderId": "string",
        "productId": "string",
        "productName": "string",
        "price": "number",
        "quantity": "number",
        "subtotal": "number",
        "product": {
          "id": "string",
          "title": "string",
          "description": "string",
          "thumbnail": "string | null",
          "seller": {
            "id": "string",
            "name": "string",
            "email": "string",
            "avatar": "string | null"
          }
        }
      }
    ]
  }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Order not found"
}
```

### 4. Update Order Status
**PATCH** `/api/orders/:id/status`

Update the status of an existing order. Only the buyer who created the order can update it.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Order ID |

#### Request Body Schema
```json
{
  "status": "string (required)"
}
```

#### Example Request
```http
PATCH /api/orders/clm456order789/status
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "status": "DELIVERED"
}
```

#### Response Schema
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Order status updated successfully",
  "data": {
    "id": "string",
    "orderNumber": "string",
    "buyerId": "string",
    "total": "number",
    "status": "string",
    "shippingInfo": "string | null",
    "adminNotes": "string | null",
    "createdAt": "string (ISO date)",
    "deliveredAt": "string (ISO date) | null",
    "buyer": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string | null"
    },
    "items": [
      {
        "id": "string",
        "orderId": "string",
        "productId": "string",
        "productName": "string",
        "price": "number",
        "quantity": "number",
        "subtotal": "number",
        "product": {
          "id": "string",
          "title": "string",
          "description": "string",
          "thumbnail": "string | null",
          "seller": {
            "id": "string",
            "name": "string",
            "email": "string",
            "avatar": "string | null"
          }
        }
      }
    ]
  }
}
```

#### Error Responses
```json
{
  "status": "error",
  "message": "Order not found"
}
```

```json
{
  "status": "error",
  "message": "Invalid order status"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized (Invalid or missing token) |
| 403 | Forbidden (Insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Order Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Order has been created but not yet confirmed |
| `CONFIRMED` | Order has been confirmed by the seller |
| `SHIPPED` | Order has been shipped |
| `DELIVERED` | Order has been delivered to the buyer |
| `CANCELLED` | Order has been cancelled |
| `ADMIN_HOLD` | Order has been put on hold by admin |

## Data Validation Rules

### Order Items
- **items**: Required array with at least one item
- **productId**: Required string, must reference an existing product
- **quantity**: Required integer >= 1

### Shipping Info
- **shippingInfo**: Optional JSON string containing shipping address
- Should include: address, city, state, zipCode, country

### Order Status Updates
- **status**: Must be one of the valid order status values
- Status transitions should follow logical business rules
- `DELIVERED` status automatically sets `deliveredAt` timestamp

## Business Logic

### Order Creation Process
1. **Validation**: All products must exist and be active/approved
2. **Stock Check**: Sufficient inventory must be available
3. **Price Calculation**: Total is calculated from current product prices
4. **Stock Update**: Product inventory is decremented atomically
5. **Transaction**: All operations occur within a database transaction

### Stock Management
- Product stock is automatically decremented when order is created
- Stock validation prevents overselling
- Stock updates are atomic to prevent race conditions

### Access Control
- Users can only access their own orders (buyer orders)
- Order IDs are validated against the authenticated user
- Admin users have the same access level as regular users for orders

## Example Shipping Info JSON
```json
{
  "address": "123 Main Street, Apt 4B",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "phoneNumber": "+1-555-123-4567",
  "specialInstructions": "Leave at front desk"
}
```

## Notes

1. **Authorization**: Users can only create and access their own orders
2. **Atomic Operations**: Order creation uses database transactions for data integrity
3. **Stock Management**: Product inventory is automatically managed
4. **Price Snapshots**: Order items store the price at time of purchase
5. **Audit Trail**: Orders maintain complete history with timestamps
6. **Pagination**: Default pagination is 10 items per page, maximum recommended is 100
7. **Currency**: All prices are stored as Decimal type for precision