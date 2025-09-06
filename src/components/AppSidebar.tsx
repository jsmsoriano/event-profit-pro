import { Calculator, Users, FileText, Contact, TrendingUp, Settings, Package, BarChart3, Clock, Home, ChefHat, BookOpen, CreditCard, CalendarDays, Calendar } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useRole } from "@/hooks/useRole"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Customer-facing navigation items - only for customers
const customerItems = [
  { title: "Menu", url: "/menu", icon: ChefHat },
  { title: "Book Event", url: "/book-event", icon: BookOpen },
  { title: "Support", url: "/support", icon: Contact },
];

// Admin navigation items - everything else for admins
const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Events", url: "/admin/events", icon: CalendarDays },
  { title: "Create Event", url: "/admin/events/new", icon: Calendar },
  { title: "Clients", url: "/admin/clients", icon: Users },
  { title: "Menu Management", url: "/admin/menu", icon: ChefHat },
  { title: "Billing", url: "/admin/billing", icon: CreditCard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Event Calculator", url: "/breakeven-analysis", icon: Calculator },
  { title: "Staff Management", url: "/staff-management", icon: Users },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Admin Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar()
  const { role, loading } = useRole()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  // Show loading state
  if (loading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }

  // Determine sections to show based on role
  const isCustomer = role === 'customer'
  const isAdmin = role === 'admin'

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Customer features - visible to customers only */}
        {isCustomer && !isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Customer Portal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {customerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin view - Customer Features section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Customer Features</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {customerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin view - Admin Features section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin Features</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Fallback section for users without defined roles */}
        {!isCustomer && !isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Event Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}