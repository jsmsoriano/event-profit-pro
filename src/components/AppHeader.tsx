import { Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationBell } from "./NotificationBell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useRole } from "@/hooks/useRole"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { role, loading } = useRole();

  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    // Try to get name from user metadata
    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
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
        <NotificationBell />
        
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
          <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 sm:h-10 px-2 sm:px-3 gap-2 hover:bg-accent">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs sm:text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium">{getUserDisplayName()}</span>
                {!loading && role && (
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    {role}
                  </Badge>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background border border-border z-50">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
                {!loading && role && (
                  <Badge variant="outline" className="text-xs w-fit">
                    {role}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}