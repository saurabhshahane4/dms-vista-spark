import React, { useState } from 'react';
import { Shield, Users, Crown, Eye, UserCheck } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserRoles, type UserRole } from '@/hooks/useUserRoles';
import { toast } from 'sonner';

const roleIcons = {
  admin: Crown,
  manager: Shield,
  user: UserCheck,
  viewer: Eye
};

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800', 
  user: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800'
};

const roleDescriptions = {
  admin: 'Full system access and user management',
  manager: 'Can manage workflows and view all documents',
  user: 'Can create and manage their own documents',
  viewer: 'Read-only access to assigned documents'
};

export const UserRoleManager = () => {
  const { 
    allUserRoles, 
    loading, 
    isAdmin, 
    assignRole, 
    removeRole 
  } = useUserRoles();
  
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            You need admin privileges to manage user roles
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAssignRole = async () => {
    if (!newUserEmail) {
      toast.error('Please enter a user email');
      return;
    }

    // In a real implementation, you'd look up the user by email
    // For now, we'll show a placeholder message
    toast.info('User role assignment feature coming soon - need to implement user lookup by email');
    setNewUserEmail('');
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await assignRole(userId, newRole);
  };

  const handleRemoveRole = async (userId: string, role: UserRole) => {
    await removeRole(userId, role);
  };

  const groupedRoles = allUserRoles.reduce((acc, userRole) => {
    if (!acc[userRole.user_id]) {
      acc[userRole.user_id] = [];
    }
    acc[userRole.user_id].push(userRole);
    return acc;
  }, {} as Record<string, typeof allUserRoles>);

  return (
    <div className="space-y-6">
      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(roleDescriptions).map(([role, description]) => {
          const Icon = roleIcons[role as UserRole];
          const count = allUserRoles.filter(ur => ur.role === role).length;
          
          return (
            <Card key={role}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5" />
                  <Badge className={roleColors[role as UserRole]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign New Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign User Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="Enter user email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAssignRole} className="w-full">
                Assign Role
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : Object.keys(groupedRoles).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No user roles configured yet
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedRoles).map(([userId, userRoles]) => (
                <div key={userId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">User ID: {userId}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {userRoles.map((userRole) => {
                        const Icon = roleIcons[userRole.role];
                        return (
                          <Badge key={userRole.id} className={roleColors[userRole.role]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {userRole.role}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(value: UserRole) => handleRoleChange(userId, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Change role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
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