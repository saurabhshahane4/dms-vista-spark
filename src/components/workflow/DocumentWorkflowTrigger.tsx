import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkflow } from '@/hooks/useWorkflow';
import { toast } from 'sonner';

interface DocumentWorkflowTrigger {
  id: string;
  user_id: string;
  workflow_id: string;
  trigger_event: string;
  conditions: any;
  is_active: boolean;
  created_at: string;
  workflow?: {
    name: string;
    description: string;
  };
}

const triggerEvents = [
  { value: 'upload', label: 'Document Upload' },
  { value: 'update', label: 'Document Update' },
  { value: 'move', label: 'Document Move' },
  { value: 'delete', label: 'Document Delete' },
  { value: 'approve', label: 'Document Approve' },
  { value: 'reject', label: 'Document Reject' }
];

export const DocumentWorkflowTrigger = () => {
  const { user } = useAuth();
  const { workflows } = useWorkflow();
  const [triggers, setTriggers] = useState<DocumentWorkflowTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTrigger, setNewTrigger] = useState({
    workflow_id: '',
    trigger_event: '',
    conditions: {},
    is_active: true
  });

  const fetchTriggers = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('document_workflow_triggers')
        .select(`
          *,
          workflows:workflow_id (
            name,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTriggers(data || []);
    } catch (error) {
      console.error('Error fetching document workflow triggers:', error);
      toast.error('Failed to fetch workflow triggers');
    } finally {
      setLoading(false);
    }
  };

  const createTrigger = async () => {
    if (!user?.id || !newTrigger.workflow_id || !newTrigger.trigger_event) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('document_workflow_triggers')
        .insert({
          user_id: user.id,
          workflow_id: newTrigger.workflow_id,
          trigger_event: newTrigger.trigger_event,
          conditions: newTrigger.conditions,
          is_active: newTrigger.is_active
        });

      if (error) throw error;

      toast.success('Workflow trigger created successfully');
      setNewTrigger({
        workflow_id: '',
        trigger_event: '',
        conditions: {},
        is_active: true
      });
      await fetchTriggers();
    } catch (error) {
      console.error('Error creating workflow trigger:', error);
      toast.error('Failed to create workflow trigger');
    }
  };

  const toggleTrigger = async (triggerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('document_workflow_triggers')
        .update({ is_active: isActive })
        .eq('id', triggerId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTriggers(prev => 
        prev.map(trigger => 
          trigger.id === triggerId 
            ? { ...trigger, is_active: isActive }
            : trigger
        )
      );
      
      toast.success(`Workflow trigger ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating workflow trigger:', error);
      toast.error('Failed to update workflow trigger');
    }
  };

  const deleteTrigger = async (triggerId: string) => {
    try {
      const { error } = await supabase
        .from('document_workflow_triggers')
        .delete()
        .eq('id', triggerId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTriggers(prev => prev.filter(trigger => trigger.id !== triggerId));
      toast.success('Workflow trigger deleted');
    } catch (error) {
      console.error('Error deleting workflow trigger:', error);
      toast.error('Failed to delete workflow trigger');
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Create New Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Create Document Workflow Trigger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="workflow">Workflow</Label>
              <Select
                value={newTrigger.workflow_id}
                onValueChange={(value) => setNewTrigger(prev => ({ ...prev, workflow_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="trigger">Trigger Event</Label>
              <Select
                value={newTrigger.trigger_event}
                onValueChange={(value) => setNewTrigger(prev => ({ ...prev, trigger_event: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger event" />
                </SelectTrigger>
                <SelectContent>
                  {triggerEvents.map((event) => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={createTrigger} 
                className="w-full gap-2"
                disabled={!newTrigger.workflow_id || !newTrigger.trigger_event}
              >
                <Plus className="h-4 w-4" />
                Create Trigger
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Active Document Workflow Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : triggers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No workflow triggers configured yet
            </p>
          ) : (
            <div className="space-y-4">
              {triggers.map((trigger) => (
                <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{trigger.workflow?.name || 'Unknown Workflow'}</h4>
                      <Badge variant={trigger.is_active ? 'default' : 'secondary'}>
                        {trigger.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Triggers on: <strong>{triggerEvents.find(e => e.value === trigger.trigger_event)?.label}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trigger.workflow?.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`trigger-${trigger.id}`} className="text-sm">
                        {trigger.is_active ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id={`trigger-${trigger.id}`}
                        checked={trigger.is_active}
                        onCheckedChange={(checked) => toggleTrigger(trigger.id, checked)}
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTrigger(trigger.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};