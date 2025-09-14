import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Search } from 'lucide-react';
import { useAssets, Asset } from '@/hooks/useAssets';
import { AssetForm } from './AssetForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const AssetsList = () => {
  const { assets, loading, deleteAsset } = useAssets();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
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

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAsset(id);
  };

  const calculateDepreciation = (asset: Asset) => {
    if (!asset.depreciation_rate || !asset.purchase_date) return 0;
    
    const purchaseDate = new Date(asset.purchase_date);
    const now = new Date();
    const yearsElapsed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    return asset.value * (asset.depreciation_rate / 100) * yearsElapsed;
  };

  const getCurrentValue = (asset: Asset) => {
    if (asset.current_value !== null && asset.current_value !== undefined) {
      return asset.current_value;
    }
    
    const depreciation = calculateDepreciation(asset);
    return Math.max(0, asset.value - depreciation);
  };

  if (loading) {
    return <div>Carregando ativos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar ativos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabela de Ativos */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nenhum ativo encontrado com os filtros aplicados.' : 'Nenhum ativo cadastrado ainda.'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor Original</TableHead>
              <TableHead>Valor Atual</TableHead>
              <TableHead>Data de Compra</TableHead>
              <TableHead>Depreciação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => {
              const currentValue = getCurrentValue(asset);
              const depreciation = calculateDepreciation(asset);
              
              return (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      {asset.description && (
                        <div className="text-sm text-muted-foreground">{asset.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {asset.category ? (
                      <Badge variant="outline">{asset.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(asset.value)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatCurrency(currentValue)}</span>
                      {depreciation > 0 && (
                        <span className="text-xs text-red-600">
                          -{formatCurrency(depreciation)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(asset.purchase_date)}</TableCell>
                  <TableCell>
                    {asset.depreciation_rate ? `${asset.depreciation_rate}% a.a.` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(asset)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar Ativo</DialogTitle>
                          </DialogHeader>
                          {editingAsset && (
                            <AssetForm
                              asset={editingAsset}
                              onSuccess={() => {
                                setIsEditDialogOpen(false);
                                setEditingAsset(null);
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
                            <AlertDialogTitle>Excluir Ativo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o ativo "{asset.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(asset.id)}>
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