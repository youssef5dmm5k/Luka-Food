openapi: 3.1.0
info:
  # Do not change the title, if the title changes, the import paths will be broken
  title: Api
  version: 0.1.0
  description: Luka Food Restaurant API
servers:
  - url: /api
    description: Base API path
tags:
  - name: health
    description: Health operations
  - name: categories
    description: Food categories
  - name: menu-items
    description: Menu items
  - name: orders
    description: Customer orders

paths:
  /healthz:
    get:
      operationId: healthCheck
      tags: [health]
      summary: Health check
      description: Returns server health status
      responses:
        "200":
          description: Healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthStatus"

  /categories:
    get:
      operationId: listCategories
      tags: [categories]
      summary: List all categories
      responses:
        "200":
          description: List of categories
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Category"
    post:
      operationId: createCategory
      tags: [categories]
      summary: Create a category
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CategoryInput"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Category"

  /menu-items:
    get:
      operationId: listMenuItems
      tags: [menu-items]
      summary: List all menu items
      parameters:
        - in: query
          name: categoryId
          schema:
            type: integer
          required: false
      responses:
        "200":
          description: List of menu items
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/MenuItem"
    post:
      operationId: createMenuItem
      tags: [menu-items]
      summary: Create a menu item
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/MenuItemInput"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MenuItem"

  /menu-items/{id}:
    patch:
      operationId: updateMenuItem
      tags: [menu-items]
      summary: Update a menu item
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/MenuItemPatch"
      responses:
        "200":
          description: Updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MenuItem"
        "404":
          description: Not found
    delete:
      operationId: deleteMenuItem
      tags: [menu-items]
      summary: Delete a menu item
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      responses:
        "204":
          description: Deleted
        "404":
          description: Not found

  /orders:
    get:
      operationId: listOrders
      tags: [orders]
      summary: List all orders
      parameters:
        - in: query
          name: status
          schema:
            type: string
            enum: [pending, preparing, completed]
          required: false
      responses:
        "200":
          description: List of orders
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Order"
    post:
      operationId: createOrder
      tags: [orders]
      summary: Create an order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/OrderInput"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Order"

  /orders/stats:
    get:
      operationId: getOrderStats
      tags: [orders]
      summary: Get order statistics for the kitchen dashboard
      responses:
        "200":
          description: Order stats
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OrderStats"

  /orders/{id}/status:
    patch:
      operationId: advanceOrderStatus
      tags: [orders]
      summary: Advance order status to next stage
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/OrderStatusPatch"
      responses:
        "200":
          description: Updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Order"
        "404":
          description: Not found

components:
  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
      required:
        - status

    Category:
      type: object
      required: [id, name, createdAt]
      properties:
        id:
          type: integer
        name:
          type: string
        createdAt:
          type: string

    CategoryInput:
      type: object
      required: [name]
      properties:
        name:
          type: string
          minLength: 1

    MenuItem:
      type: object
      required: [id, categoryId, name, price, available, createdAt]
      properties:
        id:
          type: integer
        categoryId:
          type: integer
        categoryName:
          type: ["string", "null"]
        name:
          type: string
        description:
          type: ["string", "null"]
        price:
          type: number
        imageUrl:
          type: ["string", "null"]
        available:
          type: boolean
        createdAt:
          type: string

    MenuItemInput:
      type: object
      required: [categoryId, name, price]
      properties:
        categoryId:
          type: integer
        name:
          type: string
          minLength: 1
        description:
          type: string
        price:
          type: number
          minimum: 0
        imageUrl:
          type: string
        available:
          type: boolean

    MenuItemPatch:
      type: object
      properties:
        categoryId:
          type: integer
        name:
          type: string
          minLength: 1
        description:
          type: string
        price:
          type: number
          minimum: 0
        imageUrl:
          type: string
        available:
          type: boolean

    OrderItem:
      type: object
      required: [id, menuItemId, menuItemName, quantity, unitPrice]
      properties:
        id:
          type: integer
        menuItemId:
          type: integer
        menuItemName:
          type: string
        quantity:
          type: integer
        unitPrice:
          type: number

    OrderItemInput:
      type: object
      required: [menuItemId, quantity]
      properties:
        menuItemId:
          type: integer
        quantity:
          type: integer
          minimum: 1

    Order:
      type: object
      required: [id, tableNumber, status, totalPrice, createdAt, items]
      properties:
        id:
          type: integer
        tableNumber:
          type: integer
        status:
          type: string
          enum: [pending, preparing, completed]
        totalPrice:
          type: number
        notes:
          type: ["string", "null"]
        createdAt:
          type: string
        items:
          type: array
          items:
            $ref: "#/components/schemas/OrderItem"

    OrderInput:
      type: object
      required: [tableNumber, items]
      properties:
        tableNumber:
          type: integer
          minimum: 1
        notes:
          type: string
        items:
          type: array
          minItems: 1
          items:
            $ref: "#/components/schemas/OrderItemInput"

    OrderStatusPatch:
      type: object
      required: [status]
      properties:
        status:
          type: string
          enum: [pending, preparing, completed]

    OrderStats:
      type: object
      required: [pending, preparing, completed, totalToday, revenueToday]
      properties:
        pending:
          type: integer
        preparing:
          type: integer
        completed:
          type: integer
        totalToday:
          type: integer
        revenueToday:
          type: number
