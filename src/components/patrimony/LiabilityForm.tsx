import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLiabilities, Liability, CreateLiabilityData } from '@/hooks/useLiabilities';

const liabilityFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  total_amount: z.number().min(0, 'Valor total deve ser positivo'),
  remaining_amount: z.number().min(0, 'Saldo devedor deve ser positivo'),
  interest_rate: z.number().min(0).max(100).optional(),
  due_date: z.string().optional(),
  monthly_payment: z.number().min(0).optional(),
  category: z.string().optional(),
  creditor: z.string().optional(),
});

interface LiabilityFormProps {
  liability?: Liability;
  onSuccess?: () => void;
}

export const LiabilityForm = ({ liability, onSuccess }: LiabilityFormProps) => {
  const { createLiability, updateLiability, loading } = useLiabilities();

  const form = useForm<CreateLiabilityData>({
    resolver: zodResolver(liabilityFormSchema),
    defaultValues: {
      name: liability?.name || '',
      description: liability?.description || '',
      total_amount: liability?.total_amount || 0,
      remaining_amount: liability?.remaining_amount || 0,
      interest_rate: liability?.interest_rate || 0,
      due_date: liability?.due_date || '',
      monthly_payment: liability?.monthly_payment || 0,
      category: liability?.category || '',
      creditor: liability?.creditor || '',
    },
  });

  const onSubmit = async (data: CreateLiabilityData) => {
    let success = false;
    
    if (liability) {
      success = await updateLiability(liability.id, data);
    } else {
      success = await createLiability(data);
    }

    if (success) {
      if (!liability) {
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
              <FormLabel>Nome do Passivo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Financiamento casa, Cartão de crédito..." {...field} />
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
                  placeholder="Detalhes sobre o passivo..." 
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
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total</FormLabel>
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
            name="remaining_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Devedor</FormLabel>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="creditor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credor</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Banco, Loja..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Financiamento, Cartão..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="interest_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa de Juros (% ao mês)</FormLabel>
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

          <FormField
            control={form.control}
            name="monthly_payment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pagamento Mensal</FormLabel>
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
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : liability ? 'Atualizar Passivo' : 'Criar Passivo'}
          </Button>
        </div>
      </form>
    </Form>
  );
};