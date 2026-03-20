import { z } from 'zod';

export const paymentSchema = z.object({
  paymentDetail: z.string().min(1, 'Payment detail is required'),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
