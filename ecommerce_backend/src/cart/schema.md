# Cart API Schema Documentation

## Overview
The Cart API provides endpoints for managing user shopping carts in the EcoFinds marketplace. Users can add products to their cart, update quantities, remove items, and clear their entire cart. The cart system supports inventory validation and prevents users from adding their own products.

## Base URL
```
/api/cart
```

## Authentication
All endpoints require JWT authentication with the following headers:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get Cart
**GET** `/api/cart`

Retrieve the current user's cart with all items, totals, and item count.

#### Example Request
```http
GET /api/cart
Authorization: Bearer <jwt_token>
```

#### Response Schema
```json
{
  "statusCode": 200,
  "message": "Cart fetched successfully",
  "data": {
    "id": "string",
    "items": [
      {
        "id": "string",
        "productId": "string",
        "quantity": "number",
        "product": {
          "id": "string",
          "title": "string",
          "price": "number",
          "thumbnail": "string | null",
          "stock": "number",
          "isActive": "boolean",
          "seller": {
            "id": "string",
            "name": "string"
          }
        },
        "subtotal": "number"
      }
    ],
    "total": "number",
    "count": "number",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

### 2. Add to Cart
**POST** `/api/cart`

Add a product to the user's cart. If the product already exists in the cart, the quantity will be increased.

#### Request Body Schema
```json
{
  "productId": "string (required)",
  "quantity": "number (optional, default: 1, min: 1)"
}
```

#### Example Request
```http
POST /api/cart
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "productId": "clm123abc456",
  "quantity": 2
}
```

#### Response Schema
```json
{
  "statusCode": 201,
  "message": "Item added to cart successfully",
  "data": {
    "id": "string",
    "productId": "string",
    "quantity": "number",
    "product": {
      "id": "string",
      "title": "string",
      "price": "number",
      "thumbnail": "string | null",
      "stock": "number"
    },
    "subtotal": "number",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

#### Error Responses
```json
{
  "statusCode": 404,
  "message": "Product not found"
}
```

```json
{
  "statusCode": 400,
  "message": "Product is not available"
}
```

```json
{
  "statusCode": 400,
  "message": "Insufficient stock"
}
```

```json
{
  "statusCode": 400,
  "message": "You cannot add your own products to cart"
}
```

### 3. Update Cart Item
**PUT** `/api/cart/:id`

Update the quantity of a specific cart item.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Cart item ID |

#### Request Body Schema
```json
{
  "quantity": "number (required, min: 1)"
}
```

#### Example Request
```http
PUT /api/cart/clm789xyz123
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "quantity": 3
}
```

#### Response Schema
```json
{
  "statusCode": 200,
  "message": "Cart item updated successfully",
  "data": {
    "id": "string",
    "productId": "string",
    "quantity": "number",
    "product": {
      "id": "string",
      "title": "string",
      "price": "number",
      "thumbnail": "string | null",
      "stock": "number"
    },
    "subtotal": "number",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

#### Error Responses
```json
{
  "statusCode": 404,
  "message": "Cart item not found"
}
```

```json
{
  "statusCode": 400,
  "message": "You can only update your own cart items"
}
```

```json
{
  "statusCode": 400,
  "message": "Product is no longer available"
}
```

```json
{
  "statusCode": 400,
  "message": "Insufficient stock"
}
```

### 4. Remove from Cart
**DELETE** `/api/cart/:id`

Remove a specific item from the user's cart.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Cart item ID |

#### Example Request
```http
DELETE /api/cart/clm789xyz123
Authorization: Bearer <jwt_token>
```

#### Success Response
```json
{
  "statusCode": 200,
  "message": "Item removed from cart successfully"
}
```

#### Error Responses
```json
{
  "statusCode": 404,
  "message": "Cart item not found"
}
```

```json
{
  "statusCode": 400,
  "message": "You can only remove your own cart items"
}
```

### 5. Clear Cart
**DELETE** `/api/cart`

Remove all items from the user's cart.

#### Example Request
```http
DELETE /api/cart
Authorization: Bearer <jwt_token>
```

#### Success Response
```json
{
  "statusCode": 200,
  "message": "Cart cleared successfully"
}
```

#### Error Responses
```json
{
  "statusCode": 404,
  "message": "Cart not found"
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

## Data Validation Rules

### Product ID
- Required for adding to cart
- Must be a valid product ID
- Product must exist and be active
- User cannot add their own products to cart

### Quantity
- Required for add/update operations
- Must be an integer >= 1
- Cannot exceed available stock
- For updates, must be <= product stock

### Cart Item ID
- Required for update/remove operations
- Must be a valid cart item ID
- User can only modify their own cart items

## Business Rules

### Inventory Validation
- System checks product stock before adding/updating cart items
- Prevents adding items when stock is insufficient
- Validates stock again during cart operations

### Ownership Validation
- Users cannot add their own products to cart
- Users can only modify their own cart items
- Cart operations are user-scoped

### Cart Creation
- Cart is automatically created when user adds first item
- Empty carts are allowed (but not returned in getCart if no items)

### Price Calculation
- Subtotal calculated as: `product.price * quantity`
- Total calculated as sum of all item subtotals
- Count represents total quantity of all items

### Product Status
- Only active products can be added to cart
- Inactive products cannot be added or updated in cart
- Existing cart items remain valid even if product becomes inactive

## Field Examples

### Cart Response Example
```json
{
  "statusCode": 200,
  "message": "Cart fetched successfully",
  "data": {
    "id": "clr123abc456",
    "items": [
      {
        "id": "cli456def789",
        "productId": "clm789xyz123",
        "quantity": 2,
        "product": {
          "id": "clm789xyz123",
          "title": "MacBook Pro 2019",
          "price": 1299.99,
          "thumbnail": "https://example.com/macbook.jpg",
          "stock": 5,
          "isActive": true,
          "seller": {
            "id": "clu101abc456",
            "name": "John Seller"
          }
        },
        "subtotal": 2599.98
      }
    ],
    "total": 2599.98,
    "count": 2,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

## Notes

1. **Authorization**: All cart operations require user authentication
2. **User Scope**: Users can only access and modify their own cart
3. **Stock Validation**: Real-time stock checking prevents overselling
4. **Self-Prevention**: Sellers cannot add their own products to cart
5. **Auto-Creation**: Cart is created automatically on first item addition
6. **Price Precision**: All monetary values use decimal precision
7. **Empty Cart**: Empty carts return zero items with zero total/count
8. **Product Changes**: Cart items reflect current product data at fetch time
