# Products API Endpoints

This server now includes product management endpoints with Supabase integration.

## Setup

1. **Environment Variables**: Make sure your `.env` file includes:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. **Database Setup**: Run the SQL migration in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase-migration.sql
   ```

## API Endpoints

### GET /api/products
Retrieves all products from the database.

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "product-1",
      "name": "Sample Product",
      "pricing": 29.99,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/products
Creates a new product.

**Request Body:**
```json
{
  "id": "product-1",
  "name": "Sample Product",
  "pricing": 29.99
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "product-1",
    "name": "Sample Product",
    "pricing": 29.99,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Handling

- **400 Bad Request**: Missing required fields or invalid JSON
- **409 Conflict**: Product with the same ID already exists
- **500 Internal Server Error**: Database connection issues

## Testing

You can test the endpoints using curl:

```bash
# Get all products
curl http://localhost:3001/api/products

# Create a product
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-product",
    "name": "Test Product",
    "pricing": 19.99
  }'
```
