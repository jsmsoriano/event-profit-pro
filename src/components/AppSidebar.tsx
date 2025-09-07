import { Calculator, Users, FileText, Contact, TrendingUp, Settings, BarChart3, Clock, Home, ChefHat, BookOpen, CreditCard, CalendarDays, Calendar } from "lucide-react"
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

// Admin navigation items
const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Events", url: "/admin/events", icon: CalendarDays },
  { title: "Clients", url: "/admin/clients", icon: Users },
  { title: "Menu Management", url: "/admin/menu", icon: ChefHat },
  { title: "Billing", url: "/admin/billing", icon: CreditCard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Event Calculator", url: "/breakeven-analysis", icon: Calculator },
  { title: "Staff Management", url: "/staff-management", icon: Users },
  { title: "Admin Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Admin Features */}
        <SidebarGroup>
          <SidebarGroupLabel>Business Management</SidebarGroupLabel>
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
      </SidebarContent>
    </Sidebar>
  )
}