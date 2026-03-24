import { z } from 'zod';

export const paymentSchema = z.object({
  paymentDetail: z.string().min(1, 'Payment detail is required'),
  destination: z.string().min(1, 'Destination is required'),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
