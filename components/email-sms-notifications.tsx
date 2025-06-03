"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MessageSquare, Send, Settings, Bell, Clock, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationTemplate {
  id: string
  name: string
  type: "email" | "sms"
  subject?: string
  message: string
  trigger: string
  enabled: boolean
}

interface NotificationLog {
  id: string
  type: "email" | "sms"
  recipient: string
  subject?: string
  message: string
  status: "sent" | "failed" | "pending"
  timestamp: string
  error?: string
}

export default function EmailSMSNotifications() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [emailSettings, setEmailSettings] = useState({
    smtp_host: "",
    smtp_port: "587",
    smtp_username: "",
    smtp_password: "",
    from_email: "",
    from_name: "",
  })
  const [smsSettings, setSmsSettings] = useState({
    provider: "twilio",
    api_key: "",
    api_secret: "",
    from_number: "",
  })
  const [testRecipient, setTestRecipient] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock data
  const mockTemplates: NotificationTemplate[] = [
    {
      id: "1",
      name: "Low Stock Alert",
      type: "email",
      subject: "Low Stock Alert - {{product_name}}",
      message:
        "Product {{product_name}} (SKU: {{sku}}) is running low. Current stock: {{current_stock}}. Reorder level: {{reorder_level}}.",
      trigger: "low_stock",
      enabled: true,
    },
    {
      id: "2",
      name: "Invoice Created",
      type: "email",
      subject: "Invoice {{invoice_number}} - {{company_name}}",
      message:
        "Dear {{customer_name}}, your invoice {{invoice_number}} for ₹{{total_amount}} has been created. Due date: {{due_date}}.",
      trigger: "invoice_created",
      enabled: true,
    },
    {
      id: "3",
      name: "Payment Reminder",
      type: "sms",
      message:
        "Payment reminder: Invoice {{invoice_number}} for ₹{{total_amount}} is due on {{due_date}}. Please make payment to avoid late fees.",
      trigger: "payment_due",
      enabled: false,
    },
    {
      id: "4",
      name: "Payment Received",
      type: "email",
      subject: "Payment Received - {{invoice_number}}",
      message: "Thank you! We have received your payment of ₹{{payment_amount}} for invoice {{invoice_number}}.",
      trigger: "payment_received",
      enabled: true,
    },
  ]

  const mockLogs: NotificationLog[] = [
    {
      id: "1",
      type: "email",
      recipient: "customer@example.com",
      subject: "Invoice INV001 - Your Company",
      message: "Dear Customer, your invoice INV001 for ₹15,750 has been created.",
      status: "sent",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      type: "sms",
      recipient: "+91-9876543210",
      message: "Low stock alert: Marine Plywood 18mm is running low (5 sheets remaining).",
      status: "failed",
      timestamp: "2024-01-15T09:15:00Z",
      error: "Invalid phone number format",
    },
    {
      id: "3",
      type: "email",
      recipient: "admin@company.com",
      subject: "Low Stock Alert - Marine Plywood 18mm",
      message: "Product Marine Plywood 18mm is running low. Current stock: 5 sheets.",
      status: "sent",
      timestamp: "2024-01-15T08:45:00Z",
    },
  ]

  useEffect(() => {
    setTemplates(mockTemplates)
    setLogs(mockLogs)
  }, [])

  const sendTestEmail = async () => {
    if (!testRecipient) {
      toast({
        title: "Error",
        description: "Please enter a test recipient",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${testRecipient}`,
      })

      // Add to logs
      const newLog: NotificationLog = {
        id: Date.now().toString(),
        type: "email",
        recipient: testRecipient,
        subject: "Test Email - Sales & Inventory System",
        message: "This is a test email from your Sales & Inventory Management System.",
        status: "sent",
        timestamp: new Date().toISOString(),
      }
      setLogs((prev) => [newLog, ...prev])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendTestSMS = async () => {
    if (!testRecipient) {
      toast({
        title: "Error",
        description: "Please enter a test recipient",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Test SMS Sent",
        description: `Test SMS sent to ${testRecipient}`,
      })

      // Add to logs
      const newLog: NotificationLog = {
        id: Date.now().toString(),
        type: "sms",
        recipient: testRecipient,
        message: "Test SMS from Sales & Inventory System. System is working correctly.",
        status: "sent",
        timestamp: new Date().toISOString(),
      }
      setLogs((prev) => [newLog, ...prev])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test SMS",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((template) => (template.id === id ? { ...template, enabled: !template.enabled } : template)),
    )
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated",
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <span>Notifications</span>
          </h1>
          <p className="text-gray-600">Configure email and SMS notifications</p>
        </div>
        <Button onClick={saveSettings} disabled={loading}>
          <Settings className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
          <TabsTrigger value="sms">SMS Settings</TabsTrigger>
          <TabsTrigger value="logs">Notification Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Configure automated notification templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {template.type === "email" ? (
                        <Mail className="h-5 w-5 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-500">Trigger: {template.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={template.enabled ? "default" : "secondary"}>
                        {template.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch checked={template.enabled} onCheckedChange={() => toggleTemplate(template.id)} />
                    </div>
                  </div>

                  {template.subject && (
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Message</Label>
                    <p className="text-sm text-gray-600 mt-1">{template.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    placeholder="smtp.gmail.com"
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtp_host: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    placeholder="587"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtp_port: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="your-email@gmail.com"
                    value={emailSettings.smtp_username}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtp_username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="App password"
                    value={emailSettings.smtp_password}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, smtp_password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    placeholder="noreply@company.com"
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, from_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    placeholder="Your Company Name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings((prev) => ({ ...prev, from_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Test Email</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="test@example.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={sendTestEmail} disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Configuration</CardTitle>
              <CardDescription>Configure SMS provider settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SMS Provider</Label>
                <Select
                  value={smsSettings.provider}
                  onValueChange={(value) => setSmsSettings((prev) => ({ ...prev, provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="textlocal">TextLocal</SelectItem>
                    <SelectItem value="msg91">MSG91</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    placeholder="Your API key"
                    value={smsSettings.api_key}
                    onChange={(e) => setSmsSettings((prev) => ({ ...prev, api_key: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    placeholder="Your API secret"
                    value={smsSettings.api_secret}
                    onChange={(e) => setSmsSettings((prev) => ({ ...prev, api_secret: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>From Number</Label>
                <Input
                  placeholder="+1234567890"
                  value={smsSettings.from_number}
                  onChange={(e) => setSmsSettings((prev) => ({ ...prev, from_number: e.target.value }))}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Test SMS</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="+91-9876543210"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={sendTestSMS} disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Logs</CardTitle>
              <CardDescription>View sent notifications and delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {log.type === "email" ? (
                          <Mail className="h-4 w-4 text-blue-500" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium">{log.recipient}</span>
                        <Badge
                          variant={
                            log.status === "sent" ? "default" : log.status === "failed" ? "destructive" : "secondary"
                          }
                        >
                          {log.status === "sent" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {log.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                          {log.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {log.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>

                    {log.subject && <p className="text-sm font-medium mb-1">{log.subject}</p>}

                    <p className="text-sm text-gray-600 mb-2">{log.message}</p>

                    {log.error && <p className="text-sm text-red-600">Error: {log.error}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
