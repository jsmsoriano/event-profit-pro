import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Mail, MapPin } from "lucide-react"

const contacts = [
  {
    id: 1,
    name: "Alex Rodriguez",
    company: "Tech Corp Inc.",
    role: "Event Coordinator",
    email: "alex@techcorp.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    type: "client",
    lastContact: "2024-01-15"
  },
  {
    id: 2,
    name: "Maria Garcia",
    company: "Catering Plus",
    role: "Manager",
    email: "maria@cateringplus.com",
    phone: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
    type: "vendor",
    lastContact: "2024-01-12"
  },
  {
    id: 3,
    name: "John Smith",
    company: "Smith Family",
    role: "Client",
    email: "john@email.com",
    phone: "+1 (555) 345-6789",
    location: "Chicago, IL",
    type: "client",
    lastContact: "2024-01-10"
  }
]

const Contacts = () => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'default'
      case 'vendor': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">Manage clients, vendors, and partners</p>
        </div>
        <Button className="btn-primary">Add Contact</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <Card key={contact.id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <Badge variant={getTypeColor(contact.type)}>
                      {contact.type}
                    </Badge>
                  </div>
                  <CardDescription>{contact.company}</CardDescription>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{contact.location}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Last contact: {new Date(contact.lastContact).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Contacts