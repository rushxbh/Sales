"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Edit, Trash2, Shield, Eye, EyeOff, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: "Admin" | "Sales" | "Inventory" | "Viewer"
  is_active: boolean
  last_login?: string
  created_at: string
}

interface UserFormData {
  username: string
  full_name: string
  email: string
  role: string
  password: string
  confirmPassword: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [userForm, setUserForm] = useState<UserFormData>({
    username: "",
    full_name: "",
    email: "",
    role: "Sales",
    password: "",
    confirmPassword: "",
  })
  const { toast } = useToast()

  // Mock users data
  const mockUsers: User[] = [
    {
      id: 1,
      username: "admin",
      full_name: "System Administrator",
      email: "admin@company.com",
      role: "Admin",
      is_active: true,
      last_login: "2024-01-15T10:30:00Z",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      username: "sales_manager",
      full_name: "Sales Manager",
      email: "sales@company.com",
      role: "Sales",
      is_active: true,
      last_login: "2024-01-15T09:15:00Z",
      created_at: "2024-01-02T00:00:00Z",
    },
    {
      id: 3,
      username: "inventory_clerk",
      full_name: "Inventory Clerk",
      email: "inventory@company.com",
      role: "Inventory",
      is_active: true,
      last_login: "2024-01-14T16:45:00Z",
      created_at: "2024-01-03T00:00:00Z",
    },
    {
      id: 4,
      username: "viewer_user",
      full_name: "Report Viewer",
      email: "viewer@company.com",
      role: "Viewer",
      is_active: false,
      created_at: "2024-01-04T00:00:00Z",
    },
  ]

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // In real app, load from Electron backend
      // const users = await window.electronAPI.auth.getUsers()
      setUsers(mockUsers)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userForm.password !== userForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (userForm.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // In real app, call Electron backend
      // const result = await window.electronAPI.auth.createUser(userForm)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
        id: Date.now(),
        username: userForm.username,
        full_name: userForm.full_name,
        email: userForm.email,
        role: userForm.role as any,
        is_active: true,
        created_at: new Date().toISOString(),
      }

      setUsers((prev) => [...prev, newUser])
      setShowCreateDialog(false)
      setUserForm({
        username: "",
        full_name: "",
        email: "",
        role: "Sales",
        password: "",
        confirmPassword: "",
      })

      toast({
        title: "Success",
        description: "User created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (user: User) => {
    setLoading(true)
    try {
      // In real app, call Electron backend
      // const result = await window.electronAPI.auth.updateUser(user)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
      setEditingUser(null)

      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const updatedUser = { ...user, is_active: !user.is_active }
    await handleUpdateUser(updatedUser)
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    setLoading(true)
    try {
      // In real app, call Electron backend
      // await window.electronAPI.auth.deleteUser(userId)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUsers((prev) => prev.filter((u) => u.id !== userId))

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (userId: number) => {
    const newPassword = prompt("Enter new password (minimum 6 characters):")
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // In real app, call Electron backend
      // await window.electronAPI.auth.resetPassword(userId, newPassword)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Password reset successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800"
      case "Sales":
        return "bg-blue-100 text-blue-800"
      case "Inventory":
        return "bg-green-100 text-green-800"
      case "Viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRolePermissions = (role: string) => {
    const permissions: Record<string, string[]> = {
      Admin: ["Full system access", "User management", "Settings", "Reports", "Backup/Restore"],
      Sales: ["Create invoices", "Manage customers", "View reports", "Process payments"],
      Inventory: ["Manage products", "Update stock", "View inventory reports", "Manage suppliers"],
      Viewer: ["View reports", "View data (read-only)"],
    }
    return permissions[role] || []
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span>User Management</span>
          </h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={userForm.username}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={userForm.full_name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={userForm.password}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={userForm.confirmPassword}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">@{user.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                        disabled={loading}
                      />
                      <span className={user.is_active ? "text-green-600" : "text-gray-500"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.last_login ? (
                      <span className="text-sm">{new Date(user.last_login).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => resetPassword(user.id)}>
                        <Key className="h-4 w-4" />
                      </Button>
                      {user.username !== "admin" && (
                        <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Role Permissions</span>
          </CardTitle>
          <CardDescription>Overview of permissions for each role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Admin", "Sales", "Inventory", "Viewer"].map((role) => (
              <div key={role} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleBadgeColor(role)}>{role}</Badge>
                </div>
                <div className="space-y-1">
                  {getRolePermissions(role).map((permission, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, full_name: e.target.value } : null))}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser((prev) => (prev ? { ...prev, role: value as any } : null))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => handleUpdateUser(editingUser)} disabled={loading} className="flex-1">
                  {loading ? "Updating..." : "Update User"}
                </Button>
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
