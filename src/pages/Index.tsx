import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import EventProfitCalculator from "@/components/EventProfitCalculator";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Event Profit Calculator
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email}
            </p>
          </div>
          <Button 
            onClick={signOut}
            variant="outline"
            className="btn-secondary"
          >
            Sign Out
          </Button>
        </div>
        <EventProfitCalculator />
      </div>
    </div>
  );
};

export default Index;
