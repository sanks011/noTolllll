"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Globe,
  Home,
  TrendingUp,
  Users,
  Shield,
  Gift,
  MessageSquare,
  Trophy,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  FileText,
  Target,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardLayoutProps {
  children: React.ReactNode
  userType?: "buyer" | "seller" | "admin"
}

const buyerNavItems = [
  { name: "Dashboard", href: "/dashboard/buyer", icon: Home },
  { name: "Market Intelligence", href: "/market-intelligence", icon: TrendingUp },
  { name: "Find Suppliers", href: "/buyers", icon: Users },
  { name: "Compliance Center", href: "/compliance", icon: Shield },
  { name: "Relief Schemes", href: "/relief-schemes", icon: Gift },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Success Stories", href: "/success-stories", icon: Trophy },
  { name: "Impact Tracker", href: "/impact-tracker", icon: BarChart3 },
]

const sellerNavItems = [
  { name: "Dashboard", href: "/dashboard/seller", icon: Home },
  { name: "Market Intelligence", href: "/market-intelligence", icon: TrendingUp },
  { name: "Find Buyers", href: "/buyers", icon: Users },
  { name: "Pitch Assistant", href: "/pitch-assistant", icon: FileText },
  { name: "Compliance Center", href: "/compliance", icon: Shield },
  { name: "Relief Schemes", href: "/relief-schemes", icon: Gift },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Success Stories", href: "/success-stories", icon: Trophy },
  { name: "Impact Tracker", href: "/impact-tracker", icon: BarChart3 },
]

const adminNavItems = [
  { name: "Dashboard", href: "/dashboard/admin", icon: Home },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Data Management", href: "/admin/data", icon: BarChart3 },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
]

export default function DashboardLayout({ children, userType = "buyer" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, signout } = useAuth()

  const navItems = userType === "buyer" ? buyerNavItems : 
                   userType === "seller" ? sellerNavItems : 
                   adminNavItems

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-primary" />
          <span className="font-bold">TradeNavigator</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>{getUserInitials(user?.contactPerson, user?.email)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.contactPerson || user?.email || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role || (userType === "buyer" ? "Buyer" : userType === "seller" ? "Seller" : "Administrator")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center border-b bg-card px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
          </Sheet>

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block">
                <h2 className="text-lg font-semibold">
                  {userType === "buyer" ? "Buyer Dashboard" : userType === "seller" ? "Seller Dashboard" : "Admin Dashboard"}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>{getUserInitials(user?.contactPerson, user?.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.contactPerson || user?.email || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
