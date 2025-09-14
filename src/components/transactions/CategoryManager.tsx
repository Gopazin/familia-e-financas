import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories, TransactionType } from '@/hooks/useCategories';
import { Plus, Star, Pencil, Trash2, Palette } from 'lucide-react';

const EMOJI_OPTIONS = ['💰', '🍽️', '🚗', '🏠', '🎮', '📱', '👕', '💊', '📚', '🎯', '💡', '🔧'];
const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', 
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

interface CategoryFormData {
  name: string;
  emoji: string;
  color: string;
  type: TransactionType;
  is_favorite: boolean;
}

export const CategoryManager = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory, toggleFavorite } = useCategories();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    emoji: '💰',
    color: '#6366f1',
    type: 'expense',
    is_favorite: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const success = editingCategory
      ? await updateCategory(editingCategory, formData)
      : await createCategory(formData);

    if (success) {
      setIsCreateOpen(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        emoji: '💰',
        color: '#6366f1',
        type: 'expense',
        is_favorite: false,
      });
    }
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      emoji: category.emoji,
      color: category.color,
      type: category.type,
      is_favorite: category.is_favorite,
    });
    setEditingCategory(category.id);
    setIsCreateOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(categoryId);
    }
  };

  const categoriesByType = {
    income: categories.filter(cat => cat.type === 'income' || cat.type === 'both'),
    expense: categories.filter(cat => cat.type === 'expense' || cat.type === 'both'),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Gerenciar Categorias
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Alimentação"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emoji</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {EMOJI_OPTIONS.map(emoji => (
                        <Button
                          key={emoji}
                          type="button"
                          variant={formData.emoji === emoji ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_OPTIONS.map(color => (
                        <Button
                          key={color}
                          type="button"
                          variant={formData.color === color ? 'default' : 'outline'}
                          size="sm"
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className="w-8 h-8 p-0 border-2"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: TransactionType) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="favorite"
                    checked={formData.is_favorite}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="favorite">Marcar como favorita</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingCategory(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Income Categories */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-success">Receitas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesByType.income.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                style={{ borderColor: category.color + '33' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: category.color }}>{category.emoji}</span>
                  <span className="font-medium">{category.name}</span>
                  {category.is_favorite && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavorite(category.id, category.is_favorite)}
                  >
                    <Star className={`h-3 w-3 ${category.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-destructive">Despesas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesByType.expense.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                style={{ borderColor: category.color + '33' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: category.color }}>{category.emoji}</span>
                  <span className="font-medium">{category.name}</span>
                  {category.is_favorite && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavorite(category.id, category.is_favorite)}
                  >
                    <Star className={`h-3 w-3 ${category.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};