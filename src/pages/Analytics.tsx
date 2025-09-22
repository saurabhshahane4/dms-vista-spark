import { useState } from "react";
import { BarChart3, TrendingUp, Shield, Users, FileText, Clock, Eye, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const performanceData = [
  { subject: 'Processing Speed', A: 120 },
  { subject: 'Efficiency', A: 98 },
  { subject: 'Compliance', A: 86 },
  { subject: 'User Satisfaction', A: 99 },
  { subject: 'Cost Reduction', A: 85 },
  { subject: 'ROI', A: 65 }
];

const forecastData = [
  { month: 'Jul', actual: 120, predicted: 450 },
  { month: 'Aug', actual: 98, predicted: 460 },
  { month: 'Sep', actual: 86, predicted: 440 },
  { month: 'Oct', actual: 99, predicted: 480 },
  { month: 'Nov', actual: 85, predicted: 490 },
  { month: 'Dec', actual: 65, predicted: 500 }
];

const insights = [
  {
    impact: "High Impact",
    confidence: "94% confidence",
    title: "Document processing efficiency increased by 34% this quarter",
    description: "Scale AI processing to handle 50% more volume",
    impactColor: "bg-blue-600"
  },
  {
    impact: "Medium Impact", 
    confidence: "87% confidence",
    title: "Legal department shows highest document retention compliance",
    description: "Apply legal best practices to other departments",
    impactColor: "bg-pink-500"
  },
  {
    impact: "High Impact",
    confidence: "91% confidence", 
    title: "Peak usage occurs between 9-11 AM, causing system slowdowns",
    description: "Implement load balancing during peak hours",
    impactColor: "bg-blue-600"
  }
];

const Analytics = () => {
  const [activeSubTab, setActiveSubTab] = useState("executive");
  const [timeRange, setTimeRange] = useState("30 Days");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-dms-purple rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Premium Analytics</h2>
            <p className="text-sm text-muted-foreground">Comprehensive insights and analytics for your document system</p>
          </div>
        </div>
      </div>

      {/* Executive Dashboard */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Executive Analytics Dashboard
            </h3>
            <p className="text-muted-foreground">Real-time business intelligence and predictive insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              {timeRange}
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <Badge variant="secondary" className="text-green-600 bg-green-100">+65%</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System ROI</p>
              <p className="text-2xl font-bold text-foreground">245%</p>
              <p className="text-xs text-muted-foreground">Annual return on investment</p>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <Badge variant="secondary" className="text-blue-600 bg-blue-100">+2.5%</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <p className="text-2xl font-bold text-foreground">98.7%</p>
              <p className="text-xs text-muted-foreground">Regulatory compliance rate</p>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <Badge variant="secondary" className="text-purple-600 bg-purple-100">+12%</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Efficiency</p>
              <p className="text-2xl font-bold text-foreground">89%</p>
              <p className="text-xs text-muted-foreground">AI processing accuracy</p>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <Badge variant="secondary" className="text-orange-600 bg-orange-100">+18%</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost Savings</p>
              <p className="text-2xl font-bold text-foreground">$2.4M</p>
              <p className="text-xs text-muted-foreground">Annual operational savings</p>
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-lg font-semibold text-foreground flex items-center gap-2">
                12,847 
                <Badge className="bg-green-100 text-green-800">+15%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Total Documents</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-lg font-semibold text-foreground flex items-center gap-2">
                1,234 
                <Badge className="bg-green-100 text-green-800">+8%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-lg font-semibold text-foreground flex items-center gap-2">
                23 
                <Badge className="bg-red-100 text-red-800">-19%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Pending Approvals</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-lg font-semibold text-foreground flex items-center gap-2">
                156 
                <Badge className="bg-green-100 text-green-800">+23%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Processed Today</p>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="executive">Executive</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Performance Matrix */}
              <Card className="p-6 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  <h4 className="text-md font-semibold text-foreground">Business Performance Matrix</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Key performance indicators vs targets</p>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={performanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" className="text-xs" />
                      <PolarRadiusAxis angle={90} domain={[0, 150]} className="text-xs" />
                      <Radar 
                        name="Performance" 
                        dataKey="A" 
                        stroke="hsl(var(--dms-blue))" 
                        fill="hsl(var(--dms-blue))" 
                        fillOpacity={0.3} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Risk Assessment */}
              <Card className="p-6 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <h4 className="text-md font-semibold text-foreground">Risk Assessment Dashboard</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-6">System security and compliance risks</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Security</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">Low</Badge>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Compliance</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">Low</Badge>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Data Quality</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-pink-500 text-white">Medium</Badge>
                        <span className="text-sm font-medium">76%</span>
                      </div>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">System Performance</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">Low</Badge>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">User Adoption</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-pink-500 text-white">Medium</Badge>
                        <span className="text-sm font-medium">82%</span>
                      </div>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Backup & Recovery</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">Low</Badge>
                        <span className="text-sm font-medium">96%</span>
                      </div>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Predictive Analytics */}
            <Card className="p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <h4 className="text-md font-semibold text-foreground">Predictive Analytics & Forecasting</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-6">AI-powered predictions for next 6 months</p>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--dms-purple))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--dms-purple))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="hsl(var(--dms-blue))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(var(--dms-blue))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* AI Insights */}
            <Card className="p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                <h4 className="text-md font-semibold text-foreground">AI-Generated Business Insights</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Automated insights and recommendations</p>
              
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 border border-border/30 rounded-lg bg-muted/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${insight.impactColor} text-white`}>
                          {insight.impact}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{insight.confidence}</span>
                      </div>
                    </div>
                    <h5 className="font-medium text-foreground mb-2">{insight.title}</h5>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6 mt-6">
            {/* Predictive Analytics */}
            <Card className="p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <h4 className="text-md font-semibold text-foreground">Predictive Analytics & Forecasting</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-6">AI-powered predictions for next 6 months</p>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--dms-purple))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--dms-purple))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="hsl(var(--dms-blue))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(var(--dms-blue))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* AI Insights */}
            <Card className="p-6 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                <h4 className="text-md font-semibold text-foreground">AI-Generated Business Insights</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Automated insights and recommendations</p>
              
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 border border-border/30 rounded-lg bg-muted/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${insight.impactColor} text-white`}>
                          {insight.impact}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{insight.confidence}</span>
                      </div>
                    </div>
                    <h5 className="font-medium text-foreground mb-2">{insight.title}</h5>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Placeholder tabs */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">System Overview</h3>
              <p className="text-muted-foreground">Comprehensive system overview and metrics.</p>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 mt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Document Analytics</h3>
              <p className="text-muted-foreground">Detailed document usage and performance metrics.</p>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">User Analytics</h3>
              <p className="text-muted-foreground">User activity, adoption, and engagement metrics.</p>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6 mt-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Compliance Analytics</h3>
              <p className="text-muted-foreground">Regulatory compliance tracking and reporting.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;