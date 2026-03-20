import { z } from 'zod';

export const modifyBookingSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  startDate: z.string().min(1, 'Pickup date is required'),
  endDate: z.string().min(1, 'Return date is required'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "Return date must be after pickup date",
  path: ["endDate"],
});

export type ModifyBookingFormData = z.infer<typeof modifyBookingSchema>;
