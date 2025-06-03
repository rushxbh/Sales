"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Edit, Trash2, Send, Download, CheckCircle, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuotationItem {
  id: string
  product_id: number
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  discount_percent: number
  total_price: number
}

interface Quotation {
  id: number
  quote_number: string
  customer_id: number
  customer_name: string
  quote_date: string
  valid_until: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired"
  notes?: string
  terms_conditions?: string
  created_by: number
  created_at: string
  items: QuotationItem[]
}

interface QuotationFormData {
  customer_id: string
  quote_date: string
  valid_until: string
  notes: string
  terms_conditions: string
  items: Array<{
    product_id: string
    quantity: string
    unit_price: string
    discount_percent: string
  }>
}

export default function QuotationSystem() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(false)
  const [quotationForm, setQuotationForm] = useState<QuotationFormData>({
    customer_id: "",
    quote_date: new Date().toISOString().split("T")[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    notes: "",
    terms_conditions:
      "1. Prices are valid for 30 days from quote date.\n2. Payment terms: 30 days from invoice date.\n3. Delivery charges extra if applicable.\n4. All prices are inclusive of applicable taxes.",
    items: [{ product_id: "", quantity: "", unit_price: "", discount_percent: "0" }],
  })
  const { toast } = useToast()

  // Mock data
  const mockQuotations: Quotation[] = [
    {
      id: 1,
      quote_number: "QUO001",
      customer_id: 1,
      customer_name: "ABC Furniture",
      quote_date: "2024-01-15",
      valid_until: "2024-02-14",
      subtotal: 15000,
      tax_amount: 2700,
      total_amount: 17700,
      status: "Sent",
      notes: "Bulk order discount applied",
      terms_conditions: "Standard terms and conditions apply",
      created_by: 1,
      created_at: "2024-01-15T10:00:00Z",
      items: [
        {
          id: "1",
          product_id: 1,
          product_name: "Marine Plywood 18mm",
          sku: "PLY001",
          quantity: 10,
          unit_price: 2500,
          discount_percent: 5,
          total_price: 23750,
        },
      ],
    },
    {
      id: 2,
      quote_number: "QUO002",
      customer_id: 2,
      customer_name: "XYZ Interiors",
      quote_date: "2024-01-14",
      valid_until: "2024-02-13",
      subtotal: 8500,
      tax_amount: 1530,
      total_amount: 10030,
      status: "Draft",
      created_by: 1,
      created_at: "2024-01-14T15:30:00Z",
      items: [
        {
          id: "2",
          product_id: 2,
          product_name: "Sunmica Laminate - Walnut",
          sku: "LAM001",
          quantity: 10,
          unit_price: 850,
          discount_percent: 0,
          total_price: 8500,
        },
      ],
    },
  ]

  const mockProducts = [
    { id: 1, name: "Marine Plywood 18mm", sku: "PLY001", selling_price: 2500 },
    { id: 2, name: "Sunmica Laminate - Walnut", sku: "LAM001", selling_price: 850 },
    { id: 3, name: "Soft Close Hinges", sku: "HW001", selling_price: 45 },
  ]

  const mockCustomers = [
    { id: 1, name: "ABC Furniture" },
    { id: 2, name: "XYZ Interiors" },
    { id: 3, name: "Modern Designs" },
  ]

  useEffect(() => {
    setQuotations(mockQuotations)
  }, [])

  const addQuotationItem = () => {
    setQuotationForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: "", unit_price: "", discount_percent: "0" }],
    }))
  }

  const removeQuotationItem = (index: number) => {
    setQuotationForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateQuotationItem = (index: number, field: string, value: string) => {
    setQuotationForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const calculateItemTotal = (quantity: string, unitPrice: string, discount: string) => {
    const qty = Number.parseFloat(quantity) || 0
    const price = Number.parseFloat(unitPrice) || 0
    const disc = Number.parseFloat(discount) || 0

    const subtotal = qty * price
    const discountAmount = (subtotal * disc) / 100
    return subtotal - discountAmount
  }

  const calculateQuotationTotals = () => {
    const subtotal = quotationForm.items.reduce((sum, item) => {
      return sum + calculateItemTotal(item.quantity, item.unit_price, item.discount_percent)
    }, 0)

    const taxAmount = subtotal * 0.18 // 18% GST
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quotationForm.customer_id || quotationForm.items.length === 0) {
      toast({
        title: "Error",
        description: "Please select a customer and add at least one item",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { subtotal, taxAmount, total } = calculateQuotationTotals()
      const customer = mockCustomers.find((c) => c.id === Number.parseInt(quotationForm.customer_id))

      const newQuotation: Quotation = {
        id: Date.now(),
        quote_number: `QUO${String(quotations.length + 1).padStart(3, "0")}`,
        customer_id: Number.parseInt(quotationForm.customer_id),
        customer_name: customer?.name || "",
        quote_date: quotationForm.quote_date,
        valid_until: quotationForm.valid_until,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        status: "Draft",
        notes: quotationForm.notes,
        terms_conditions: quotationForm.terms_conditions,
        created_by: 1,
        created_at: new Date().toISOString(),
        items: quotationForm.items.map((item, index) => {
          const product = mockProducts.find((p) => p.id === Number.parseInt(item.product_id))
          return {
            id: String(index + 1),
            product_id: Number.parseInt(item.product_id),
            product_name: product?.name || "",
            sku: product?.sku || "",
            quantity: Number.parseFloat(item.quantity),
            unit_price: Number.parseFloat(item.unit_price),
            discount_percent: Number.parseFloat(item.discount_percent),
            total_price: calculateItemTotal(item.quantity, item.unit_price, item.discount_percent),
          }
        }),
      }

      setQuotations((prev) => [...prev, newQuotation])
      setShowCreateDialog(false)
      resetForm()

      toast({
        title: "Success",
        description: "Quotation created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quotation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setQuotationForm({
      customer_id: "",
      quote_date: new Date().toISOString().split("T")[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "",
      terms_conditions:
        "1. Prices are valid for 30 days from quote date.\n2. Payment terms: 30 days from invoice date.\n3. Delivery charges extra if applicable.\n4. All prices are inclusive of applicable taxes.",
      items: [{ product_id: "", quantity: "", unit_price: "", discount_percent: "0" }],
    })
  }

  const sendQuotation = async (quotationId: number) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setQuotations((prev) => prev.map((q) => (q.id === quotationId ? { ...q, status: "Sent" as const } : q)))

      toast({
        title: "Success",
        description: "Quotation sent to customer",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quotation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const convertToInvoice = async (quotationId: number) => {
    if (!confirm("Convert this quotation to an invoice?")) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setQuotations((prev) => prev.map((q) => (q.id === quotationId ? { ...q, status: "Accepted" as const } : q)))

      toast({
        title: "Success",
        description: "Quotation converted to invoice",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert quotation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800"
      case "Sent":
        return "bg-blue-100 text-blue-800"
      case "Accepted":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Expired":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Sent":
        return <Send className="h-3 w-3" />
      case "Accepted":
        return <CheckCircle className="h-3 w-3" />
      case "Rejected":
        return <XCircle className="h-3 w-3" />
      case "Expired":
        return <Clock className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }

  const { subtotal, taxAmount, total } = calculateQuotationTotals()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>Quotations</span>
          </h1>
          <p className="text-gray-600">Create and manage sales quotations</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quotation</DialogTitle>
              <DialogDescription>Create a new sales quotation for a customer</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateQuotation} className="space-y-6">
              {/* Customer and Date Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select
                    value={quotationForm.customer_id}
                    onValueChange={(value) => setQuotationForm((prev) => ({ ...prev, customer_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Quote Date</Label>
                    <Input
                      type="date"
                      value={quotationForm.quote_date}
                      onChange={(e) => setQuotationForm((prev) => ({ ...prev, quote_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={quotationForm.valid_until}
                      onChange={(e) => setQuotationForm((prev) => ({ ...prev, valid_until: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Quotation Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuotationItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {quotationForm.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Item {index + 1}</span>
                        {quotationForm.items.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuotationItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-2 space-y-2">
                          <Label>Product</Label>
                          <Select
                            value={item.product_id}
                            onValueChange={(value) => {
                              updateQuotationItem(index, "product_id", value)
                              const product = mockProducts.find((p) => p.id === Number.parseInt(value))
                              if (product) {
                                updateQuotationItem(index, "unit_price", String(product.selling_price))
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockProducts.map((product) => (
                                <SelectItem key={product.id} value={String(product.id)}>
                                  {product.name} - ₹{product.selling_price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuotationItem(index, "quantity", e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateQuotationItem(index, "unit_price", e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Discount %</Label>
                          <Input
                            type="number"
                            value={item.discount_percent}
                            onChange={(e) => updateQuotationItem(index, "discount_percent", e.target.value)}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-medium">
                          Total: ₹{calculateItemTotal(item.quantity, item.unit_price, item.discount_percent).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={quotationForm.notes}
                    onChange={(e) => setQuotationForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for the customer"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    value={quotationForm.terms_conditions}
                    onChange={(e) => setQuotationForm((prev) => ({ ...prev, terms_conditions: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Quotation"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quotations</CardTitle>
          <CardDescription>Manage your sales quotations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.quote_number}</TableCell>
                  <TableCell>{quotation.customer_name}</TableCell>
                  <TableCell>{quotation.quote_date}</TableCell>
                  <TableCell>{quotation.valid_until}</TableCell>
                  <TableCell>₹{quotation.total_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quotation.status)}>
                      {getStatusIcon(quotation.status)}
                      <span className="ml-1">{quotation.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {quotation.status === "Draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendQuotation(quotation.id)}
                          disabled={loading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {quotation.status === "Sent" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => convertToInvoice(quotation.id)}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
