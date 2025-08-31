
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserRole {
  id: number;
  user_id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export default function UserManagement() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Fetch all user roles with improved error handling
  const { data: userRoles, isLoading, error, refetch } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async (): Promise<UserRole[]> => {
      console.log('🔄 Fetching all user roles...');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user roles:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      console.log('✅ Successfully fetched user roles:', {
        count: data?.length || 0,
        data: data
      });

      // Log each user for debugging
      data?.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          id: user.user_id,
          email: user.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name',
          role: user.role
        });
      });
      
      return data || [];
    },
    enabled: userRole === 'admin',
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 30000, // Refresh every 30 seconds to catch new users
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      console.log('🔄 Updating role for user:', userId, 'to:', newRole);
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (roleError) {
        console.error('❌ Error updating user role:', roleError);
        throw roleError;
      }

      // Also update user_profiles table if it exists
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (profileError) {
        console.warn('⚠️ Profile update failed (this is okay if profile doesn\'t exist):', profileError);
      }

      console.log('✅ Successfully updated user role');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('User role updated successfully');
      setUpdatingUserId(null);
    },
    onError: (error: any) => {
      console.error('❌ Role update mutation error:', error);
      toast.error(`Failed to update role: ${error.message}`);
      setUpdatingUserId(null);
    },
  });

  const handleRoleUpdate = (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    updateRoleMutation.mutate({ userId, newRole });
  };

  const handleRefresh = () => {
    console.log('🔄 Manually refreshing user data...');
    refetch();
    toast.info('Refreshing user data...');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'customer':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Access Denied</h3>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error in UserManagement component:', error);
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Error Loading Users</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load user data. Please try again.'}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering UserManagement with:', {
    userRolesCount: userRoles?.length || 0,
    hasData: !!userRoles && userRoles.length > 0
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">{userRoles?.length || 0} Users</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userRoles && userRoles.length > 0 ? (
              userRoles.map((user) => {
                const displayName = user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.first_name || user.last_name || 'Unnamed User';

                console.log('🎨 Rendering user:', {
                  user_id: user.user_id,
                  email: user.email,
                  displayName,
                  role: user.role
                });

                return (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium">{displayName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.email || 'No email provided'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {user.user_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => handleRoleUpdate(user.user_id, newRole)}
                        disabled={updatingUserId === user.user_id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingUserId === user.user_id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Users Found</h3>
                <p className="text-muted-foreground mb-4">
                  No users have been registered yet. When users sign up, they will appear here automatically.
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for New Users
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
