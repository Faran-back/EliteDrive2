import { Vehicle } from '../types';

export interface VehicleFareDetails {
  vehicleId: string;
  name: string;
  pricePerDay: number; // Daily Rate
  hourlyMinHrs: number; // Minimum hours for base
  hourlyBasePrice: number; // Base price for minimum hours
  hourlySubsequentRate: number; // Rate per subsequent hour
  weeklyDiscountFactor: number; // Discount factor for weekly package
  weeklyPackagePrice: number; // Price for 7-day weekly package
}

export const getVehicleFareConfig = (vehicle: Vehicle): Omit<VehicleFareDetails, 'vehicleId' | 'name'> => {
  const daily = vehicle.pricePerDay;

  // Classify based on daily price tiers in PKR
  if (daily < 6000) {
    // Economy Hatchbacks (Alto, Bolan, Wagon R, Cultus, Pearl, Bravo, Picanto)
    return {
      pricePerDay: daily,
      hourlyMinHrs: 3,
      hourlyBasePrice: 1600,
      hourlySubsequentRate: 450,
      weeklyDiscountFactor: 0.12, // 12% discount
      weeklyPackagePrice: Math.round(daily * 7 * 0.88),
    };
  } else if (daily < 11050) {
    // Comfort Sedans & Crossovers (Corolla, Yaris, City, BR-V, Alsvin, Elantra, Glory)
    return {
      pricePerDay: daily,
      hourlyMinHrs: 3,
      hourlyBasePrice: 2800,
      hourlySubsequentRate: 800,
      weeklyDiscountFactor: 0.15, // 15% discount
      weeklyPackagePrice: Math.round(daily * 7 * 0.85),
    };
  } else if (daily < 20000) {
    // Premium Crossovers & Executive Sedans (Civic, Sportage, Tucson, HS, H6, Sonata, ZS)
    return {
      pricePerDay: daily,
      hourlyMinHrs: 3,
      hourlyBasePrice: 4800,
      hourlySubsequentRate: 1500,
      weeklyDiscountFactor: 0.18, // 18% discount
      weeklyPackagePrice: Math.round(daily * 7 * 0.82),
    };
  } else {
    // Premium Heavy & Luxury SUV (Fortuner, Hilux Revo)
    return {
      pricePerDay: daily,
      hourlyMinHrs: 3,
      hourlyBasePrice: 9500,
      hourlySubsequentRate: 2800,
      weeklyDiscountFactor: 0.20, // 20% discount
      weeklyPackagePrice: Math.round(daily * 7 * 0.80),
    };
  }
};

/**
 * Calculates base price for vehicle matching real-world Pakistani Car Rental standards.
 * Guaranteed no low-pricing abuse (eg. no 200 PKR hourly rates).
 */
export const calculateBaseFare = (
  vehicle: Vehicle,
  duration: number, // hours for hourly, days for daily, weeks for weekly
  rentalType: 'hourly' | 'daily' | 'weekly'
): number => {
  const config = getVehicleFareConfig(vehicle);

  if (rentalType === 'hourly') {
    const hours = duration;
    if (hours <= config.hourlyMinHrs) {
      return config.hourlyBasePrice;
    } else {
      const subsequentHrs = hours - config.hourlyMinHrs;
      return config.hourlyBasePrice + (subsequentHrs * config.hourlySubsequentRate);
    }
  }

  if (rentalType === 'weekly') {
    const weeks = duration;
    let base = config.weeklyPackagePrice * weeks;
    // Further discounts for long-term weeks
    if (weeks >= 4) {
      base = base * 0.90; // Add extra 10% monthly discount
    }
    return Math.round(base);
  }

  // Daily rental
  const days = duration;
  let base = config.pricePerDay * days;
  if (days >= 7) {
    base = base * 0.85; // 15% discount for 7+ days (essentially shifting closer to weekly rates)
  } else if (days >= 3) {
    base = base * 0.90; // 10% discount for 3+ days
  }
  return Math.round(base);
};
