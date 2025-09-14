import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Building, CreditCard } from 'lucide-react';
import { useNetWorth } from '@/hooks/useNetWorth';
import { useAssets } from '@/hooks/useAssets';
import { useLiabilities } from '@/hooks/useLiabilities';
import { AssetsList } from './AssetsList';
import { LiabilitiesList } from './LiabilitiesList';
import { AssetForm } from './AssetForm';
import { LiabilityForm } from './LiabilityForm';

export const PatrimonyDashboard = () => {
  const { netWorth, loading: netWorthLoading } = useNetWorth();
  const { assets } = useAssets();
  const { liabilities } = useLiabilities();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getNetWorthColor = (value: number) => {
    if (value > 0) return 'text-emerald-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getNetWorthVariant = (value: number) => {
    if (value > 0) return 'default';
    if (value < 0) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Resumo do Patrimônio */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(netWorth?.total_assets || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {assets.length} {assets.length === 1 ? 'ativo' : 'ativos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Passivos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(netWorth?.total_liabilities || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {liabilities.length} {liabilities.length === 1 ? 'passivo' : 'passivos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNetWorthColor(netWorth?.net_worth || 0)}`}>
              {formatCurrency(netWorth?.net_worth || 0)}
            </div>
            <div className="flex items-center space-x-2">
              {(netWorth?.net_worth || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={getNetWorthVariant(netWorth?.net_worth || 0)}>
                {(netWorth?.net_worth || 0) >= 0 ? 'Positivo' : 'Negativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Gestão */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets">Ativos</TabsTrigger>
          <TabsTrigger value="liabilities">Passivos</TabsTrigger>
          <TabsTrigger value="add-asset">Novo Ativo</TabsTrigger>
          <TabsTrigger value="add-liability">Novo Passivo</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Ativos</CardTitle>
              <CardDescription>
                Gerencie seus bens e investimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Passivos</CardTitle>
              <CardDescription>
                Controle suas dívidas e obrigações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiabilitiesList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-asset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Ativo</CardTitle>
              <CardDescription>
                Registre um novo bem ou investimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-liability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Passivo</CardTitle>
              <CardDescription>
                Registre uma nova dívida ou obrigação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiabilityForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};