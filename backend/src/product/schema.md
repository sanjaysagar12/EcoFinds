# Product API Schema Documentation

## Overview
The Product API provides endpoints for managing products in the EcoFinds marketplace. Users can create, read, update, and delete products with proper authentication and authorization.

## Base URL
```
/api/products
```

## Authentication
All endpoints except `GET /api/products` require JWT authentication with the following headers:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get All Products
**GET** `/api/products`

Retrieve a paginated list of products with optional filtering.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page |
| `category` | string | No | - | Filter by product category |
| `minPrice` | number | No | - | Minimum price filter |
| `maxPrice` | number | No | - | Maximum price filter |
| `sellerId` | string | No | - | Filter by seller ID |
| `isActive` | boolean | No | true | Filter by active status |
| `search` | string | No | - | Search in product title and description |
| `condition` | string | No | - | Filter by product condition |
| `brand` | string | No | - | Filter by brand |

#### Example Request
```http
GET /api/products?page=1&limit=10&category=Electronics&minPrice=100&maxPrice=500&search=laptop&condition=Used&brand=Apple
```

#### Response Schema
```json
{
  "products": [
    {
      "id": "string",
      "title": "string",
      "category": "string",
      "description": "string",
      "price": "number",
      "quantity": "number",
      "condition": "string",
      "yearOfManufacture": "number | null",
      "brand": "string | null",
      "model": "string | null",
      "dimensionLength": "number | null",
      "dimensionWidth": "number | null",
      "dimensionHeight": "number | null",
      "weight": "number | null",
      "material": "string | null",
      "color": "string | null",
      "originalPackaging": "boolean",
      "manualIncluded": "boolean",
      "workingConditionDesc": "string | null",
      "thumbnail": "string | null",
      "images": "string[]",
      "stock": "number",
      "isActive": "boolean",
      "isApproved": "boolean",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)",
      "seller": {
        "id": "string",
        "name": "string",
        "email": "string",
        "avatar": "string | null"
      },
      "averageRating": "number",
      "reviewCount": "number"
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
```

### 2. Create Product
**POST** `/api/products`

Create a new product. Requires authentication and USER/ADMIN role.

#### Request Body Schema
```json
{
  "title": "string (required)",
  "category": "string (required)",
  "description": "string (required)",
  "price": "number (required, min: 0)",
  "quantity": "number (required, min: 1)",
  "condition": "string (required)",
  "yearOfManufacture": "number (optional)",
  "brand": "string (optional)",
  "model": "string (optional)",
  "dimensionLength": "number (optional)",
  "dimensionWidth": "number (optional)",
  "dimensionHeight": "number (optional)",
  "weight": "number (optional)",
  "material": "string (optional)",
  "color": "string (optional)",
  "originalPackaging": "boolean (optional, default: false)",
  "manualIncluded": "boolean (optional, default: false)",
  "workingConditionDesc": "string (optional)",
  "thumbnail": "string (optional)",
  "images": "string[] (optional)",
  "stock": "number (optional, min: 0, default: 0)",
  "isActive": "boolean (optional, default: true)"
}
```

#### Example Request
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "title": "MacBook Pro 2019",
  "category": "Electronics",
  "description": "Gently used MacBook Pro with minimal wear. Perfect for students and professionals.",
  "price": 1299.99,
  "quantity": 1,
  "condition": "Used",
  "yearOfManufacture": 2019,
  "brand": "Apple",
  "model": "MacBook Pro 13-inch",
  "dimensionLength": 30.41,
  "dimensionWidth": 21.24,
  "dimensionHeight": 1.56,
  "weight": 1.4,
  "material": "Aluminum",
  "color": "Space Gray",
  "originalPackaging": true,
  "manualIncluded": true,
  "workingConditionDesc": "Excellent working condition, battery holds charge well, no dead pixels on screen.",
  "thumbnail": "https://example.com/macbook-main.jpg",
  "images": [
    "https://example.com/macbook-front.jpg",
    "https://example.com/macbook-keyboard.jpg",
    "https://example.com/macbook-ports.jpg"
  ],
  "stock": 1,
  "isActive": true
}
```

#### Response Schema
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "id": "string",
    "title": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "quantity": "number",
    "condition": "string",
    "yearOfManufacture": "number | null",
    "brand": "string | null",
    "model": "string | null",
    "dimensionLength": "number | null",
    "dimensionWidth": "number | null",
    "dimensionHeight": "number | null",
    "weight": "number | null",
    "material": "string | null",
    "color": "string | null",
    "originalPackaging": "boolean",
    "manualIncluded": "boolean",
    "workingConditionDesc": "string | null",
    "thumbnail": "string | null",
    "images": "string[]",
    "stock": "number",
    "isActive": "boolean",
    "isApproved": "boolean",
    "sellerId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)",
    "seller": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string | null"
    }
  }
}
```

### 3. Update Product
**PUT** `/api/products/:id`

Update an existing product. Only the seller who created the product can update it.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

#### Request Body Schema
All fields are optional for partial updates:
```json
{
  "title": "string (optional)",
  "category": "string (optional)",
  "description": "string (optional)",
  "price": "number (optional, min: 0)",
  "quantity": "number (optional, min: 1)",
  "condition": "string (optional)",
  "yearOfManufacture": "number (optional)",
  "brand": "string (optional)",
  "model": "string (optional)",
  "dimensionLength": "number (optional)",
  "dimensionWidth": "number (optional)",
  "dimensionHeight": "number (optional)",
  "weight": "number (optional)",
  "material": "string (optional)",
  "color": "string (optional)",
  "originalPackaging": "boolean (optional)",
  "manualIncluded": "boolean (optional)",
  "workingConditionDesc": "string (optional)",
  "thumbnail": "string (optional)",
  "images": "string[] (optional)",
  "stock": "number (optional, min: 0)",
  "isActive": "boolean (optional)"
}
```

#### Example Request
```http
PUT /api/products/clm123abc456
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "price": 1199.99,
  "condition": "Excellent",
  "workingConditionDesc": "Recently serviced, battery health at 95%"
}
```

#### Response Schema
```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "id": "string",
    "title": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "quantity": "number",
    "condition": "string",
    "yearOfManufacture": "number | null",
    "brand": "string | null",
    "model": "string | null",
    "dimensionLength": "number | null",
    "dimensionWidth": "number | null",
    "dimensionHeight": "number | null",
    "weight": "number | null",
    "material": "string | null",
    "color": "string | null",
    "originalPackaging": "boolean",
    "manualIncluded": "boolean",
    "workingConditionDesc": "string | null",
    "thumbnail": "string | null",
    "images": "string[]",
    "stock": "number",
    "isActive": "boolean",
    "isApproved": "boolean",
    "sellerId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)",
    "seller": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string | null"
    }
  }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Product not found or you are not authorized to update this product"
}
```

### 4. Delete Product
**DELETE** `/api/products/:id`

Delete a product. Only the seller who created the product can delete it.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

#### Example Request
```http
DELETE /api/products/clm123abc456
Authorization: Bearer <jwt_token>
```

#### Success Response
```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Product not found or you are not authorized to delete this product"
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

### Product Title
- Required for creation
- Must be a non-empty string

### Product Category
- Required for creation
- Must be a non-empty string
- Common values: "Electronics", "Books", "Clothing", "Home", "Sports", "Automotive", etc.

### Product Description
- Required for creation
- Must be a non-empty string

### Price
- Required for creation
- Must be a number >= 0
- Supports decimal values

### Quantity
- Required for creation
- Must be an integer >= 1
- Represents the number of items available for sale

### Condition
- Required for creation
- Must be a non-empty string
- Common values: "New", "Like New", "Good", "Fair", "Poor", "Refurbished"

### Year of Manufacture
- Optional integer
- Should be a valid year

### Physical Dimensions
- Optional numbers (Length, Width, Height)
- Units: centimeters (cm)
- Must be positive values

### Weight
- Optional number
- Units: kilograms (kg)
- Must be a positive value

### Boolean Fields
- `originalPackaging`: Indicates if item comes with original packaging
- `manualIncluded`: Indicates if manual/instructions are included
- Both default to `false`

### Images
- `thumbnail`: Optional single image URL for product preview
- `images`: Optional array of image URLs for detailed view
- Should be valid URLs

### Stock vs Quantity
- `quantity`: Number of identical items for sale
- `stock`: Inventory tracking (separate from quantity)

### isActive
- Optional boolean
- Defaults to `true`
- Controls product visibility in listings

## Field Examples

### Common Condition Values
- **New**: Brand new, never used
- **Like New**: Barely used, no signs of wear
- **Good**: Used with minor signs of wear
- **Fair**: Used with noticeable wear but fully functional
- **Poor**: Heavy wear but still functional
- **Refurbished**: Restored to working condition

### Category Examples
- **Electronics**: Laptops, Phones, Cameras, Gaming
- **Books**: Fiction, Non-fiction, Textbooks, Comics
- **Clothing**: Men's, Women's, Kids, Accessories
- **Home**: Furniture, Appliances, Decor, Kitchen
- **Sports**: Equipment, Apparel, Outdoor gear
- **Automotive**: Parts, Accessories, Tools

## Notes

1. **Authorization**: Users can only edit/delete products they have created
2. **Admin Privileges**: Admins have the same permissions as regular users for product management
3. **Product Approval**: All products are automatically approved (`isApproved: true`) upon creation
4. **Soft Delete**: Products are hard deleted from the database
5. **Search**: The search functionality is case-insensitive and searches both title and description fields
6. **Pagination**: Default pagination is 10 items per page, maximum recommended is 100
7. **Price Handling**: Prices are stored as Decimal type in the database for precision