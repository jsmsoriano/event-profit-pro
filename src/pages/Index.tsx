import EventProfitCalculator from "@/components/EventProfitCalculator";

const Index = () => {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Event Profit Calculator
        </h1>
        <EventProfitCalculator />
      </div>
    </div>
  );
};

export default Index;
