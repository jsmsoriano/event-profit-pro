import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"

const quotes = [
  {
    id: 1,
    title: "Corporate Annual Gala",
    client: "Tech Corp Inc.",
    amount: 45000,
    status: "pending",
    date: "2024-01-15",
    validUntil: "2024-02-15"
  },
  {
    id: 2,
    title: "Wedding Reception",
    client: "Smith Family",
    amount: 28000,
    status: "approved",
    date: "2024-01-10",
    validUntil: "2024-02-10"
  },
  {
    id: 3,
    title: "Product Launch Event",
    client: "StartupXYZ",
    amount: 35000,
    status: "draft",
    date: "2024-01-20",
    validUntil: "2024-02-20"
  }
]

const Quotes = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'pending': return 'secondary'
      case 'draft': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotes</h1>
          <p className="text-muted-foreground">Manage event quotes and proposals</p>
        </div>
        <Button className="btn-primary">Create Quote</Button>
      </div>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{quote.title}</CardTitle>
                  <CardDescription className="text-base">{quote.client}</CardDescription>
                </div>
                <Badge variant={getStatusColor(quote.status)}>
                  {quote.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold">${quote.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(quote.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">{new Date(quote.validUntil).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Quotes