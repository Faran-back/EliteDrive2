import { Booking } from '../types';

/**
 * Checks if two date ranges overlap.
 */
export const isOverlapping = (
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date
): boolean => {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && sB < eA;
};

/**
 * Checks if a vehicle has any active or pending bookings covering the same period.
 */
export const checkBookingOverlap = (
  existingBookings: Booking[],
  vehicleId: string,
  startDate: string | Date,
  endDate: string | Date,
  excludeBookingId?: string
): Booking | null => {
  const upcomingBookings = existingBookings.filter(
    (b) =>
      b.vehicleId === vehicleId &&
      b.id !== excludeBookingId &&
      b.status !== 'cancelled' &&
      b.status !== 'completed'
  );

  for (const booking of upcomingBookings) {
    if (isOverlapping(booking.startDate, booking.endDate, startDate, endDate)) {
      return booking;
    }
  }
  return null;
};

/**
 * Validates basic fields of a booking to prevent client-side formatting injects.
 */
export const validateBookingDates = (startDate: string, endDate: string): { isValid: boolean; error?: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Reset hours/minutes for day comparison to avoid immediate-time mismatches
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid dates provided.' };
  }

  if (start < now) {
    return { isValid: false, error: 'Pickup date cannot be in the past.' };
  }

  if (end < start) {
    return { isValid: false, error: 'Return date must be after pickup date.' };
  }

  return { isValid: true };
};
