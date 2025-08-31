
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  email_verified: boolean | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user?.id) return null;
      
      console.log('Fetching user profile for:', user.id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, phone_number, email_verified, role, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile data:', data);
      return data;
    },
    enabled: !!user?.id,
  });
};
