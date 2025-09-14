import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Tag, X } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkCategoryUpdate: (categoryId: string) => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkCategoryUpdate,
}: BulkActionsBarProps) => {
  const { categories } = useCategories();

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedCount} selecionada{selectedCount > 1 ? 's' : ''}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-4 w-px bg-border" />

        <Select onValueChange={onBulkCategoryUpdate}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alterar categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center space-x-2">
                  <span>{category.emoji}</span>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </div>
    </div>
  );
};