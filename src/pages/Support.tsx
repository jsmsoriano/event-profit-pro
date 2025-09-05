import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Clock, MessageCircle, HelpCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function Support() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here would be the API call to submit the contact form
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    {
      question: "How far in advance should I book my event?",
      answer: "We recommend booking at least 2-3 weeks in advance for smaller events (under 50 guests) and 4-6 weeks for larger events. However, we understand that sometimes events come up on short notice, so don't hesitate to contact us even if your event is just a few days away!"
    },
    {
      question: "Can you accommodate dietary restrictions?",
      answer: "Absolutely! We specialize in accommodating various dietary needs including vegetarian, vegan, gluten-free, nut-free, and other specific dietary restrictions. Please let us know about any dietary requirements when booking, and we'll work with you to create a menu that everyone can enjoy."
    },
    {
      question: "What's included in your catering packages?",
      answer: "Our packages typically include food preparation, serving staff, table setup, basic tableware, and cleanup. Additional services like linens, upgraded tableware, bartending, and decorations can be added for an additional fee. Each package can be customized to meet your specific needs."
    },
    {
      question: "Do you provide staff for events?",
      answer: "Yes! Depending on your event size and needs, we can provide professional servers, bartenders, and event coordinators. Our staff is experienced in creating exceptional service experiences for your guests."
    },
    {
      question: "What happens if I need to change my guest count?",
      answer: "We understand that guest counts can change! You can update your guest count up to 72 hours before your event without any penalty. For changes within 72 hours, we'll do our best to accommodate, though some fees may apply depending on the circumstances."
    },
    {
      question: "Do you handle events outside your normal service area?",
      answer: "We primarily serve the local metropolitan area, but we do consider events outside our normal service area for larger events. Additional travel fees may apply. Contact us with your event details and location, and we'll let you know if we can accommodate your event."
    },
    {
      question: "What's your cancellation policy?",
      answer: "Cancellations made more than 7 days before the event receive a full refund minus a small processing fee. Cancellations within 7 days may be subject to a cancellation fee depending on the circumstances. We understand that life happens and try to be as flexible as possible with our clients."
    },
    {
      question: "Can I taste the food before my event?",
      answer: "Yes! We offer tasting appointments for larger events (50+ guests) or for clients planning multiple events. There's a small fee for tastings that goes toward your final bill if you book with us. Contact us to schedule your tasting appointment."
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">How Can We Help?</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're here to make your event planning experience as smooth as possible. 
          Find answers to common questions or get in touch with our team.
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle>Call Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <p className="text-2xl font-semibold">(555) 123-FOOD</p>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Mon-Fri: 9AM-6PM
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Sat-Sun: 10AM-4PM
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle>Email Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <p className="font-semibold">events@catering.com</p>
            <Badge variant="secondary" className="text-xs">
              24 hour response time
            </Badge>
            <p className="text-sm text-muted-foreground">
              For detailed inquiries and custom quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle>Live Chat</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <Button className="w-full">
              Start Chat
            </Button>
            <p className="text-sm text-muted-foreground">
              Get instant answers from our team
            </p>
            <Badge variant="outline" className="text-xs">
              Available during business hours
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Send Us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Wedding catering inquiry"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your event, any questions you have, or how we can help..."
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contact */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Day-of-Event Emergency Contact</h3>
            <p className="text-muted-foreground mb-3">
              For urgent matters on the day of your event, call our emergency line:
            </p>
            <div className="text-2xl font-bold text-primary">(555) 911-CHEF</div>
            <p className="text-sm text-muted-foreground mt-2">
              Available 24/7 for events in progress
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}