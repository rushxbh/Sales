"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, FileText, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportResult {
  total: number
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

interface ExportOptions {
  format: "csv" | "excel"
  dateRange: "all" | "month" | "quarter" | "year"
  includeInactive: boolean
}

export default function CSVImportExport() {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<string>("")
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    dateRange: "all",
    includeInactive: false,
  })
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const { toast } = useToast()

  const importTypes = [
    { value: "products", label: "Products", description: "Import product catalog with SKU, name, prices, etc." },
    { value: "customers", label: "Customers", description: "Import customer information and contact details" },
    { value: "suppliers", label: "Suppliers", description: "Import supplier information and terms" },
    { value: "inventory", label: "Inventory", description: "Import stock levels and locations" },
    { value: "sales", label: "Sales Data", description: "Import historical sales transactions" },
  ]

  const exportTypes = [
    { value: "products", label: "Products", description: "Export complete product catalog" },
    { value: "customers", label: "Customers", description: "Export customer database" },
    { value: "suppliers", label: "Suppliers", description: "Export supplier information" },
    { value: "inventory", label: "Inventory", description: "Export current stock levels" },
    { value: "sales", label: "Sales Report", description: "Export sales transactions" },
    { value: "purchases", label: "Purchase Report", description: "Export purchase orders" },
    { value: "stock_movements", label: "Stock Movements", description: "Export inventory movements" },
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setImportFile(file)
        setImportResult(null)
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file",
          variant: "destructive",
        })
      }
    }
  }

  const downloadTemplate = (type: string) => {
    const templates: Record<string, string[]> = {
      products: [
        "sku",
        "name",
        "description",
        "category",
        "unit",
        "purchase_price",
        "selling_price",
        "reorder_level",
        "hsn_code",
        "tax_rate",
      ],
      customers: ["name", "contact_person", "phone", "email", "address", "gst_number", "credit_limit", "payment_terms"],
      suppliers: ["name", "contact_person", "phone", "email", "address", "gst_number", "payment_terms"],
      inventory: ["sku", "current_stock", "location"],
      sales: ["invoice_date", "customer_name", "product_sku", "quantity", "unit_price", "discount_percent", "tax_rate"],
    }

    const headers = templates[type] || []
    const csvContent = headers.join(",") + "\n"

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: `${type} template has been downloaded`,
    })
  }

  const processImport = async () => {
    if (!importFile || !importType) {
      toast({
        title: "Missing Information",
        description: "Please select a file and import type",
        variant: "destructive",
      })
      return
    }

    setImporting(true)
    setImportProgress(0)
    setImportResult(null)

    try {
      // Simulate file processing
      const fileContent = await importFile.text()
      const lines = fileContent.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",")
      const dataRows = lines.slice(1)

      let successCount = 0
      let failedCount = 0
      const errors: Array<{ row: number; error: string }> = []

      // Simulate processing each row
      for (let i = 0; i < dataRows.length; i++) {
        setImportProgress(((i + 1) / dataRows.length) * 100)

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 100))

        const row = dataRows[i].split(",")

        // Simulate validation
        if (Math.random() > 0.1) {
          // 90% success rate
          successCount++
        } else {
          failedCount++
          errors.push({
            row: i + 2, // +2 because we start from row 2 (after header)
            error: "Validation failed: Invalid data format",
          })
        }
      }

      const result: ImportResult = {
        total: dataRows.length,
        success: successCount,
        failed: failedCount,
        errors,
      }

      setImportResult(result)

      toast({
        title: "Import Completed",
        description: `${successCount} records imported successfully, ${failedCount} failed`,
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An error occurred while processing the file",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  const processExport = async (type: string) => {
    setExporting(true)

    try {
      // Simulate data export
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock CSV data
      const mockData = generateMockExportData(type)
      const csvContent = mockData.join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_export_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Export Completed",
        description: `${type} data has been exported successfully`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const generateMockExportData = (type: string): string[] => {
    const data: Record<string, string[]> = {
      products: [
        "sku,name,category,unit,selling_price,current_stock",
        "PLY001,Marine Plywood 18mm,Plywood,sheets,2500,45",
        "LAM001,Sunmica Laminate - Walnut,Laminates,sheets,850,12",
        "HW001,Soft Close Hinges,Hardware,pcs,45,8",
      ],
      customers: [
        "name,phone,email,address,gst_number",
        "ABC Furniture,+91-9876543210,abc@furniture.com,123 Main St,GST123456789",
        "XYZ Interiors,+91-9876543211,xyz@interiors.com,456 Oak Ave,GST987654321",
      ],
      sales: [
        "invoice_number,customer_name,invoice_date,total_amount,status",
        "INV001,ABC Furniture,2024-01-15,15750,Paid",
        "INV002,XYZ Interiors,2024-01-14,8900,Pending",
      ],
    }

    return data[type] || ["No data available"]
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>Import / Export</span>
          </h1>
          <p className="text-gray-600">Import and export data in CSV format</p>
        </div>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Import Data</span>
              </CardTitle>
              <CardDescription>Upload CSV files to import data into the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Import Type Selection */}
              <div className="space-y-3">
                <Label>Select Import Type</Label>
                <Select value={importType} onValueChange={setImportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose what to import" />
                  </SelectTrigger>
                  <SelectContent>
                    {importTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {importType && (
                  <p className="text-sm text-gray-600">
                    {importTypes.find((t) => t.value === importType)?.description}
                  </p>
                )}
              </div>

              {/* Template Download */}
              {importType && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium mb-2">Download Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download the CSV template with the correct column headers for {importType}
                  </p>
                  <Button variant="outline" onClick={() => downloadTemplate(importType)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-3">
                <Label>Upload CSV File</Label>
                <Input type="file" accept=".csv" onChange={handleFileSelect} />
                {importFile && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{importFile.name} selected</span>
                  </div>
                )}
              </div>

              {/* Import Progress */}
              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{Math.round(importProgress)}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {/* Import Results */}
              {importResult && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Import Results</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                      <div className="text-sm text-gray-600">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">Errors:</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600 flex items-center space-x-2">
                            <XCircle className="h-3 w-3" />
                            <span>
                              Row {error.row}: {error.error}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Button */}
              <Button onClick={processImport} disabled={!importFile || !importType || importing} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Processing..." : "Start Import"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export Data</span>
              </CardTitle>
              <CardDescription>Export data from the system to CSV files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: "csv" | "excel") => setExportOptions((prev) => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select
                    value={exportOptions.dateRange}
                    onValueChange={(value: "all" | "month" | "quarter" | "year") =>
                      setExportOptions((prev) => ({ ...prev, dateRange: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Export Types */}
              <div className="space-y-3">
                <Label>Available Exports</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exportTypes.map((type) => (
                    <div key={type.value} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{type.label}</h3>
                        <Button size="sm" onClick={() => processExport(type.value)} disabled={exporting}>
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {exporting && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Exporting data...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
