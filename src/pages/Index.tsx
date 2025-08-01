import EventProfitCalculator from "@/components/EventProfitCalculator";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Event Profit Calculator
          </h1>
          <EventProfitCalculator />
        </div>
      </div>
    </div>
  );
};

export default Index;
