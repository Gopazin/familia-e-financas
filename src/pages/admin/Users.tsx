import UserManagement from '@/components/admin/UserManagement';

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, assinaturas e permissões do sistema
        </p>
      </div>
      
      <UserManagement />
    </div>
  );
};

export default AdminUsers;