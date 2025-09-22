import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  MessageSquare,
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { toast } from 'sonner';

export const ApprovalDashboard = () => {
  const { 
    pendingApprovals, 
    myRequests, 
    approveRequest, 
    rejectRequest,
    createSampleData,
    loading 
  } = useWorkflow();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (requestId: string, comments: string) => {
    setIsProcessing(true);
    try {
      await approveRequest(requestId, comments);
      toast.success('Request approved successfully');
      setSelectedRequest(null);
      setComments('');
    } catch (error) {
      toast.error('Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId: string, comments: string) => {
    setIsProcessing(true);
    try {
      await rejectRequest(requestId, comments);
      toast.success('Request rejected');
      setSelectedRequest(null);
      setComments('');
    } catch (error) {
      toast.error('Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPendingApprovals = pendingApprovals.filter(request => {
    const matchesSearch = searchQuery === '' || 
      request.workflow_instance_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Approvals ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="requests">My Requests ({myRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search approval requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pending Approvals List */}
          <div className="space-y-4">
            {filteredPendingApprovals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No pending approvals</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || priorityFilter !== 'all' 
                      ? 'No approvals match your current filters' 
                      : 'All caught up! No approvals waiting for your action.'}
                  </p>
                  {(!searchQuery && priorityFilter === 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={createSampleData}
                      disabled={loading}
                    >
                      Create Sample Data
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredPendingApprovals.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Approval Request #{request.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Workflow Instance: {request.workflow_instance_id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityVariant(request.priority)} className="gap-1">
                          {getPriorityIcon(request.priority)}
                          {request.priority}
                        </Badge>
                        <Badge variant="outline">Level {request.approval_level}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Requested:</span>
                          <br />
                          {formatDate(request.created_at)}
                        </div>
                        {request.due_date && (
                          <div>
                            <span className="font-medium text-muted-foreground">Due:</span>
                            <br />
                            {formatDate(request.due_date)}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Approval Request Details</DialogTitle>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-4">
                                  <div>
                                    <Label>Request ID</Label>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.id}</p>
                                  </div>
                                  <div>
                                    <Label>Workflow Instance</Label>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.workflow_instance_id}</p>
                                  </div>
                                  <div>
                                    <Label>Priority</Label>
                                    <Badge variant={getPriorityVariant(selectedRequest.priority)}>
                                      {selectedRequest.priority}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label htmlFor="comments">Comments</Label>
                                    <Textarea
                                      id="comments"
                                      placeholder="Add your comments (optional)"
                                      value={comments}
                                      onChange={(e) => setComments(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      className="flex-1 gap-2"
                                      onClick={() => handleApprove(selectedRequest.id, comments)}
                                      disabled={isProcessing}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      className="flex-1 gap-2"
                                      onClick={() => handleReject(selectedRequest.id, comments)}
                                      disabled={isProcessing}
                                    >
                                      <XCircle className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => {
                              setSelectedRequest(request);
                              handleApprove(request.id, '');
                            }}
                            disabled={isProcessing}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Quick Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => {
                              setSelectedRequest(request);
                              const reason = prompt('Reason for rejection:');
                              if (reason !== null) {
                                handleReject(request.id, reason);
                              }
                            }}
                            disabled={isProcessing}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {/* My Requests */}
          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No requests found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any approval requests yet.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={createSampleData}
                    disabled={loading}
                  >
                    Create Sample Data
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Request #{request.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Workflow: {request.workflow_instance_id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(request.status)}>
                          {request.status}
                        </Badge>
                        <Badge variant={getPriorityVariant(request.priority)}>
                          {request.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Submitted:</span>
                          <br />
                          {formatDate(request.created_at)}
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Level:</span>
                          <br />
                          {request.approval_level}
                        </div>
                      </div>
                      {request.comments && (
                        <div>
                          <span className="font-medium text-muted-foreground">Comments:</span>
                          <p className="text-sm mt-1">{request.comments}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};