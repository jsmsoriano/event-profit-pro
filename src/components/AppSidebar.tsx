import { Calculator, Users, FileText, Contact, TrendingUp, Settings, Package, BarChart3, Clock, Home, ChefHat, BookOpen, CreditCard, CalendarDays } from "lucide-react"
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

// Customer-facing navigation items
const customerItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Menu", url: "/menu", icon: ChefHat },
  { title: "Book Event", url: "/book", icon: BookOpen },
  { title: "My Events", url: "/my-events", icon: CalendarDays },
  { title: "Support", url: "/support", icon: Contact },
];

// Admin/Backend navigation items - management focused
const adminItems = [
  { title: "Admin Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Event Management", url: "/admin/events", icon: CalendarDays },
  { title: "Client Management", url: "/admin/clients", icon: Users },
  { title: "Staff Management", url: "/staff", icon: Users },
  { title: "Inventory Management", url: "/inventory", icon: Package },
  { title: "Financial Reports", url: "/financial-summary", icon: TrendingUp },
  { title: "Analytics & Reports", url: "/analytics", icon: BarChart3 },
  { title: "Event Calculator", url: "/calculator", icon: Calculator },
];

// Additional admin tools
const adminToolsItems = [
  { title: "Quote Management", url: "/quotes", icon: FileText },
  { title: "Team Settings", url: "/team", icon: Clock },
  { title: "System Reports", url: "/reporting", icon: FileText },
  { title: "Admin Settings", url: "/admin-old", icon: Settings },
  { title: "Role Testing", url: "/role-test", icon: Settings },
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
  const isCustomer = role === 'client'
  const isAdmin = role && ['owner', 'manager', 'staff', 'accountant'].includes(role)

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Customer-only section */}
        {isCustomer && (
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

        {/* Admin sections - only visible to admin users */}
        {isAdmin && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
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

            <SidebarGroup>
              <SidebarGroupLabel>Admin Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminToolsItems.map((item) => (
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
          </>
        )}

        {/* Fallback section for users without defined roles */}
        {!isCustomer && !isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Event Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[...customerItems, ...adminItems, ...adminToolsItems].map((item) => (
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