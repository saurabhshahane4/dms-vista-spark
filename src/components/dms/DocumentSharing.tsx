import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Share2, Copy, Mail, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentSharingProps {
  documentId: string;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentShare {
  id: string;
  shared_with_email: string;
  permission_level: 'view' | 'edit';
  share_token: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export const DocumentSharing = ({ documentId, documentName, isOpen, onClose }: DocumentSharingProps) => {
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [emailToShare, setEmailToShare] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'edit'>('view');
  const [expiresAt, setExpiresAt] = useState("");
  const [hasExpiration, setHasExpiration] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && documentId) {
      fetchShares();
    }
  }, [isOpen, documentId]);

  const fetchShares = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_shares')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShares((data || []) as DocumentShare[]);
    } catch (error) {
      console.error('Error fetching shares:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sharing information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const shareDocument = async () => {
    if (!emailToShare.trim() || !user) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    setSharing(true);
    try {
      // Generate share token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_share_token');

      if (tokenError) throw tokenError;

      const shareData = {
        document_id: documentId,
        shared_by: user.id,
        shared_with_email: emailToShare,
        permission_level: permissionLevel,
        share_token: tokenData,
        expires_at: hasExpiration && expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: true
      };

      const { error: shareError } = await supabase
        .from('document_shares')
        .insert(shareData);

      if (shareError) throw shareError;

      toast({
        title: 'Success',
        description: `Document shared with ${emailToShare}`
      });

      // Reset form
      setEmailToShare("");
      setPermissionLevel('view');
      setExpiresAt("");
      setHasExpiration(false);
      fetchShares();
    } catch (error) {
      console.error('Error sharing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to share document',
        variant: 'destructive'
      });
    } finally {
      setSharing(false);
    }
  };

  const copyShareLink = async (shareToken: string) => {
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Success',
      description: 'Share link copied to clipboard'
    });
  };

  const revokeShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('document_shares')
        .update({ is_active: false })
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Share access revoked'
      });

      fetchShares();
    } catch (error) {
      console.error('Error revoking share:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke share',
        variant: 'destructive'
      });
    }
  };

  const sendEmailInvite = async (share: DocumentShare) => {
    const shareUrl = `${window.location.origin}/shared/${share.share_token}`;
    const subject = `Document shared: ${documentName}`;
    const body = `A document has been shared with you.\n\nDocument: ${documentName}\nAccess Level: ${share.permission_level}\n\nView document: ${shareUrl}`;
    
    const mailtoUrl = `mailto:${share.shared_with_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Document: {documentName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Form */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <h3 className="font-medium text-foreground">Share with someone</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={emailToShare}
                  onChange={(e) => setEmailToShare(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="permission">Permission Level</Label>
                <Select value={permissionLevel} onValueChange={(value: 'view' | 'edit') => setPermissionLevel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="expiration"
                checked={hasExpiration}
                onCheckedChange={setHasExpiration}
              />
              <Label htmlFor="expiration">Set expiration date</Label>
            </div>
            
            {hasExpiration && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expires-at">Expires At</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
            )}
            
            <Button
              onClick={shareDocument}
              disabled={sharing}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              {sharing ? 'Sharing...' : 'Share Document'}
            </Button>
          </div>

          {/* Active Shares */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Active Shares</h3>
            
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : shares.filter(share => share.is_active).length > 0 ? (
                <div className="space-y-3">
                  {shares.filter(share => share.is_active).map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{share.shared_with_email}</span>
                          <Badge 
                            variant={share.permission_level === 'edit' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {share.permission_level === 'edit' ? 'Can Edit' : 'View Only'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Shared {new Date(share.created_at).toLocaleDateString()}</span>
                          {share.expires_at && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Expires {new Date(share.expires_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyShareLink(share.share_token)}
                          className="gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Link
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendEmailInvite(share)}
                          className="gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Email
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeShare(share.id)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active shares
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};