import { describe, it, expect } from 'vitest';
import { isOverlapping, checkBookingOverlap, validateBookingDates } from './bookingValidation';
import { Booking } from '../types';

describe('Booking validation helpers', () => {
  describe('isOverlapping', () => {
    it('should correctly detect overlapping dates', () => {
      // Span 1: June 10 to June 15
      // Span 2: June 12 to June 14 (inner overlap)
      expect(isOverlapping('2026-06-10T12:00:00Z', '2026-06-15T12:00:00Z', '2026-06-12T12:00:00Z', '2026-06-14T12:00:00Z')).toBe(true);

      // Span 1: June 10 to June 12
      // Span 2: June 12 to June 14 (boundary overlap - usually allowed or edge-case depending on definition, here returning false since 12:00 <= 12:00 is not true)
      expect(isOverlapping('2026-06-10T12:00:00Z', '2026-06-12T12:00:00Z', '2026-06-12T12:00:00Z', '2026-06-14T12:00:00Z')).toBe(false);

      // Span 1: June 10 to June 15
      // Span 2: June 14 to June 20 (partial overlap)
      expect(isOverlapping('2026-06-10T12:00:00Z', '2026-06-15T12:00:00Z', '2026-06-14T12:00:00Z', '2026-06-20T12:00:00Z')).toBe(true);
    });

    it('should return false for completely distinct date ranges', () => {
      // June 10-12 vs June 13-15
      expect(isOverlapping('2026-06-10T00:00:00Z', '2026-06-12T00:00:00Z', '2026-06-13T00:00:00Z', '2026-06-15T00:00:00Z')).toBe(false);
    });
  });

  describe('checkBookingOverlap', () => {
    const mockBookings: Booking[] = [
      {
        id: 'b1',
        vehicleId: 'vh-1',
        userId: 'u1',
        startDate: '2026-06-10T00:00:00Z',
        endDate: '2026-06-15T00:00:00Z',
        totalPrice: 12000,
        status: 'active',
        paymentStatus: 'paid',
        bookingDate: '2026-06-05'
      },
      {
        id: 'b2',
        vehicleId: 'vh-1',
        userId: 'u2',
        startDate: '2026-06-20T00:00:00Z',
        endDate: '2026-06-25T00:00:00Z',
        totalPrice: 15000,
        status: 'cancelled', // Cancelled booking should NOT affect overlap checking
        paymentStatus: 'pending',
        bookingDate: '2026-06-05'
      }
    ];

    it('should find overlap with active mock booking', () => {
      const overlap = checkBookingOverlap(mockBookings, 'vh-1', '2026-06-12T00:00:00Z', '2026-06-14T00:00:00Z');
      expect(overlap).not.toBeNull();
      expect(overlap?.id).toBe('b1');
    });

    it('should ignore overlap with cancelled booking', () => {
      const overlap = checkBookingOverlap(mockBookings, 'vh-1', '2026-06-22T00:00:00Z', '2026-06-24T00:00:00Z');
      expect(overlap).toBeNull();
    });

    it('should ignore self when updating booking details', () => {
      const overlap = checkBookingOverlap(mockBookings, 'vh-1', '2026-06-12T00:00:00Z', '2026-06-14T00:00:00Z', 'b1');
      expect(overlap).toBeNull();
    });
  });

  describe('validateBookingDates', () => {
    it('should block dates in the past', () => {
      const pastStart = '2024-01-01T00:00:00Z';
      const pastEnd = '2024-01-05T00:00:00Z';
      const result = validateBookingDates(pastStart, pastEnd);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('past');
    });

    it('should block return dates earlier than pickup date', () => {
      // Note: Current date is June 7, 2026
      const result = validateBookingDates('2026-06-15T00:00:00Z', '2026-06-10T00:00:00Z');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('after');
    });

    it('should succeed for future clean dates', () => {
      const result = validateBookingDates('2026-06-10T12:00:00Z', '2026-06-15T12:00:00Z');
      expect(result.isValid).toBe(true);
    });
  });
});
