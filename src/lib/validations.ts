import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['receita', 'despesa'], {
    required_error: 'Tipo da transação é obrigatório',
  }),
  description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição muito longa'),
  amount: z.number().positive('Valor deve ser positivo').max(999999.99, 'Valor muito alto'),
  category_id: z.string().uuid('Categoria inválida'),
  family_member_id: z.string().uuid('Membro da família inválido'),
  date: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Data inválida'),
  observation: z.string().max(500, 'Observação muito longa').optional(),
});

export const familyMemberSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  role: z.enum(['pai', 'mae', 'filho', 'filha', 'outro'], {
    required_error: 'Papel na família é obrigatório',
  }),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório').max(50, 'Nome muito longo'),
  type: z.enum(['receita', 'despesa'], {
    required_error: 'Tipo da categoria é obrigatório',
  }),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida').optional(),
});

export const familySchema = z.object({
  name: z.string().min(1, 'Nome da família é obrigatório').max(100, 'Nome muito longo'),
});

export const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(1, 'Nome completo é obrigatório').max(100, 'Nome muito longo'),
  familyName: z.string().min(1, 'Nome da família é obrigatório').max(100, 'Nome muito longo'),
});

export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type FamilyFormData = z.infer<typeof familySchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;