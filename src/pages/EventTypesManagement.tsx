import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, DollarSign, Calendar } from 'lucide-react';
import { useEventTypes, type EventType } from '@/hooks/useEventTypes';
import { toast } from 'sonner';

interface EventTypeFormData {
  name: string;
  description: string;
  base_price: number;
  is_active: boolean;
}

const initialFormData: EventTypeFormData = {
  name: '',
  description: '',
  base_price: 0,
  is_active: true
};

export default function EventTypesManagement() {
  const { eventTypes, loading, createEventType, updateEventType, deleteEventType, refetch } = useEventTypes();
  const [formData, setFormData] = useState<EventTypeFormData>(initialFormData);
  const [editingEventType, setEditingEventType] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter an event type name');
      return;
    }

    try {
      if (editingEventType) {
        await updateEventType(editingEventType, formData);
      } else {
        await createEventType(formData);
      }
      
      handleCloseDialog();
      refetch();
    } catch (error) {
      toast.error('Failed to save event type');
    }
  };

  const handleEdit = (eventType: EventType) => {
    setFormData({
      name: eventType.name,
      description: eventType.description || '',
      base_price: eventType.base_price,
      is_active: eventType.is_active
    });
    setEditingEventType(eventType.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (eventTypeId: string) => {
    if (!confirm('Are you sure you want to deactivate this event type?')) {
      return;
    }
    
    try {
      await deleteEventType(eventTypeId);
      refetch();
    } catch (error) {
      toast.error('Failed to deactivate event type');
    }
  };

  const handleCloseDialog = () => {
    setFormData(initialFormData);
    setEditingEventType(null);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: keyof EventTypeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading event types...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Types Management</h1>
          <p className="text-muted-foreground">Manage your event categories like hibachi and catering</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEventType ? 'Edit Event Type' : 'Add New Event Type'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Type Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Hibachi, Catering, Wedding"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this event type"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_price}
                    onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEventType ? 'Update' : 'Create'} Event Type
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Event Types List */}
      <div className="grid gap-4">
        {eventTypes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Event Types</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first event type to categorize your events
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          eventTypes.map((eventType) => (
            <Card key={eventType.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{eventType.name}</h3>
                      {eventType.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    {eventType.description && (
                      <p className="text-muted-foreground text-sm mb-3">
                        {eventType.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Base Price: ${eventType.base_price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(eventType)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(eventType.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}