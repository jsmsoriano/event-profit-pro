import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calculator } from "lucide-react"

interface Protein {
  name: string
  upcharge: number
}

const proteins: Protein[] = [
  { name: "Shrimp", upcharge: 0 },
  { name: "Chicken", upcharge: 0 },
  { name: "Steak", upcharge: 0 },
  { name: "Filet Mignon", upcharge: 7 },
  { name: "Scallops", upcharge: 5 }
]

const QuoteCalculator = () => {
  const [adultGuests, setAdultGuests] = useState(0)
  const [childGuests, setChildGuests] = useState(0)
  const [selectedProteins, setSelectedProteins] = useState<string[]>([])
  const [gratuity, setGratuity] = useState(20)
  
  const adultPlatePrice = 60
  const childPlatePrice = 30

  const handleProteinToggle = (proteinName: string) => {
    setSelectedProteins(prev => {
      if (prev.includes(proteinName)) {
        return prev.filter(p => p !== proteinName)
      } else if (prev.length < 2) {
        return [...prev, proteinName]
      }
      return prev
    })
  }

  const getProteinUpcharge = () => {
    return selectedProteins.reduce((total, proteinName) => {
      const protein = proteins.find(p => p.name === proteinName)
      return total + (protein?.upcharge || 0)
    }, 0)
  }

  const calculateSubtotal = () => {
    const proteinUpcharge = getProteinUpcharge()
    const adultTotal = adultGuests * (adultPlatePrice + proteinUpcharge)
    const childTotal = childGuests * (childPlatePrice + proteinUpcharge)
    return adultTotal + childTotal
  }

  const calculateGratuityAmount = () => {
    return (calculateSubtotal() * gratuity) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGratuityAmount()
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Event Quote Calculator</CardTitle>
          </div>
          <CardDescription>
            Enter event details to generate a custom quote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Guest Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adults">Number of Adult Guests</Label>
              <Input
                id="adults"
                type="number"
                min="0"
                value={adultGuests || ''}
                onChange={(e) => setAdultGuests(Number(e.target.value) || 0)}
                placeholder="Enter adult count"
              />
              <p className="text-sm text-muted-foreground">${adultPlatePrice} per plate</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Number of Children (Under 12)</Label>
              <Input
                id="children"
                type="number"
                min="0"
                value={childGuests || ''}
                onChange={(e) => setChildGuests(Number(e.target.value) || 0)}
                placeholder="Enter children count"
              />
              <p className="text-sm text-muted-foreground">${childPlatePrice} per plate</p>
            </div>
          </div>

          {/* Protein Selection */}
          <div className="space-y-3">
            <Label>Select 2 Proteins</Label>
            <p className="text-sm text-muted-foreground">
              Choose up to 2 protein options for your event
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {proteins.map((protein) => (
                <div
                  key={protein.name}
                  className={`flex items-center space-x-3 p-3 rounded-md border transition-colors ${
                    selectedProteins.includes(protein.name)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <Checkbox
                    id={protein.name}
                    checked={selectedProteins.includes(protein.name)}
                    onCheckedChange={() => handleProteinToggle(protein.name)}
                    disabled={
                      !selectedProteins.includes(protein.name) && selectedProteins.length >= 2
                    }
                  />
                  <Label
                    htmlFor={protein.name}
                    className="flex-1 flex justify-between items-center cursor-pointer"
                  >
                    <span>{protein.name}</span>
                    {protein.upcharge > 0 && (
                      <Badge variant="secondary">+${protein.upcharge}</Badge>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            {selectedProteins.length === 2 && (
              <p className="text-sm text-green-600">✓ Two proteins selected</p>
            )}
          </div>

          {/* Gratuity */}
          <div className="space-y-2">
            <Label htmlFor="gratuity">Gratuity (%)</Label>
            <Input
              id="gratuity"
              type="number"
              min="0"
              max="100"
              value={gratuity}
              onChange={(e) => setGratuity(Number(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quote Summary */}
      {(adultGuests > 0 || childGuests > 0) && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Adult Guests ({adultGuests})</span>
                <span>${(adultGuests * (adultPlatePrice + getProteinUpcharge())).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Children Guests ({childGuests})</span>
                <span>${(childGuests * (childPlatePrice + getProteinUpcharge())).toLocaleString()}</span>
              </div>
              {getProteinUpcharge() > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Protein upcharge per plate</span>
                  <span>+${getProteinUpcharge()}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gratuity ({gratuity}%)</span>
                  <span>${calculateGratuityAmount().toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedProteins.length > 0 && (
              <div className="pt-2">
                <Label className="text-sm">Selected Proteins:</Label>
                <div className="flex gap-2 mt-1">
                  {selectedProteins.map((protein) => (
                    <Badge key={protein} variant="outline">
                      {protein}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" size="lg">
              Generate Formal Quote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default QuoteCalculator