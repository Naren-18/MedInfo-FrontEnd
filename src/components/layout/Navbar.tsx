import { Link, useNavigate } from "react-router-dom"
import { HeartPulse, LayoutDashboard, LogOut, Menu, QrCode, User, Users } from "lucide-react"
import * as React from "react"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Medical Profile", icon: User },
  { to: "/contacts", label: "Emergency Contacts", icon: Users },
  { to: "/emergency-card", label: "Emergency Card", icon: QrCode },
]

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  function handleLogout() {
    logout()
    // Explicitly "/login", not "/" — logging out from a page nested under
    // ProtectedRoute causes it to redirect to "/login" the instant
    // isAuthenticated flips false, which can race an explicit navigate("/")
    // and win. Targeting "/login" directly makes the destination
    // deterministic instead of depending on that race.
    navigate("/login")
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-primary">
          <HeartPulse className="h-6 w-6" />
          <span>MedInfo</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Button key={link.to} variant="ghost" size="sm" asChild>
                <Link to={link.to} className="flex items-center gap-1.5">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    {user?.sub ?? "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="opacity-100">
                    Signed in as <span className="ml-1 font-medium">{user?.sub}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && mobileOpen && (
        <nav className="border-t border-border md:hidden">
          <div className="container flex flex-col gap-1 py-2">
            {NAV_LINKS.map((link) => (
              <Button
                key={link.to}
                variant="ghost"
                size="sm"
                asChild
                className="justify-start"
                onClick={() => setMobileOpen(false)}
              >
                <Link to={link.to} className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </nav>
      )}
    </header>
  )
}
