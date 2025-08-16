import QuoteCalculator from "@/components/QuoteCalculator"

const Quotes = () => {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Event Quote Calculator</h1>
        <p className="text-muted-foreground">Generate custom quotes for your events</p>
      </div>

      <QuoteCalculator />
    </div>
  )
}

export default Quotes