import Navigation from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, Save, Plus } from "lucide-react";
import { useState } from "react";

const Transacoes = () => {
  const [transactionType, setTransactionType] = useState<"receita" | "despesa">("receita");

  const categories = {
    receita: ["Salário", "Mesada", "Freelance", "Investimentos", "Bônus", "Outros"],
    despesa: ["Alimentação", "Transporte", "Lazer", "Contas Fixas", "Educação", "Saúde", "Compras", "Outros"]
  };

  const familyMembers = ["João (Pai)", "Maria (Mãe)", "Ana (Filha)", "Pedro (Filho)"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
              Gerenciar Transações
            </h1>
            <p className="text-muted-foreground mt-1">
              Registre receitas e despesas de forma rápida e organizada
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Nova Transação</h2>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <Button
                      variant={transactionType === "receita" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTransactionType("receita")}
                      className={transactionType === "receita" ? "bg-gradient-secondary" : ""}
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                      Receita
                    </Button>
                    <Button
                      variant={transactionType === "despesa" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTransactionType("despesa")}
                      className={transactionType === "despesa" ? "bg-gradient-primary" : ""}
                    >
                      <ArrowDownCircle className="w-4 h-4 mr-2" />
                      Despesa
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        placeholder="Ex: Salário do mês, Supermercado..."
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories[transactionType].map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Select>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Quem fez a transação?" />
                        </SelectTrigger>
                        <SelectContent>
                          {familyMembers.map((member) => (
                            <SelectItem key={member} value={member}>
                              {member}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observation">Observação (opcional)</Label>
                    <Textarea
                      id="observation"
                      placeholder="Adicione detalhes sobre esta transação..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <Button className="w-full gap-2 bg-gradient-prosperity hover:bg-secondary shadow-success">
                    <Save className="w-4 h-4" />
                    Salvar Transação
                  </Button>
                </div>
              </Card>
            </div>

            {/* Quick Stats & Tips */}
            <div className="space-y-6">
              {/* Month Summary */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Resumo do Mês</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receitas</span>
                    <span className="font-semibold text-secondary">+R$ 12.500,00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Despesas</span>
                    <span className="font-semibold text-primary">-R$ 4.050,25</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Saldo</span>
                      <span className="font-bold text-lg text-secondary">R$ 8.449,75</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Categories */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Categorias Populares</h3>
                <div className="space-y-3">
                  {categories[transactionType].slice(0, 5).map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-9"
                    >
                      <Plus className="w-3 h-3" />
                      {category}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Tip */}
              <Card className="p-6 bg-gradient-prosperity text-white">
                <h3 className="font-semibold mb-2">💡 Dica do Dia</h3>
                <p className="text-sm text-white/90">
                  Registre suas transações diariamente para ter controle total das suas finanças!
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transacoes;