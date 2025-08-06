import { Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-background px-3 sm:px-4 sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <SidebarTrigger className="shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-xs sm:text-sm">E</span>
          </div>
          <h1 className="text-sm sm:text-lg font-semibold text-foreground hidden sm:block truncate">
            Event Manager
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
          <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}