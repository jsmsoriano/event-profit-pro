import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Calendar, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';

export default function Home() {
  const navigate = useNavigate();
  const { role, loading } = useRole();

  // Redirect admin users to admin dashboard
  if (!loading && role === 'admin') {
    navigate('/admin');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const featuredPackages = [
    {
      name: "Executive Lunch",
      description: "Perfect for corporate events and business meetings",
      price: 28,
      minGuests: 10,
      features: ["Appetizer", "Main Course", "Dessert", "Beverages"]
    },
    {
      name: "Wedding Reception",
      description: "Elegant dining experience for your special day",
      price: 65,
      minGuests: 50,
      features: ["Cocktail Hour", "3-Course Meal", "Wedding Cake", "Bar Service"]
    },
    {
      name: "Family Gathering",
      description: "Warm, comforting meals that bring families together",
      price: 35,
      minGuests: 8,
      features: ["Family Style Service", "Kid-Friendly Options", "Dessert Platter"]
    }
  ];

  const stats = [
    { icon: Star, label: "5-Star Rating", value: "4.9/5" },
    { icon: Users, label: "Events Served", value: "2,500+" },
    { icon: Calendar, label: "Years Experience", value: "15+" },
    { icon: ChefHat, label: "Professional Chefs", value: "12" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Exceptional Catering for
              <span className="text-primary block mt-2">Unforgettable Events</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              From intimate gatherings to grand celebrations, we create culinary experiences 
              that delight your guests and make every moment memorable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/book-event')}
                className="text-lg px-8 py-3"
              >
                Book Your Event
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/menu')}
                className="text-lg px-8 py-3"
              >
                View Menu
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Packages
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Carefully crafted packages designed to suit every occasion and budget
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPackages.map((pkg, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <Badge variant="secondary">${pkg.price}/guest</Badge>
                  </div>
                  <p className="text-muted-foreground">{pkg.description}</p>
                  <p className="text-sm text-muted-foreground">Minimum {pkg.minGuests} guests</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/book-event')}
                  >
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Let's discuss your event and create a custom menu that perfectly matches your vision
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/book-event')}
              className="text-lg px-8 py-3"
            >
              Start Planning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}