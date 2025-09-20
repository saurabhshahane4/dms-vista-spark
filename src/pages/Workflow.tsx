import { useState } from "react";
import { Search, Filter, Clock, User, Eye, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const workflowData = [
  {
    id: "DOC-2024-001",
    title: "Contract Agreement - Q1 2024",
    assignee: "Ahmed Hassan",
    dueDate: "2024-01-20",
    currentStep: "Legal Review",
    stepAssignee: "Sarah Johnson",
    priority: "high",
    status: "pending"
  },
  {
    id: "DOC-2024-002", 
    title: "Financial Report Q4 2023",
    assignee: "Maria Garcia",
    dueDate: "2024-01-18",
    currentStep: "Financial Review",
    stepAssignee: "John Smith",
    priority: "medium",
    status: "in-review"
  },
  {
    id: "DOC-2024-003",
    title: "Employee Policy Update",
    assignee: "Lisa Chen",
    dueDate: "2024-01-25",
    currentStep: "HR Review",
    stepAssignee: "David Wilson",
    priority: "low",
    status: "approved"
  }
];

const Workflow = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in-review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredWorkflows = workflowData.filter(workflow => {
    const matchesSearch = workflow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || workflow.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Workflow Management</h2>
            <p className="text-sm text-muted-foreground">Manage document approval workflows</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Workflow Management</h3>
          <p className="text-muted-foreground mb-6">Manage document approval workflows</p>

          {/* Filters */}
          <Card className="p-4 border border-border/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filters</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Workflow Items */}
        <div className="space-y-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="p-6 border border-border/50 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-foreground">{workflow.title}</h4>
                      <span className="text-sm text-muted-foreground font-mono">{workflow.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{workflow.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Due: {formatDate(workflow.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge className={getPriorityVariant(workflow.priority)}>
                      {workflow.priority}
                    </Badge>
                    <Badge className={getStatusVariant(workflow.status)}>
                      {workflow.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Current Step */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Current Step: {workflow.currentStep}</p>
                      <p className="text-sm text-muted-foreground">Assigned to: {workflow.stepAssignee}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {workflow.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No workflows found</h3>
            <p className="text-muted-foreground">No workflows match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workflow;