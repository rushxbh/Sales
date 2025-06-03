"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Download, Settings, Play } from "lucide-react"

export default function InstallationGuide() {
  const steps = [
    {
      title: "Prerequisites",
      icon: <Settings className="h-5 w-5" />,
      items: [
        "Node.js 18+ installed",
        "npm or yarn package manager",
        "Git for version control",
        "Code editor (VS Code recommended)",
      ],
    },
    {
      title: "Download & Setup",
      icon: <Download className="h-5 w-5" />,
      items: [
        "Clone or download the project",
        "Extract to desired location",
        "Open terminal in project directory",
        "Install dependencies",
      ],
    },
    {
      title: "Configuration",
      icon: <Settings className="h-5 w-5" />,
      items: [
        "Configure database settings",
        "Set up environment variables",
        "Initialize database schema",
        "Configure application settings",
      ],
    },
    {
      title: "Launch Application",
      icon: <Play className="h-5 w-5" />,
      items: ["Start the development server", "Build for production", "Package as desktop app", "Create installer"],
    },
  ]

  const commands = {
    install: [
      "# Clone the repository",
      "git clone https://github.com/your-repo/sales-inventory-app.git",
      "",
      "# Navigate to project directory",
      "cd sales-inventory-app",
      "",
      "# Install dependencies",
      "npm install",
      "",
      "# or using yarn",
      "yarn install",
    ],
    database: [
      "# Initialize SQLite database",
      "npm run db:init",
      "",
      "# Run database migrations",
      "npm run db:migrate",
      "",
      "# Seed initial data (optional)",
      "npm run db:seed",
      "",
      "# Create admin user",
      "npm run create-admin",
    ],
    development: [
      "# Start development server",
      "npm run dev",
      "",
      "# Start Electron app in development",
      "npm run electron:dev",
      "",
      "# Run tests",
      "npm test",
      "",
      "# Type checking",
      "npm run type-check",
    ],
    production: [
      "# Build for production",
      "npm run build",
      "",
      "# Package Electron app",
      "npm run electron:pack",
      "",
      "# Create installer",
      "npm run electron:dist",
      "",
      "# Build for specific platform",
      "npm run electron:dist:win",
      "npm run electron:dist:mac",
      "npm run electron:dist:linux",
    ],
  }

  const fileStructure = [
    { path: "src/", description: "Source code directory" },
    { path: "├── main/", description: "Electron main process" },
    { path: "├── renderer/", description: "React frontend code" },
    { path: "├── database/", description: "Database models and migrations" },
    { path: "├── components/", description: "Reusable React components" },
    { path: "├── pages/", description: "Application pages/screens" },
    { path: "├── utils/", description: "Utility functions and helpers" },
    { path: "├── types/", description: "TypeScript type definitions" },
    { path: "├── assets/", description: "Static assets (images, icons)" },
    { path: "public/", description: "Public assets and HTML template" },
    { path: "dist/", description: "Built application files" },
    { path: "build/", description: "Electron build output" },
    { path: "package.json", description: "Project dependencies and scripts" },
    { path: "electron.js", description: "Electron main process entry" },
    { path: "tsconfig.json", description: "TypeScript configuration" },
    { path: "webpack.config.js", description: "Webpack build configuration" },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Installation Guide</h1>
        <p className="text-gray-600">Step-by-step guide to set up the Sales & Inventory Management System</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="structure">File Structure</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {step.icon}
                    <span>
                      Step {index + 1}: {step.title}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">System Requirements</CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Minimum Requirements:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Windows 10/11, macOS 10.14+, or Linux</li>
                    <li>• 4GB RAM</li>
                    <li>• 500MB disk space</li>
                    <li>• Node.js 18.0+</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommended:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 8GB+ RAM</li>
                    <li>• SSD storage</li>
                    <li>• Node.js 20.0+</li>
                    <li>• Modern web browser</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge variant="outline">1</Badge>
                  <span>Installation Commands</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {commands.install.join("\n")}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge variant="outline">2</Badge>
                  <span>Database Setup</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {commands.database.join("\n")}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge variant="outline">3</Badge>
                  <span>Development Commands</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {commands.development.join("\n")}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge variant="outline">4</Badge>
                  <span>Production Build</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {commands.production.join("\n")}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project File Structure</CardTitle>
              <CardDescription>Overview of the project directory structure and key files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fileStructure.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <code className="font-mono text-sm text-blue-600">{item.path}</code>
                    <span className="text-sm text-gray-600">{item.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">package.json</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {`{
  "name": "sales-inventory-app",
  "version": "1.0.0",
  "main": "electron.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "electron:dev": "electron .",
    "electron:pack": "electron-builder",
    "electron:dist": "electron-builder --publish=never"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "electron": "^27.0.0",
    "sqlite3": "^5.1.0",
    "sequelize": "^6.35.0"
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">electron-builder configuration</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {`{
  "appId": "com.company.sales-inventory",
  "productName": "Sales & Inventory Management",
  "directories": {
    "output": "dist"
  },
  "files": [
    "build/**/*",
    "node_modules/**/*"
  ],
  "win": {
    "target": "nsis",
    "icon": "assets/icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "assets/icon.icns"
  },
  "linux": {
    "target": "AppImage",
    "icon": "assets/icon.png"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-red-400 pl-4">
                <h4 className="font-semibold text-red-800">Node.js Version Issues</h4>
                <p className="text-sm text-red-700 mt-1">
                  If you encounter compatibility issues, ensure you're using Node.js 18 or higher.
                </p>
                <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm mt-2 block">node --version</code>
              </div>

              <div className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-semibold text-yellow-800">SQLite Database Errors</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Database file permissions or corruption issues can be resolved by reinitializing.
                </p>
                <code className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm mt-2 block">
                  rm database.sqlite && npm run db:init
                </code>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-semibold text-blue-800">Electron Build Issues</h4>
                <p className="text-sm text-blue-700 mt-1">Clear build cache and rebuild if Electron packaging fails.</p>
                <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-2 block">
                  npm run clean && npm run build && npm run electron:pack
                </code>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-semibold text-green-800">Port Already in Use</h4>
                <p className="text-sm text-green-700 mt-1">Change the default port if 3000 is already occupied.</p>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mt-2 block">
                  PORT=3001 npm run dev
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Help</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">Documentation</Badge>
                  <span className="text-sm">Check the README.md file for detailed instructions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">Issues</Badge>
                  <span className="text-sm">Report bugs on the GitHub issues page</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">Support</Badge>
                  <span className="text-sm">Contact support team for technical assistance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
