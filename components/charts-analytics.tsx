"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from "lucide-react"

interface ChartData {
  name: string
  value: number
  change?: number
}

interface AnalyticsProps {
  salesData: ChartData[]
  inventoryData: ChartData[]
  customerData: ChartData[]
  profitData: ChartData[]
}

export default function ChartsAnalytics({ salesData, inventoryData, customerData, profitData }: AnalyticsProps) {
  const renderBarChart = (data: ChartData[], color = "bg-blue-500") => {
    const maxValue = Math.max(...data.map((d) => d.value))

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm font-medium truncate">{item.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${color}`} style={{ width: `${(item.value / maxValue) * 100}%` }} />
            </div>
            <div className="w-16 text-sm text-right">₹{item.value.toLocaleString()}</div>
            {item.change !== undefined && (
              <div className={`flex items-center space-x-1 ${item.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {item.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="text-xs">{Math.abs(item.change)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderLineChart = (data: ChartData[]) => {
    const maxValue = Math.max(...data.map((d) => d.value))
    const points = data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * 300
        const y = 100 - (item.value / maxValue) * 80
        return `${x},${y}`
      })
      .join(" ")

    return (
      <div className="relative">
        <svg width="300" height="120" className="border rounded">
          <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 300
            const y = 100 - (item.value / maxValue) * 80
            return <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6" />
          })}
        </svg>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index}>{item.name}</span>
          ))}
        </div>
      </div>
    )
  }

  const renderPieChart = (data: ChartData[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]

    return (
      <div className="flex items-center space-x-4">
        <svg width="120" height="120">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const angle = (item.value / total) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle

            const x1 = 60 + 50 * Math.cos((startAngle * Math.PI) / 180)
            const y1 = 60 + 50 * Math.sin((startAngle * Math.PI) / 180)
            const x2 = 60 + 50 * Math.cos((endAngle * Math.PI) / 180)
            const y2 = 60 + 50 * Math.sin((endAngle * Math.PI) / 180)

            const largeArcFlag = angle > 180 ? 1 : 0

            const pathData = [`M 60 60`, `L ${x1} ${y1}`, `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`, "Z"].join(" ")

            currentAngle += angle

            return <path key={index} d={pathData} fill={colors[index % colors.length]} stroke="white" strokeWidth="2" />
          })}
        </svg>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-sm">{item.name}</span>
              <span className="text-sm font-medium">₹{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Sales Trend</span>
          </CardTitle>
          <CardDescription>Monthly sales performance</CardDescription>
        </CardHeader>
        <CardContent>{renderLineChart(salesData)}</CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Top Products</span>
          </CardTitle>
          <CardDescription>Best selling products by revenue</CardDescription>
        </CardHeader>
        <CardContent>{renderBarChart(inventoryData, "bg-green-500")}</CardContent>
      </Card>

      {/* Customer Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Customer Analysis</span>
          </CardTitle>
          <CardDescription>Top customers by purchase value</CardDescription>
        </CardHeader>
        <CardContent>{renderBarChart(customerData, "bg-purple-500")}</CardContent>
      </Card>

      {/* Profit Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Profit by Category</span>
          </CardTitle>
          <CardDescription>Profit distribution across product categories</CardDescription>
        </CardHeader>
        <CardContent>{renderPieChart(profitData)}</CardContent>
      </Card>
    </div>
  )
}
