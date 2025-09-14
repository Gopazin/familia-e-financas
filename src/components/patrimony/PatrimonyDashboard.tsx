import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Building, CreditCard, PlusCircle } from 'lucide-react';
import { useNetWorth } from '@/hooks/useNetWorth';
import { useAssets } from '@/hooks/useAssets';
import { useLiabilities } from '@/hooks/useLiabilities';
import { AssetsList } from './AssetsList';
import { LiabilitiesList } from './LiabilitiesList';
import { AssetForm } from './AssetForm';
import { LiabilityForm } from './LiabilityForm';

export const PatrimonyDashboard = () => {
  const { netWorth, loading: netWorthLoading } = useNetWorth();
  const { assets, loading: assetsLoading } = useAssets();
  const { liabilities, loading: liabilitiesLoading } = useLiabilities();

  const hasData = assets.length > 0 || liabilities.length > 0;
  const isLoading = netWorthLoading || assetsLoading || liabilitiesLoading;

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Empty State */}
      {!hasData && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Comece a construir seu patrimônio
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Registre seus bens e dívidas para ter uma visão completa da sua situação financeira.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button size="lg" className="gap-2">
                    <Building className="h-4 w-4" />
                    Adicionar Primeiro Ativo
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Registrar Primeira Dívida
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-success" />
                  O que são Ativos?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ativos são bens que você possui e que têm valor financeiro:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Casa própria, apartamentos, terrenos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Carros, motos, equipamentos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Investimentos, poupança, ações
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Joias, obras de arte, coleções
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-destructive" />
                  O que são Passivos?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Passivos são dívidas e obrigações financeiras:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Financiamento da casa ou carro
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Cartão de crédito, empréstimos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Consórcios, prestações
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Contas em atraso, impostos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Example Values Card */}
          <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Exemplo Prático
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-success">R$ 320.000</div>
                  <div className="text-sm text-muted-foreground">Ativos Totais</div>
                  <div className="text-xs text-muted-foreground">Casa + Carro + Investimentos</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-destructive">R$ 180.000</div>
                  <div className="text-sm text-muted-foreground">Passivos Totais</div>
                  <div className="text-xs text-muted-foreground">Financiamentos + Cartão</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">R$ 140.000</div>
                  <div className="text-sm text-muted-foreground">Patrimônio Líquido</div>
                  <div className="text-xs text-muted-foreground">Seu valor real</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Show data cards even when there's no data but with zero values */}
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
      <Tabs defaultValue={hasData ? "assets" : "add-asset"} className="space-y-4">
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
          {!hasData && (
            <Card className="mb-4 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Building className="h-5 w-5" />
                  <h3 className="font-medium">Primeiro Ativo</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comece registrando algo que você possui e tem valor financeiro.
                </p>
              </CardContent>
            </Card>
          )}
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
          {!hasData && (
            <Card className="mb-4 bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive mb-2">
                  <CreditCard className="h-5 w-5" />
                  <h3 className="font-medium">Primeiro Passivo</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Registre suas dívidas para ter controle total das finanças.
                </p>
              </CardContent>
            </Card>
          )}
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