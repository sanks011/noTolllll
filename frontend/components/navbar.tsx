"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, User, LogOut, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

const getUserInitials = (contactPerson?: string, email?: string): string => {
  if (contactPerson) {
    return contactPerson.split(' ').map(word => word[0]?.toUpperCase() || '').join('').slice(0, 2)
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return 'U'
}

export function Navbar({ showAuth = true }: { showAuth?: boolean }) {
  const { user, signout, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    signout()
    router.push('/')
  }

  const getDashboardUrl = () => {
    if (!user) return '/dashboard'
    
    if (user.isAdmin) return '/dashboard/admin'
    if (user.role === 'Buyer') return '/dashboard/buyer'
    if (user.role === 'Seller') return '/dashboard/seller'
    return '/dashboard'
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-lg font-bold">noToll</div>
                <div className="text-xs text-muted-foreground">Export Facilitation Platform</div>
              </div>
            </div>
          </Link>

          {showAuth && (
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {loading ? (
                // Show loading state during auth check
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                </div>
              ) : user ? (
                <>
                  <Button asChild variant="outline" size="sm" className="font-medium">
                    <Link href={getDashboardUrl()}>Dashboard</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" alt={user.contactPerson || user.email} />
                          <AvatarFallback>{getUserInitials(user.contactPerson, user.email)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.contactPerson || user.email}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.role || (user.userType === "buyer" ? "Buyer" : user.userType === "seller" ? "Seller" : "Administrator")}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href={getDashboardUrl()}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Button asChild size="sm" className="font-medium">
                    <Link href="/auth/signup">Register Now</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
