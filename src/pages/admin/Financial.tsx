import FinancialDashboard from '@/components/admin/FinancialDashboard';

const AdminFinancial = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">
          Métricas financeiras, receita e análise de assinaturas
        </p>
      </div>
      
      <FinancialDashboard />
    </div>
  );
};

export default AdminFinancial;