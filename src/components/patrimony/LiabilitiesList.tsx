import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import { useLiabilities, Liability } from '@/hooks/useLiabilities';
import { LiabilityForm } from './LiabilityForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const LiabilitiesList = () => {
  const { liabilities, loading, deleteLiability } = useLiabilities();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDueDateVariant = (dueDate?: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days === null) return 'secondary';
    if (days < 0) return 'destructive'; // Vencido
    if (days <= 7) return 'destructive'; // Vence em 7 dias
    if (days <= 30) return 'secondary'; // Vence em 30 dias
    return 'outline'; // Mais de 30 dias
  };

  const getDueDateText = (dueDate?: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days === null) return '-';
    if (days < 0) return `Vencido há ${Math.abs(days)} dias`;
    if (days === 0) return 'Vence hoje';
    if (days === 1) return 'Vence amanhã';
    if (days <= 30) return `Vence em ${days} dias`;
    return `${Math.ceil(days / 30)} meses`;
  };

  const filteredLiabilities = liabilities.filter(liability =>
    liability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    liability.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    liability.creditor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    liability.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (liability: Liability) => {
    setEditingLiability(liability);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteLiability(id);
  };

  const getPaymentProgress = (total: number, remaining: number) => {
    const paid = total - remaining;
    const percentage = (paid / total) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  if (loading) {
    return <div>Carregando passivos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar passivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabela de Passivos */}
      {filteredLiabilities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nenhum passivo encontrado com os filtros aplicados.' : 'Nenhum passivo cadastrado ainda.'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Credor</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Saldo Devedor</TableHead>
              <TableHead>Pagamento Mensal</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLiabilities.map((liability) => {
              const progress = getPaymentProgress(liability.total_amount, liability.remaining_amount);
              const daysUntilDue = getDaysUntilDue(liability.due_date);
              
              return (
                <TableRow key={liability.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {daysUntilDue !== null && daysUntilDue <= 7 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{liability.name}</div>
                        {liability.description && (
                          <div className="text-sm text-muted-foreground">{liability.description}</div>
                        )}
                        {liability.category && (
                          <Badge variant="outline" className="mt-1">{liability.category}</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {liability.creditor || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>{formatCurrency(liability.total_amount)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{formatCurrency(liability.remaining_amount)}</span>
                      {liability.interest_rate && (
                        <span className="text-xs text-muted-foreground">
                          Taxa: {liability.interest_rate}% a.m.
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {liability.monthly_payment ? 
                      formatCurrency(liability.monthly_payment) : 
                      <span className="text-muted-foreground">-</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(liability.due_date)}</span>
                      {liability.due_date && (
                        <Badge 
                          variant={getDueDateVariant(liability.due_date)}
                          className="mt-1 text-xs"
                        >
                          {getDueDateText(liability.due_date)}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {progress.toFixed(1)}% pago
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(liability)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar Passivo</DialogTitle>
                          </DialogHeader>
                          {editingLiability && (
                            <LiabilityForm
                              liability={editingLiability}
                              onSuccess={() => {
                                setIsEditDialogOpen(false);
                                setEditingLiability(null);
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Passivo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o passivo "{liability.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(liability.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};