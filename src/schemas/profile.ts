import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().refine(val => val === '' || val.length >= 10, {
    message: 'Phone number must be at least 10 characters if provided',
  }),
  location: z.string().min(2, 'Location must be at least 2 characters'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
