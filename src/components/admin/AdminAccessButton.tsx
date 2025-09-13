import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

const AdminAccessButton = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (data && !error) {
        setIsAdmin(true);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
      <Link to="/admin" className="flex items-center gap-2">
        <Crown className="w-4 h-4" />
        Área Admin
      </Link>
    </Button>
  );
};

export default AdminAccessButton;