import React from 'react';
import { AISearchBox } from '@/components/search/AISearchBox';
import { DocumentProcessor } from '@/components/upload/DocumentProcessor';
import { useDocuments } from '@/hooks/useDocuments';

const Documents: React.FC = () => {
  const { documents, loading, refetch } = useDocuments();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold">Document Management System</h1>
          <p className="text-muted-foreground">Manage and search your documents with AI</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold">Total Documents</h3>
            <p className="text-2xl font-bold">{documents.length}</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold">Recent Uploads</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold">Shared Documents</h3>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>

        {/* AI Search */}
        <AISearchBox />

        {/* Document Processing Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Document Processing & OCR</h3>
          <div className="grid gap-4">
            {documents.slice(0, 5).map((doc) => (
              <DocumentProcessor 
                key={doc.id} 
                document={doc} 
                onUpdate={refetch}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;