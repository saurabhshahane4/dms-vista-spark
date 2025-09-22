import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Camera, Filter, Download, Eye, Move, MoreHorizontal, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigation } from '@/contexts/NavigationContext';
import BarcodeSearchBar from '@/components/search/BarcodeSearchBar';
import SearchFilters from '@/components/search/SearchFilters';
import DocumentAccordion from '@/components/search/DocumentAccordion';
import { useDocuments } from '@/hooks/useDocuments';

const DocumentLookup = () => {
  const { setActiveTab } = useNavigation();
  const { documents, loading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [hasActiveSearch, setHasActiveSearch] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState(documents);

  // Mock data for dashboard stats
  const quickStats = {
    totalDocuments: documents?.length || 0,
    documentsToday: 3,
    pendingApprovals: 5,
    retentionDue: 12
  };

  const recentFiles = documents?.slice(0, 5) || [];
  const mostAccessedFiles = documents?.slice(0, 8) || [];

  useEffect(() => {
    // Filter documents based on search query and barcode
      if (searchQuery || barcodeInput || Object.keys(activeFilters).length > 0) {
        setHasActiveSearch(true);
        let filtered = documents || [];

        if (searchQuery) {
          filtered = filtered.filter(doc => 
            doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

      if (barcodeInput) {
        filtered = filtered.filter(doc => 
          doc.id?.includes(barcodeInput) ||
          doc.name?.includes(barcodeInput)
        );
      }

      setFilteredDocuments(filtered);
    } else {
      setHasActiveSearch(false);
      setFilteredDocuments(documents || []);
    }
  }, [searchQuery, barcodeInput, activeFilters, documents]);

  const handleBarcodeSearch = (barcode: string) => {
    setBarcodeInput(barcode);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveTab('Documents')}
                className="hover:bg-accent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documents
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Document Lookup & Search</h1>
                <p className="text-sm text-muted-foreground">
                  Search documents by barcode, text, or advanced filters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="space-y-4">
            {/* Primary Search */}
            <div className="flex gap-4">
              <BarcodeSearchBar 
                onBarcodeSearch={handleBarcodeSearch}
                placeholder="Scan or enter barcode..."
              />
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search documents, content, or metadata..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filter Controls */}
            <SearchFilters 
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {!hasActiveSearch ? (
          // Default Dashboard
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Documents</p>
                      <p className="text-2xl font-semibold">{quickStats.totalDocuments}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Uploaded Today</p>
                      <p className="text-2xl font-semibold text-green-600">{quickStats.documentsToday}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Approvals</p>
                      <p className="text-2xl font-semibold text-orange-600">{quickStats.pendingApprovals}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Retention Due</p>
                      <p className="text-2xl font-semibold text-red-600">{quickStats.retentionDue}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Files */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentFiles.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {doc.category || doc.department || 'General'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Most Accessed */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Accessed Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mostAccessedFiles.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {doc.category || doc.department || 'General'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Search Results
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Found {filteredDocuments.length} result{filteredDocuments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </div>
            </div>

            {/* Document Accordion List */}
            <DocumentAccordion documents={filteredDocuments} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLookup;