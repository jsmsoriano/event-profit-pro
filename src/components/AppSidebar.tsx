import { Calculator, Users, FileText, Contact, TrendingUp, Settings, Package, BarChart3, Clock, Home, ChefHat, BookOpen, CreditCard, Calendar } from "lucide-react"
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

const clientItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Menu", url: "/menu", icon: ChefHat },
  { title: "Book Event", url: "/book", icon: BookOpen },
  { title: "My Events", url: "/my-events", icon: Calendar },
  { title: "Support", url: "/support", icon: Contact },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Events", url: "/admin/events", icon: Calendar },
  { title: "Clients", url: "/admin/clients", icon: Users },
  { title: "Menu Management", url: "/admin/menu", icon: ChefHat },
  { title: "Staff", url: "/admin/staff", icon: Users },
  { title: "Billing", url: "/admin/billing", icon: CreditCard },
  { title: "Analytics", url: "/admin/analytics", icon: TrendingUp },
];

// Legacy items for existing functionality
const legacyItems = [
  { title: "Event Calculator", url: "/calculator", icon: Calculator },
  { title: "Financial Summary", url: "/financial-summary", icon: TrendingUp },
  { title: "Staff Management", url: "/staff", icon: Users },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reporting", icon: FileText },
  { title: "Team", url: "/team", icon: Clock },
  { title: "Event Info", url: "/quotes", icon: FileText },
  { title: "Contacts", url: "/contacts", icon: Contact },
  { title: "Admin", url: "/admin-old", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar()
  const { role, loading } = useRole()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  // Determine which items to show based on role
  const getItemsForRole = () => {
    if (loading) return [];
    
    if (role === 'client') {
      return clientItems;
    } else if (role && ['owner', 'manager', 'staff', 'accountant'].includes(role)) {
      return adminItems;
    } else {
      // Fallback to legacy items for existing users
      return legacyItems;
    }
  };

  const items = getItemsForRole();
  const sectionLabel = role === 'client' ? 'Client Portal' : 
                      role && ['owner', 'manager', 'staff', 'accountant'].includes(role) ? 'Administration' : 
                      'Event Management';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{sectionLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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