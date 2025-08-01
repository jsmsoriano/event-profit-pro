import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const teamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Event Manager",
    email: "sarah@company.com",
    status: "active",
    events: 12
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Coordinator",
    email: "mike@company.com",
    status: "active",
    events: 8
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Logistics",
    email: "emily@company.com",
    status: "busy",
    events: 15
  }
]

const Team = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team</h1>
        <p className="text-muted-foreground">Manage your event team members</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Events</span>
                <span className="font-medium">{member.events}</span>
              </div>
              <div className="text-sm text-muted-foreground">{member.email}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Team