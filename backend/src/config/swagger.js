const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sellify API",
      version: "1.0.0",
      description: "Sellify POS & E-commerce Backend API",
    },
    servers: [
      { url: "http://localhost:5000", description: "Development" },
    ],
    components: {
      securitySchemes: {
        AdminAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Admin/Staff JWT token",
        },
        CustomerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Customer JWT token",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Admin/Staff authentication" },
      { name: "Users", description: "Staff management (admin only)" },
      { name: "Products (Admin)", description: "Product management (admin/staff)" },
      { name: "Products (Public)", description: "Public product browsing" },
      { name: "Categories (Admin)", description: "Category management (admin/staff)" },
      { name: "Categories (Public)", description: "Public category browsing" },
      { name: "Customer Auth", description: "Customer registration & login" },
      { name: "Customers (Admin)", description: "Customer management (admin/staff)" },
      { name: "Orders (Admin)", description: "Order management (admin/staff)" },
      { name: "Orders (Customer)", description: "Customer order history" },
      { name: "Checkout", description: "Stripe checkout flow" },
      { name: "Payments", description: "Payment tracking" },
      { name: "Dashboard", description: "Analytics & statistics" },
    ],

    // ─── PATHS ─────────────────────────────────────────────────────────────────

    paths: {

      // ═══ AUTH ═══════════════════════════════════════════════════════════════

      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login (admin/staff)",
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", example: "admin@sellify.com" },
                password: { type: "string", example: "password123" },
              },
            }}},
          },
          responses: { 200: { description: "Login successful" } },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register new staff (admin only)",
          security: [{ AdminAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string", example: "John Staff" },
                email: { type: "string", example: "staff@sellify.com" },
                password: { type: "string", example: "password123" },
                role: { type: "string", enum: ["admin", "staff"], default: "staff" },
              },
            }}},
          },
          responses: { 201: { description: "User registered" } },
        },
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["refreshToken"],
              properties: { refreshToken: { type: "string" } },
            }}},
          },
          responses: { 200: { description: "Tokens refreshed" } },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          security: [{ AdminAuth: [] }],
          responses: { 200: { description: "Logged out" } },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user profile",
          security: [{ AdminAuth: [] }],
          responses: { 200: { description: "Profile retrieved" } },
        },
      },

      // ═══ USERS ═════════════════════════════════════════════════════════════

      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "List all users (admin only)",
          security: [{ AdminAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
          ],
          responses: { 200: { description: "Users list" } },
        },
      },
      "/api/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get user by ID",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "User details" } },
        },
        put: {
          tags: ["Users"],
          summary: "Update user",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                role: { type: "string", enum: ["admin", "staff"] },
              },
            }}},
          },
          responses: { 200: { description: "User updated" } },
        },
        delete: {
          tags: ["Users"],
          summary: "Deactivate user (admin only)",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "User deactivated" } },
        },
      },
      "/api/users/{id}/change-password": {
        put: {
          tags: ["Users"],
          summary: "Change password",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["currentPassword", "newPassword"],
              properties: {
                currentPassword: { type: "string" },
                newPassword: { type: "string" },
              },
            }}},
          },
          responses: { 200: { description: "Password changed" } },
        },
      },

      // ═══ PRODUCTS (PUBLIC) ═════════════════════════════════════════════════

      "/api/products/public": {
        get: {
          tags: ["Products (Public)"],
          summary: "Browse products (no auth)",
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "category", schema: { type: "string" }, description: "Category ID" },
            { in: "query", name: "search", schema: { type: "string" } },
            { in: "query", name: "minPrice", schema: { type: "number" } },
            { in: "query", name: "maxPrice", schema: { type: "number" } },
            { in: "query", name: "sort", schema: { type: "string", enum: ["newest", "price-low", "price-high"] } },
          ],
          responses: { 200: { description: "Products list" } },
        },
      },
      "/api/products/public/featured": {
        get: {
          tags: ["Products (Public)"],
          summary: "Get featured products (no auth)",
          parameters: [
            { in: "query", name: "limit", schema: { type: "integer", default: 8 } },
          ],
          responses: { 200: { description: "Featured products" } },
        },
      },
      "/api/products/public/{id}": {
        get: {
          tags: ["Products (Public)"],
          summary: "Get product detail (no auth)",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Product details" } },
        },
      },

      // ═══ PRODUCTS (ADMIN) ══════════════════════════════════════════════════

      "/api/products": {
        get: {
          tags: ["Products (Admin)"],
          summary: "List all products",
          security: [{ AdminAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "category", schema: { type: "string" } },
            { in: "query", name: "isActive", schema: { type: "string", enum: ["true", "false"] } },
            { in: "query", name: "search", schema: { type: "string" } },
            { in: "query", name: "lowStock", schema: { type: "string", enum: ["true"] } },
          ],
          responses: { 200: { description: "Products list" } },
        },
        post: {
          tags: ["Products (Admin)"],
          summary: "Create product (admin only)",
          security: [{ AdminAuth: [] }],
          requestBody: {
            required: true,
            content: { "multipart/form-data": { schema: {
              type: "object",
              required: ["name", "price", "category"],
              properties: {
                name: { type: "string", example: "Wireless Mouse" },
                description: { type: "string" },
                sku: { type: "string", example: "WM-001" },
                price: { type: "number", example: 29.99 },
                costPrice: { type: "number", example: 15.00 },
                category: { type: "string", description: "Category ID" },
                stock: { type: "integer", example: 100 },
                lowStockThreshold: { type: "integer", default: 5 },
                unit: { type: "string", default: "pcs" },
                images: { type: "array", items: { type: "string", format: "binary" } },
              },
            }}},
          },
          responses: { 201: { description: "Product created" } },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products (Admin)"],
          summary: "Get product by ID",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Product details" } },
        },
        put: {
          tags: ["Products (Admin)"],
          summary: "Update product (admin only)",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "multipart/form-data": { schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                sku: { type: "string" },
                price: { type: "number" },
                costPrice: { type: "number" },
                category: { type: "string" },
                stock: { type: "integer" },
                images: { type: "array", items: { type: "string", format: "binary" } },
              },
            }}},
          },
          responses: { 200: { description: "Product updated" } },
        },
        delete: {
          tags: ["Products (Admin)"],
          summary: "Deactivate product (admin only)",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Product deactivated" } },
        },
      },
      "/api/products/{id}/stock": {
        patch: {
          tags: ["Products (Admin)"],
          summary: "Adjust stock (admin only)",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["quantity"],
              properties: { quantity: { type: "integer", example: 50, description: "Positive to add, negative to deduct" } },
            }}},
          },
          responses: { 200: { description: "Stock adjusted" } },
        },
      },

      // ═══ CATEGORIES (PUBLIC) ═══════════════════════════════════════════════

      "/api/categories/public": {
        get: {
          tags: ["Categories (Public)"],
          summary: "List active categories (no auth)",
          responses: { 200: { description: "Categories list" } },
        },
      },

      // ═══ CATEGORIES (ADMIN) ════════════════════════════════════════════════

      "/api/categories": {
        get: {
          tags: ["Categories (Admin)"],
          summary: "List all categories",
          security: [{ AdminAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "isActive", schema: { type: "string", enum: ["true", "false"] } },
            { in: "query", name: "search", schema: { type: "string" } },
          ],
          responses: { 200: { description: "Categories list" } },
        },
        post: {
          tags: ["Categories (Admin)"],
          summary: "Create category (admin only)",
          security: [{ AdminAuth: [] }],
          requestBody: {
            required: true,
            content: { "multipart/form-data": { schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Electronics" },
                description: { type: "string" },
                image: { type: "string", format: "binary" },
              },
            }}},
          },
          responses: { 201: { description: "Category created" } },
        },
      },
      "/api/categories/{id}": {
        get: {
          tags: ["Categories (Admin)"],
          summary: "Get category by ID",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Category details" } },
        },
        put: {
          tags: ["Categories (Admin)"],
          summary: "Update category (admin only)",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "multipart/form-data": { schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                image: { type: "string", format: "binary" },
              },
            }}},
          },
          responses: { 200: { description: "Category updated" } },
        },
        delete: {
          tags: ["Categories (Admin)"],
          summary: "Deactivate category (admin only)",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Category deactivated" } },
        },
      },

      // ═══ CUSTOMER AUTH ═════════════════════════════════════════════════════

      "/api/customers/auth/register": {
        post: {
          tags: ["Customer Auth"],
          summary: "Register customer",
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string", example: "Jane Customer" },
                email: { type: "string", example: "jane@example.com" },
                password: { type: "string", example: "password123" },
                phone: { type: "string", example: "+1234567890" },
              },
            }}},
          },
          responses: { 201: { description: "Registration successful" } },
        },
      },
      "/api/customers/auth/login": {
        post: {
          tags: ["Customer Auth"],
          summary: "Login customer",
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", example: "jane@example.com" },
                password: { type: "string", example: "password123" },
              },
            }}},
          },
          responses: { 200: { description: "Login successful" } },
        },
      },
      "/api/customers/auth/refresh": {
        post: {
          tags: ["Customer Auth"],
          summary: "Refresh customer token",
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["refreshToken"],
              properties: { refreshToken: { type: "string" } },
            }}},
          },
          responses: { 200: { description: "Tokens refreshed" } },
        },
      },
      "/api/customers/auth/logout": {
        post: {
          tags: ["Customer Auth"],
          summary: "Logout customer",
          security: [{ CustomerAuth: [] }],
          responses: { 200: { description: "Logged out" } },
        },
      },
      "/api/customers/auth/me": {
        get: {
          tags: ["Customer Auth"],
          summary: "Get customer profile",
          security: [{ CustomerAuth: [] }],
          responses: { 200: { description: "Profile retrieved" } },
        },
      },
      "/api/customers/auth/profile": {
        put: {
          tags: ["Customer Auth"],
          summary: "Update customer profile",
          security: [{ CustomerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
                address: {
                  type: "object",
                  properties: {
                    street: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    zipCode: { type: "string" },
                  },
                },
              },
            }}},
          },
          responses: { 200: { description: "Profile updated" } },
        },
      },
      "/api/customers/auth/change-password": {
        put: {
          tags: ["Customer Auth"],
          summary: "Change customer password",
          security: [{ CustomerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["currentPassword", "newPassword"],
              properties: {
                currentPassword: { type: "string" },
                newPassword: { type: "string" },
              },
            }}},
          },
          responses: { 200: { description: "Password changed" } },
        },
      },

      // ═══ CUSTOMERS (ADMIN) ═════════════════════════════════════════════════

      "/api/customers": {
        get: {
          tags: ["Customers (Admin)"],
          summary: "List all customers",
          security: [{ AdminAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "search", schema: { type: "string" } },
            { in: "query", name: "isActive", schema: { type: "string", enum: ["true", "false"] } },
          ],
          responses: { 200: { description: "Customers list" } },
        },
        post: {
          tags: ["Customers (Admin)"],
          summary: "Create customer (admin/staff)",
          security: [{ AdminAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Walk-in Customer" },
                email: { type: "string" },
                phone: { type: "string" },
                address: {
                  type: "object",
                  properties: { street: { type: "string" }, city: { type: "string" }, state: { type: "string" }, zipCode: { type: "string" } },
                },
                notes: { type: "string" },
              },
            }}},
          },
          responses: { 201: { description: "Customer created" } },
        },
      },
      "/api/customers/{id}": {
        get: {
          tags: ["Customers (Admin)"],
          summary: "Get customer by ID",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Customer details" } },
        },
        put: {
          tags: ["Customers (Admin)"],
          summary: "Update customer",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: {
              type: "object",
              properties: { name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, notes: { type: "string" }, isActive: { type: "boolean" } },
            }}},
          },
          responses: { 200: { description: "Customer updated" } },
        },
        delete: {
          tags: ["Customers (Admin)"],
          summary: "Deactivate customer",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Customer deactivated" } },
        },
      },

      // ═══ ORDERS (CUSTOMER) ═════════════════════════════════════════════════

      "/api/orders/my": {
        get: {
          tags: ["Orders (Customer)"],
          summary: "List my orders",
          security: [{ CustomerAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          ],
          responses: { 200: { description: "Customer orders" } },
        },
      },
      "/api/orders/my/{id}": {
        get: {
          tags: ["Orders (Customer)"],
          summary: "Get my order detail",
          security: [{ CustomerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Order details" } },
        },
      },

      // ═══ ORDERS (ADMIN) ════════════════════════════════════════════════════

      "/api/orders": {
        get: {
          tags: ["Orders (Admin)"],
          summary: "List all orders",
          security: [{ AdminAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "paymentStatus", schema: { type: "string", enum: ["paid", "unpaid", "partial"] } },
            { in: "query", name: "paymentMethod", schema: { type: "string", enum: ["cash", "card", "online", "none"] } },
            { in: "query", name: "customerId", schema: { type: "string" } },
            { in: "query", name: "search", schema: { type: "string" }, description: "Search by order number" },
            { in: "query", name: "startDate", schema: { type: "string", format: "date" } },
            { in: "query", name: "endDate", schema: { type: "string", format: "date" } },
          ],
          responses: { 200: { description: "Orders list" } },
        },
        post: {
          tags: ["Orders (Admin)"],
          summary: "Create POS order",
          security: [{ AdminAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["items"],
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["productId", "quantity"],
                    properties: {
                      productId: { type: "string" },
                      quantity: { type: "integer", minimum: 1 },
                    },
                  },
                },
                customerId: { type: "string", description: "Optional — null for walk-in" },
                discount: { type: "number", default: 0 },
                tax: { type: "number", default: 0 },
                paymentMethod: { type: "string", enum: ["cash", "card", "online", "none"], default: "none" },
                amountPaid: { type: "number", default: 0 },
                notes: { type: "string" },
              },
            }}},
          },
          responses: { 201: { description: "Order created" } },
        },
      },
      "/api/orders/{id}": {
        get: {
          tags: ["Orders (Admin)"],
          summary: "Get order by ID",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Order details" } },
        },
      },
      "/api/orders/{id}/payment": {
        patch: {
          tags: ["Orders (Admin)"],
          summary: "Update payment status",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: {
              type: "object",
              properties: {
                paymentStatus: { type: "string", enum: ["paid", "unpaid", "partial"] },
                paymentMethod: { type: "string", enum: ["cash", "card", "online", "none"] },
                amountPaid: { type: "number" },
              },
            }}},
          },
          responses: { 200: { description: "Payment updated" } },
        },
      },
      "/api/orders/{id}/status": {
        patch: {
          tags: ["Orders (Admin)"],
          summary: "Update order status",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["orderStatus"],
              properties: {
                orderStatus: { type: "string", enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] },
              },
            }}},
          },
          responses: { 200: { description: "Order status updated" } },
        },
      },

      // ═══ CHECKOUT ══════════════════════════════════════════════════════════

      "/api/checkout/create-session": {
        post: {
          tags: ["Checkout"],
          summary: "Create Stripe checkout session",
          security: [{ CustomerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["items", "shippingAddress"],
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["productId", "quantity"],
                    properties: {
                      productId: { type: "string" },
                      quantity: { type: "integer", minimum: 1 },
                    },
                  },
                },
                shippingAddress: {
                  type: "object",
                  required: ["street", "city", "state", "zipCode"],
                  properties: {
                    street: { type: "string", example: "123 Main St" },
                    city: { type: "string", example: "New York" },
                    state: { type: "string", example: "NY" },
                    zipCode: { type: "string", example: "10001" },
                  },
                },
              },
            }}},
          },
          responses: { 200: { description: "Checkout session created with Stripe URL" } },
        },
      },
      "/api/checkout/webhook": {
        post: {
          tags: ["Checkout"],
          summary: "Stripe webhook (called by Stripe)",
          description: "Do not call manually. Stripe sends events here after payment.",
          responses: { 200: { description: "Webhook processed" } },
        },
      },
      "/api/checkout/session/{sessionId}": {
        get: {
          tags: ["Checkout"],
          summary: "Get checkout session status",
          security: [{ CustomerAuth: [] }],
          parameters: [{ in: "path", name: "sessionId", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Session status" } },
        },
      },

      // ═══ PAYMENTS ══════════════════════════════════════════════════════════

      "/api/payments": {
        get: {
          tags: ["Payments"],
          summary: "List all payments (admin only)",
          security: [{ AdminAuth: [] }],
          parameters: [
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "method", schema: { type: "string", enum: ["cash", "card", "online"] } },
            { in: "query", name: "status", schema: { type: "string", enum: ["completed", "pending", "failed", "refunded"] } },
            { in: "query", name: "startDate", schema: { type: "string", format: "date" } },
            { in: "query", name: "endDate", schema: { type: "string", format: "date" } },
          ],
          responses: { 200: { description: "Payments list" } },
        },
        post: {
          tags: ["Payments"],
          summary: "Record payment for order",
          security: [{ AdminAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: {
              type: "object",
              required: ["orderId", "amount", "method"],
              properties: {
                orderId: { type: "string" },
                amount: { type: "number", example: 49.99 },
                method: { type: "string", enum: ["cash", "card", "online"] },
                transactionId: { type: "string" },
                notes: { type: "string" },
              },
            }}},
          },
          responses: { 201: { description: "Payment recorded" } },
        },
      },
      "/api/payments/order/{orderId}": {
        get: {
          tags: ["Payments"],
          summary: "Get payments for an order",
          security: [{ AdminAuth: [] }],
          parameters: [{ in: "path", name: "orderId", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Order payments" } },
        },
      },

      // ═══ DASHBOARD ═════════════════════════════════════════════════════════

      "/api/dashboard/stats": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard statistics",
          security: [{ AdminAuth: [] }],
          responses: { 200: { description: "Dashboard stats (today sales, revenue, top products, low stock, etc.)" } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
