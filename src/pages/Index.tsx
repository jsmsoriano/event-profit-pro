import EventProfitCalculator from "@/components/EventProfitCalculator";

const Index = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profit Analysis</h1>
        <p className="text-muted-foreground">Calculate event profitability and expenses</p>
      </div>
      <EventProfitCalculator />
    </div>
  );
};

export default Index;
