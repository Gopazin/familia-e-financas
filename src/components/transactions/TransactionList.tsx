import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useToast } from '@/hooks/use-toast';
import { BulkActionsBar } from './BulkActionsBar';
import { Pencil, Check, X, Filter, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EditingTransaction {
  id: string;
  field: 'description' | 'amount' | 'category' | 'date' | 'family_member_id';
  value: string;
}

export const TransactionList = () => {
  const { transactions, loading, updateTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  const { familyMembers } = useFamilyMembers();
  const { toast } = useToast();
  
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<EditingTransaction | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    member: 'all',
    startDate: '',
    endDate: '',
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesCategory = filters.category === 'all' || 
      (filters.category === 'uncategorized' ? !transaction.category : transaction.category === filters.category);
    const matchesMember = filters.member === 'all' || transaction.family_member_id === filters.member;
    
    let matchesDate = true;
    if (filters.startDate) {
      matchesDate = matchesDate && new Date(transaction.date) >= new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchesDate = matchesDate && new Date(transaction.date) <= new Date(filters.endDate);
    }

    return matchesSearch && matchesType && matchesCategory && matchesMember && matchesDate;
  });

  const handleEdit = (transaction: Transaction, field: EditingTransaction['field']) => {
    let value = '';
    switch (field) {
      case 'description':
        value = transaction.description;
        break;
      case 'amount':
        value = transaction.amount.toString();
        break;
      case 'category':
        value = transaction.category || '';
        break;
      case 'date':
        value = transaction.date;
        break;
      case 'family_member_id':
        value = transaction.family_member_id || '';
        break;
    }

    setEditingTransaction({
      id: transaction.id,
      field,
      value,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;

    const updateData: any = {};
    
    switch (editingTransaction.field) {
      case 'description':
        updateData.description = editingTransaction.value;
        break;
      case 'amount':
        updateData.amount = parseFloat(editingTransaction.value);
        break;
      case 'category':
        updateData.category = editingTransaction.value || null;
        break;
      case 'date':
        updateData.date = editingTransaction.value;
        break;
      case 'family_member_id':
        updateData.family_member_id = editingTransaction.value || null;
        break;
    }

    const success = await updateTransaction(editingTransaction.id, updateData);
    if (success) {
      setEditingTransaction(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return;
    
    const promises = selectedTransactions.map(id => deleteTransaction(id));
    const results = await Promise.all(promises);
    
    if (results.every(r => r)) {
      toast({
        title: "Transações excluídas",
        description: `${selectedTransactions.length} transações foram removidas.`,
      });
    }
    
    setSelectedTransactions([]);
  };

  const handleBulkCategoryUpdate = async (categoryId: string) => {
    if (selectedTransactions.length === 0) return;
    
    const promises = selectedTransactions.map(id => 
      updateTransaction(id, { category: categoryId })
    );
    const results = await Promise.all(promises);
    
    if (results.every(r => r)) {
      toast({
        title: "Categoria atualizada",
        description: `${selectedTransactions.length} transações foram atualizadas.`,
      });
    }
    
    setSelectedTransactions([]);
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? `${category.emoji} ${category.name}` : categoryId;
  };

  const getFamilyMemberName = (memberId: string | null) => {
    if (!memberId) return 'Não especificado';
    const member = familyMembers.find(m => m.id === memberId);
    return member ? member.name : 'Membro desconhecido';
  };

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'text-success' : 'text-destructive';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Lista de Transações
          </CardTitle>
          {selectedTransactions.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedTransactions.length} selecionada(s)
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            placeholder="Buscar descrição..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          
          <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="uncategorized">Sem categoria</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.member} onValueChange={(value) => setFilters(prev => ({ ...prev, member: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Membro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {familyMembers.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          />

          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={() => handleSelectTransaction(transaction.id)}
                  />
                </TableCell>
                
                <TableCell>
                  {editingTransaction?.id === transaction.id && editingTransaction.field === 'date' ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="date"
                        value={editingTransaction.value}
                        onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, value: e.target.value } : null)}
                        className="w-32"
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-muted rounded px-2 py-1"
                      onClick={() => handleEdit(transaction, 'date')}
                    >
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  {editingTransaction?.id === transaction.id && editingTransaction.field === 'description' ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingTransaction.value}
                        onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, value: e.target.value } : null)}
                        className="min-w-0"
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-muted rounded px-2 py-1"
                      onClick={() => handleEdit(transaction, 'description')}
                    >
                      {transaction.description}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  {editingTransaction?.id === transaction.id && editingTransaction.field === 'category' ? (
                    <div className="flex items-center gap-1">
                      <Select value={editingTransaction.value} onValueChange={(value) => setEditingTransaction(prev => prev ? { ...prev, value } : null)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem categoria</SelectItem>
                          {categories
                            .filter(cat => cat.type === transaction.type || cat.type === 'both')
                            .map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.emoji} {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-muted rounded px-2 py-1"
                      onClick={() => handleEdit(transaction, 'category')}
                    >
                      <Badge variant="outline">
                        {getCategoryName(transaction.category)}
                      </Badge>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  {editingTransaction?.id === transaction.id && editingTransaction.field === 'family_member_id' ? (
                    <div className="flex items-center gap-1">
                      <Select value={editingTransaction.value} onValueChange={(value) => setEditingTransaction(prev => prev ? { ...prev, value } : null)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Não especificado</SelectItem>
                          {familyMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-muted rounded px-2 py-1"
                      onClick={() => handleEdit(transaction, 'family_member_id')}
                    >
                      {getFamilyMemberName(transaction.family_member_id)}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {editingTransaction?.id === transaction.id && editingTransaction.field === 'amount' ? (
                    <div className="flex items-center justify-end gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={editingTransaction.value}
                        onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, value: e.target.value } : null)}
                        className="w-24 text-right"
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className={`cursor-pointer hover:bg-muted rounded px-2 py-1 font-medium ${getTransactionColor(transaction.type)}`}
                      onClick={() => handleEdit(transaction, 'amount')}
                    >
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTransaction(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredTransactions.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação encontrada com os filtros aplicados.
          </div>
        )}
      </CardContent>

      <BulkActionsBar
        selectedCount={selectedTransactions.length}
        onClearSelection={() => setSelectedTransactions([])}
        onBulkDelete={handleBulkDelete}
        onBulkCategoryUpdate={handleBulkCategoryUpdate}
      />
    </Card>
  );
};