import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAssets, Asset, CreateAssetData } from '@/hooks/useAssets';

const assetFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  value: z.number().min(0, 'Valor deve ser positivo'),
  category: z.string().optional(),
  purchase_date: z.string().optional(),
  depreciation_rate: z.number().min(0).max(100).optional(),
  current_value: z.number().min(0).optional(),
});

interface AssetFormProps {
  asset?: Asset;
  onSuccess?: () => void;
}

export const AssetForm = ({ asset, onSuccess }: AssetFormProps) => {
  const { createAsset, updateAsset, loading } = useAssets();

  const form = useForm<CreateAssetData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: asset?.name || '',
      description: asset?.description || '',
      value: asset?.value || 0,
      category: asset?.category || '',
      purchase_date: asset?.purchase_date || '',
      depreciation_rate: asset?.depreciation_rate || 0,
      current_value: asset?.current_value || undefined,
    },
  });

  const onSubmit = async (data: CreateAssetData) => {
    let success = false;
    
    if (asset) {
      success = await updateAsset(asset.id, data);
    } else {
      success = await createAsset(data);
    }

    if (success) {
      if (!asset) {
        form.reset();
      }
      onSuccess?.();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Ativo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Casa, Carro, Investimentos..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detalhes sobre o ativo..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Original</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Atual (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="Deixe vazio para calcular automaticamente"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Imóveis, Veículos..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Compra</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="depreciation_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa de Depreciação (% ao ano)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : asset ? 'Atualizar Ativo' : 'Criar Ativo'}
          </Button>
        </div>
      </form>
    </Form>
  );
};