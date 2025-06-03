"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, RefreshCw, Download, Upload, Shield, Bell, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Setting {
  key: string
  value: string
  description: string
  type: "text" | "number" | "boolean" | "select"
  options?: string[]
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock settings data
  const mockSettings: Setting[] = [
    // Company Settings
    {
      key: "company_name",
      value: "Your Company Name",
      description: "Company name for invoices and reports",
      type: "text",
    },
    {
      key: "company_address",
      value: "Your Company Address",
      description: "Company address for invoices",
      type: "text",
    },
    { key: "company_phone", value: "+91-XXXXXXXXXX", description: "Company phone number", type: "text" },
    { key: "company_email", value: "info@company.com", description: "Company email address", type: "text" },
    { key: "gst_number", value: "GSTIN123456789", description: "Company GST registration number", type: "text" },

    // Tax Settings
    { key: "default_tax_rate", value: "18.00", description: "Default tax rate percentage", type: "number" },
    { key: "tax_inclusive", value: "false", description: "Include tax in product prices", type: "boolean" },

    // Invoice Settings
    { key: "invoice_prefix", value: "INV", description: "Invoice number prefix", type: "text" },
    { key: "invoice_start_number", value: "1", description: "Starting invoice number", type: "number" },
    { key: "payment_terms", value: "30", description: "Default payment terms (days)", type: "number" },

    // Inventory Settings
    { key: "low_stock_alert", value: "true", description: "Enable low stock alerts", type: "boolean" },
    { key: "auto_reorder", value: "false", description: "Automatic reorder when stock is low", type: "boolean" },
    {
      key: "stock_valuation",
      value: "FIFO",
      description: "Stock valuation method",
      type: "select",
      options: ["FIFO", "LIFO", "Average"],
    },

    // Backup Settings
    {
      key: "backup_frequency",
      value: "daily",
      description: "Automatic backup frequency",
      type: "select",
      options: ["daily", "weekly", "monthly"],
    },
    { key: "backup_retention", value: "30", description: "Number of backups to retain", type: "number" },

    // Notification Settings
    { key: "email_notifications", value: "true", description: "Enable email notifications", type: "boolean" },
    { key: "sms_notifications", value: "false", description: "Enable SMS notifications", type: "boolean" },

    // Print Settings
    { key: "default_printer", value: "Default", description: "Default printer for invoices", type: "text" },
    { key: "print_copies", value: "2", description: "Number of copies to print", type: "number" },
    { key: "auto_print", value: "false", description: "Auto-print invoices after creation", type: "boolean" },
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // In real app, load from database
      setSettings(mockSettings)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value } : setting)))
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // In real app, save to database
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "All settings have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = async () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      setSettings(mockSettings)
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values",
      })
    }
  }

  const exportSettings = () => {
    const settingsData = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>,
    )

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "settings.json"
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Settings Exported",
      description: "Settings have been exported to settings.json",
    })
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)

        setSettings((prev) =>
          prev.map((setting) => ({
            ...setting,
            value: importedSettings[setting.key] || setting.value,
          })),
        )

        toast({
          title: "Settings Imported",
          description: "Settings have been imported successfully",
        })
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Invalid settings file format",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case "boolean":
        return (
          <Switch
            checked={setting.value === "true"}
            onCheckedChange={(checked) => updateSetting(setting.key, checked.toString())}
          />
        )

      case "select":
        return (
          <Select value={setting.value} onValueChange={(value) => updateSetting(setting.key, value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "number":
        return (
          <Input type="number" value={setting.value} onChange={(e) => updateSetting(setting.key, e.target.value)} />
        )

      default:
        return <Input value={setting.value} onChange={(e) => updateSetting(setting.key, e.target.value)} />
    }
  }

  const groupedSettings = {
    company: settings.filter((s) => s.key.startsWith("company_") || s.key === "gst_number"),
    tax: settings.filter((s) => s.key.includes("tax") || s.key === "payment_terms"),
    invoice: settings.filter((s) => s.key.startsWith("invoice_")),
    inventory: settings.filter(
      (s) => s.key.includes("stock") || s.key.includes("reorder") || s.key === "stock_valuation",
    ),
    backup: settings.filter((s) => s.key.startsWith("backup_")),
    notifications: settings.filter((s) => s.key.includes("notification")),
    print: settings.filter((s) => s.key.includes("print") || s.key === "default_printer"),
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </h1>
          <p className="text-gray-600">Configure application settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="tax">Tax & Finance</TabsTrigger>
          <TabsTrigger value="invoice">Invoicing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="print">Printing</TabsTrigger>
        </TabsList>

        {Object.entries(groupedSettings).map(([group, groupSettings]) => (
          <TabsContent key={group} value={group} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize flex items-center space-x-2">
                  {group === "company" && <Shield className="h-5 w-5" />}
                  {group === "notifications" && <Bell className="h-5 w-5" />}
                  {group === "print" && <Printer className="h-5 w-5" />}
                  <span>{group} Settings</span>
                </CardTitle>
                <CardDescription>Configure {group} related settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {groupSettings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={setting.key} className="text-sm font-medium">
                        {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      {setting.type === "boolean" && (
                        <Badge variant={setting.value === "true" ? "default" : "secondary"}>
                          {setting.value === "true" ? "Enabled" : "Disabled"}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-2">{renderSettingInput(setting)}</div>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
