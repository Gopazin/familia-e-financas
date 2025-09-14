import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTransactions, TransactionType } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Plus, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface QuickFormData {
  type: TransactionType;
  description: string;
  amount: string;
  category: string;
  family_member_id: string;
  date: string;
}

export const QuickTransactionForm = () => {
  const { createTransaction, loading } = useTransactions();
  const { categories, getCategoriesByType, getFavoriteCategories } = useCategories();
  const { familyMembers } = useFamilyMembers();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<QuickFormData>({
    type: 'expense',
    description: '',
    amount: '',
    category: '',
    family_member_id: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      return;
    }

    const success = await createTransaction({
      type: formData.type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category || undefined,
      family_member_id: formData.family_member_id || undefined,
      date: formData.date,
    });

    if (success) {
      setIsOpen(false);
      setFormData({
        type: 'expense',
        description: '',
        amount: '',
        category: '',
        family_member_id: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleQuickCategory = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const availableCategories = getCategoriesByType(formData.type);
  const favoriteCategories = getFavoriteCategories().filter(cat => 
    cat.type === formData.type || cat.type === 'both'
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="lg">
          <Plus className="h-5 w-5" />
          Lançamento Rápido
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Novo Lançamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={formData.type === 'income' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Receita
            </Button>
            <Button
              type="button"
              variant={formData.type === 'expense' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
              className="gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              Despesa
            </Button>
          </div>

          {/* Essential Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          {/* Favorite Categories */}
          {favoriteCategories.length > 0 && (
            <div className="space-y-2">
              <Label>Categorias Favoritas</Label>
              <div className="flex flex-wrap gap-2">
                {favoriteCategories.slice(0, 6).map(category => (
                  <Badge
                    key={category.id}
                    variant={formData.category === category.id ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleQuickCategory(category.id)}
                  >
                    {category.emoji} {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem categoria</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Family Member */}
          {familyMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="member">Responsável</Label>
              <Select value={formData.family_member_id} onValueChange={(value) => setFormData(prev => ({ ...prev, family_member_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
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
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.description || !formData.amount}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};