"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ApiDocumentation() {
  const endpoints = [
    {
      category: "Authentication",
      apis: [
        {
          method: "POST",
          endpoint: "/api/auth/login",
          description: "User login",
          body: { username: "string", password: "string" },
          response: { token: "string", user: "object" },
        },
        {
          method: "POST",
          endpoint: "/api/auth/logout",
          description: "User logout",
          body: {},
          response: { message: "string" },
        },
      ],
    },
    {
      category: "Products",
      apis: [
        {
          method: "GET",
          endpoint: "/api/products",
          description: "Get all products",
          params: { page: "number", limit: "number", category: "string", search: "string" },
          response: { products: "array", total: "number", page: "number" },
        },
        {
          method: "POST",
          endpoint: "/api/products",
          description: "Create new product",
          body: {
            name: "string",
            sku: "string",
            category_id: "number",
            unit: "string",
            purchase_price: "number",
            selling_price: "number",
          },
          response: { product: "object", message: "string" },
        },
        {
          method: "PUT",
          endpoint: "/api/products/:id",
          description: "Update product",
          body: { name: "string", selling_price: "number" },
          response: { product: "object", message: "string" },
        },
        {
          method: "DELETE",
          endpoint: "/api/products/:id",
          description: "Delete product",
          response: { message: "string" },
        },
      ],
    },
    {
      category: "Inventory",
      apis: [
        {
          method: "GET",
          endpoint: "/api/inventory",
          description: "Get inventory levels",
          params: { low_stock: "boolean" },
          response: { inventory: "array" },
        },
        {
          method: "POST",
          endpoint: "/api/inventory/adjustment",
          description: "Stock adjustment",
          body: { product_id: "number", quantity: "number", type: "string", notes: "string" },
          response: { movement: "object", message: "string" },
        },
        {
          method: "GET",
          endpoint: "/api/inventory/movements",
          description: "Get stock movements",
          params: { product_id: "number", from_date: "string", to_date: "string" },
          response: { movements: "array" },
        },
      ],
    },
    {
      category: "Sales",
      apis: [
        {
          method: "GET",
          endpoint: "/api/sales/invoices",
          description: "Get sales invoices",
          params: { status: "string", customer_id: "number", from_date: "string", to_date: "string" },
          response: { invoices: "array", total: "number" },
        },
        {
          method: "POST",
          endpoint: "/api/sales/invoices",
          description: "Create sales invoice",
          body: { customer_id: "number", items: "array", invoice_date: "string" },
          response: { invoice: "object", message: "string" },
        },
        {
          method: "GET",
          endpoint: "/api/sales/invoices/:id",
          description: "Get invoice details",
          response: { invoice: "object", items: "array" },
        },
        {
          method: "POST",
          endpoint: "/api/sales/payments",
          description: "Record payment",
          body: { invoice_id: "number", amount: "number", payment_method: "string", payment_date: "string" },
          response: { payment: "object", message: "string" },
        },
      ],
    },
    {
      category: "Purchases",
      apis: [
        {
          method: "GET",
          endpoint: "/api/purchases/orders",
          description: "Get purchase orders",
          params: { status: "string", supplier_id: "number" },
          response: { orders: "array" },
        },
        {
          method: "POST",
          endpoint: "/api/purchases/orders",
          description: "Create purchase order",
          body: { supplier_id: "number", items: "array", expected_delivery: "string" },
          response: { order: "object", message: "string" },
        },
        {
          method: "POST",
          endpoint: "/api/purchases/grn",
          description: "Goods receipt note",
          body: { po_id: "number", items: "array", received_date: "string" },
          response: { grn: "object", message: "string" },
        },
      ],
    },
    {
      category: "Reports",
      apis: [
        {
          method: "GET",
          endpoint: "/api/reports/sales",
          description: "Sales report",
          params: { from_date: "string", to_date: "string", group_by: "string" },
          response: { report: "object", data: "array" },
        },
        {
          method: "GET",
          endpoint: "/api/reports/inventory",
          description: "Inventory report",
          params: { category: "string", location: "string" },
          response: { report: "object", data: "array" },
        },
        {
          method: "GET",
          endpoint: "/api/reports/profit",
          description: "Profit analysis",
          params: { from_date: "string", to_date: "string", product_id: "number" },
          response: { report: "object", data: "array" },
        },
      ],
    },
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800"
      case "POST":
        return "bg-blue-100 text-blue-800"
      case "PUT":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Documentation</h1>
        <p className="text-gray-600">RESTful API endpoints for Sales & Inventory Management System</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">API Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                The Sales & Inventory Management API provides RESTful endpoints for managing products, inventory, sales,
                and purchases.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/api</code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-gray-600">
                  Most endpoints require authentication. Include the JWT token in the Authorization header:
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded block mt-1">Authorization: Bearer {"<token>"}</code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Response Format</h3>
                <p className="text-sm text-gray-600">All responses are in JSON format with the following structure:</p>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
                  {`{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Error Handling</h3>
                <p className="text-sm text-gray-600">Error responses include appropriate HTTP status codes:</p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>
                    <code>400</code> - Bad Request (validation errors)
                  </li>
                  <li>
                    <code>401</code> - Unauthorized (authentication required)
                  </li>
                  <li>
                    <code>403</code> - Forbidden (insufficient permissions)
                  </li>
                  <li>
                    <code>404</code> - Not Found
                  </li>
                  <li>
                    <code>500</code> - Internal Server Error
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {endpoints.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="text-xl">{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.apis.map((api, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={getMethodColor(api.method)}>{api.method}</Badge>
                      <code className="font-mono text-sm">{api.endpoint}</code>
                    </div>

                    <p className="text-sm text-gray-600">{api.description}</p>

                    {api.params && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Query Parameters:</h4>
                        <pre className="bg-gray-50 p-2 rounded text-xs">{JSON.stringify(api.params, null, 2)}</pre>
                      </div>
                    )}

                    {api.body && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Request Body:</h4>
                        <pre className="bg-gray-50 p-2 rounded text-xs">{JSON.stringify(api.body, null, 2)}</pre>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-sm mb-2">Response:</h4>
                      <pre className="bg-gray-50 p-2 rounded text-xs">{JSON.stringify(api.response, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 list-disc list-inside text-sm">
            <li>
              All endpoints support pagination using <code>page</code> and <code>limit</code> parameters
            </li>
            <li>Date parameters should be in ISO 8601 format (YYYY-MM-DD)</li>
            <li>Monetary values are returned as numbers with 2 decimal places</li>
            <li>Stock quantities support decimal values for partial units</li>
            <li>All create/update operations return the complete object in response</li>
            <li>Soft deletes are used - deleted records are marked as inactive</li>
            <li>Audit trails are maintained for all critical operations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
