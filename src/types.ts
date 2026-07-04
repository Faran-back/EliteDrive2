export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'manager';
  rewardPoints: number;
  avatar: string;
  favorites?: string[];
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  cnicFront?: string | null;
  cnicBack?: string | null;
  license?: string | null;
  cnicVerified?: boolean;
  createdAt?: string;
  location?: string;
  outstandingBalance?: number;
  isBlacklisted?: boolean;
  isBlackListed?: boolean;
  emailVerificationCode?: string;
  pendingInvitation?: {
    role: 'admin' | 'manager';
    invitedBy: string;
    invitedAt: string;
    invitationId: string;
  };
}

export interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'manager';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  token: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Sedan' | 'SUV' | 'Hatchback' | 'Luxury' | 'Economy' | 'Pickup';
  pricePerDay: number;
  image: string;
  images?: string[]; // Multiple images uploaded for the car
  transmission: 'Automatic' | 'Manual';
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  seats: number;
  rating: number;
  reviews?: number;
  available?: boolean;
  location: string;
  features: string[];
  status: 'available' | 'rented' | 'booked' | 'maintenance';
  description?: string;
  createdAt?: string;
  licensePlate?: string; // License plate number
  mileage?: number; // Odometer reading in KM
}

export interface Booking {
  id: string;
  vehicleId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
  bookingDate: string;
  createdAt?: string; // sorting and range filtering
  destination?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  chauffeurSelected?: boolean;
  driverName?: string;
  driverPhone?: string;
  rentalType?: 'hourly' | 'daily' | 'weekly';
  rentalDuration?: number;
  calendarDays?: number;
  basePrice?: number;
  insurancePrice?: number;
  chauffeurPrice?: number;
  discountPrice?: number;
  insuranceType?: 'none' | 'basic' | 'premium';
  
  // Payment enhancement features
  paymentType?: 'full' | 'partial'; // Full vs 50% upfront
  upfrontAmountPaid?: number;
  remainingAmount?: number;
  remainingPaymentStatus?: 'paid' | 'pending'; // 50% remaining payment status (collected in person)
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'card' | 'transfer';
  receiptImage?: string; // bank transfer receipt image
  bankReceiptApproved?: 'pending' | 'approved' | 'rejected';
  bankReceiptRejectionReason?: string;
  sendingBank?: string;
  transactionRef?: string;
  bankVerificationCode?: string;

  // New Booking Fields
  securityDepositAmount?: number;
  securityDepositStatus?: 'pending' | 'collected' | 'refunded' | 'forfeited';
  preRentalChecklist?: {
    mileage: number;
    fuelLevel: string;
    existingDamage: string;
    interiorNotes?: string;
    photos: string[];
    timestamp?: string;
  };
  isOutOfCity?: boolean;
  outOfCityDetails?: {
    destination: string;
    guarantorName: string;
    guarantorPhone: string;
    hasSignedAgreement?: boolean;
    gpsTrackingConsent?: boolean;
  };
  refundAmount?: number;
  refundStatus?: 'none' | 'pending_manual_bank_transfer' | 'processed';
  penaltyAmount?: number;
  penaltyReason?: string;
  returnChecklist?: {
    mileage: number;
    fuelLevel: string;
    exteriorNotes?: string;
    interiorNotes?: string;
    photos?: string[];
    timestamp?: string;
  };
}

export interface Incident {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  vehicleId: string;
  vehicleName: string;
  type: 'minor_accident' | 'major_accident' | 'theft' | 'breakdown' | 'flat_tire' | 'third_party_damage';
  occurredAt: string;
  submittedAt: string;
  isLateReport: boolean;
  location: string;
  statement: string;
  witnessName?: string;
  witnessPhone?: string;
  photos?: string[];
  firNumber?: string;
  status: 'filed' | 'under_review' | 'action_taken' | 'closed';
  actionType?: 'charge' | 'approve' | 'reject' | 'none';
  notes?: string;
  filedByAdmin?: boolean;
  insuranceTier?: 'none' | 'basic' | 'premium';
  insuranceCoverageDetails?: string;
}

export interface Dispute {
  id: string;
  userId: string;
  userName: string;
  bookingId?: string;
  type: 'damage_charges' | 'late_return' | 'traffic_violation' | 'payment_issue' | 'document_issue';
  title: string;
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  resolutionDetails?: string;
  createdAt: string;
}

export interface EChallan {
  id: string;
  challanNumber: string;
  date: string;
  amount: number;
  vehicleId: string;
  matchedBookingId?: string;
  matchedUserId?: string;
  matchedUserName?: string;
  status: 'pending' | 'finalized' | 'disputed';
  disputedAt?: string;
  createdAt: string;
}

export interface RoleRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedRole: 'admin' | 'manager';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedBy?: string;
  processedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'promotion' | 'info' | 'invitation' | 'role_request_approved' | 'role_request_rejected' | string;
  read: boolean;
  createdAt: string;
  link?: string;
  invitationId?: string;
  ws_notified?: boolean;
  webpush_notified?: boolean;
}

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'vh-7k2m9p1x',
    name: 'Suzuki Alto',
    type: 'Hatchback',
    pricePerDay: 4000,
    image: 'https://images.unsplash.com/photo-1567808291548-fc3ee04dbac0?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 4,
    rating: 4.8,
    location: 'Lahore',
    features: ['Fuel Efficient', 'Compact', 'Parking Sensors'],
    status: 'available'
  },
  {
    id: 'vh-b2c3d4e5',
    name: 'Toyota Corolla',
    type: 'Sedan',
    pricePerDay: 7500,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.7,
    location: 'Karachi',
    features: ['Air Conditioning', 'Bluetooth', 'Cruise Control', 'Reverse Camera'],
    status: 'available'
  },
  {
    id: 'vh-3m5n7p9q',
    name: 'Honda Civic',
    type: 'Sedan',
    pricePerDay: 11000,
    image: 'https://images.unsplash.com/photo-1594070319944-7c0c63146b77?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.9,
    location: 'Islamabad',
    features: ['Sunroof', 'Leather Seats', 'Turbo Engine', 'Apple CarPlay'],
    status: 'available'
  },
  {
    id: 'vh-8n2m4p6q',
    name: 'Kia Sportage',
    type: 'SUV',
    pricePerDay: 13500,
    image: 'https://images.unsplash.com/photo-1623993000033-689367468648?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.8,
    location: 'Lahore',
    features: ['4x4', 'Premium Sound', 'Power Tailgate', 'Heated Seats'],
    status: 'available'
  },
  {
    id: 'vh-4x9y2z1w',
    name: 'Honda BR-V',
    type: 'SUV',
    pricePerDay: 9000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 7,
    rating: 4.5,
    location: 'Islamabad',
    features: ['7 Seater', 'Roof Rails', 'Rear AC Vents'],
    status: 'available'
  },
  {
    id: 'vh-1z6w4v2u',
    name: 'Toyota Fortuner',
    type: 'SUV',
    pricePerDay: 28000,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 7,
    rating: 4.9,
    location: 'Karachi',
    features: ['Off-road Pro', 'Leather Interior', 'Diff Lock'],
    status: 'available'
  },
  {
    id: 'vh-5y3t1r9e',
    name: 'Suzuki Cultus',
    type: 'Hatchback',
    pricePerDay: 5500,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.6,
    location: 'Lahore',
    features: ['Fuel Efficient', 'Power Steering', 'ABS'],
    status: 'available'
  },
  {
    id: 'vh-2w8q4m6n',
    name: 'Suzuki Wagon R',
    type: 'Hatchback',
    pricePerDay: 4500,
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Manual',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.4,
    location: 'Rawalpindi',
    features: ['Spacious Interior', 'Economical', 'Reliable'],
    status: 'available'
  },
  {
    id: 'vh-6v4b2n8m',
    name: 'Toyota Yaris',
    type: 'Sedan',
    pricePerDay: 7000,
    image: 'https://images.unsplash.com/photo-1629891212234-55835e7a1c0d?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.6,
    location: 'Multan',
    features: ['Modern Design', 'Safety Airbags', 'Smart Entry'],
    status: 'available'
  },
  {
    id: 'vh-7u5i3o1p',
    name: 'Honda City',
    type: 'Sedan',
    pricePerDay: 8000,
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.7,
    location: 'Faisalabad',
    features: ['Elegant Look', 'Smooth Drive', 'Digital Display'],
    status: 'available'
  },
  {
    id: 'vh-8t4r2e6w',
    name: 'Hyundai Tucson',
    type: 'SUV',
    pricePerDay: 14000,
    image: 'https://images.unsplash.com/photo-1631834273022-77983196940d?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.8,
    location: 'Islamabad',
    features: ['Panoramic Sunroof', 'Wireless Charging', 'Drive Modes'],
    status: 'available'
  },
  {
    id: 'vh-9s5d1f3g',
    name: 'Changan Alsvin',
    type: 'Sedan',
    pricePerDay: 6500,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.5,
    location: 'Lahore',
    features: ['Sunroof', 'Cruise Control', 'TPMS'],
    status: 'available'
  },
  {
    id: 'vh-1r7t3y5u',
    name: 'MG HS',
    type: 'SUV',
    pricePerDay: 15000,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.7,
    location: 'Karachi',
    features: ['MG Pilot', 'Ambient Lighting', 'Sports Seats'],
    status: 'available'
  },
  {
    id: 'vh-2q6w4e8r',
    name: 'Kia Picanto',
    type: 'Hatchback',
    pricePerDay: 5000,
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 4,
    rating: 4.6,
    location: 'Peshawar',
    features: ['Compact Size', 'Modern Features', 'Easy Parking'],
    status: 'available'
  },
  {
    id: 'vh-3p5o7i1u',
    name: 'Hyundai Elantra',
    type: 'Sedan',
    pricePerDay: 10000,
    image: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.8,
    location: 'Lahore',
    features: ['Smart Trunk', 'Dual Zone AC', 'LED Headlights'],
    status: 'available'
  },
  {
    id: 'vh-4o9i2u6y',
    name: 'Toyota Hilux Revo',
    type: 'SUV',
    pricePerDay: 22000,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 5,
    rating: 4.9,
    location: 'Quetta',
    features: ['Heavy Duty', '4x4 Capability', 'Spacious Bed'],
    status: 'available'
  },
  {
    id: 'vh-5n8m2k4j',
    name: 'Suzuki Swift',
    type: 'Hatchback',
    pricePerDay: 6500,
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.7,
    location: 'Islamabad',
    features: ['Sporty Look', 'Push Start', 'Cruise Control'],
    status: 'available'
  },
  {
    id: 'vh-6m9n1b3v',
    name: 'Hyundai Sonata',
    type: 'Sedan',
    pricePerDay: 18000,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.9,
    location: 'Lahore',
    features: ['Luxury Interior', 'Head-up Display', 'Panoramic Roof'],
    status: 'available'
  },
  {
    id: 'vh-7l2k4j6h',
    name: 'Haval H6',
    type: 'SUV',
    pricePerDay: 16000,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.8,
    location: 'Karachi',
    features: ['L2 Autonomous Driving', '360 Camera', 'Large Screen'],
    status: 'available'
  },
  {
    id: 'vh-8k3j5h7g',
    name: 'Suzuki Bolan',
    type: 'Hatchback',
    pricePerDay: 3500,
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Manual',
    fuel: 'Petrol',
    seats: 7,
    rating: 4.0,
    location: 'Gujranwala',
    features: ['High Capacity', 'Low Maintenance', 'Utility Vehicle'],
    status: 'available'
  },
  {
    id: 'vh-9j1h3g5f',
    name: 'Prince Pearl',
    type: 'Hatchback',
    pricePerDay: 3800,
    image: 'https://images.unsplash.com/photo-1567808291548-fc3ee04dbac0?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Manual',
    fuel: 'Petrol',
    seats: 4,
    rating: 4.1,
    location: 'Sialkot',
    features: ['Power Windows', 'LCD Screen', 'Affordable'],
    status: 'available'
  },
  {
    id: 'vh-1i4u7y2t',
    name: 'United Bravo',
    type: 'Hatchback',
    pricePerDay: 3700,
    image: 'https://images.unsplash.com/photo-1567808291548-fc3ee04dbac0?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Manual',
    fuel: 'Petrol',
    seats: 4,
    rating: 4.0,
    location: 'Lahore',
    features: ['Reverse Camera', 'Alloy Wheels', 'Compact'],
    status: 'available'
  },
  {
    id: 'vh-2h9g6f3d',
    name: 'DFSK Glory 580',
    type: 'SUV',
    pricePerDay: 11000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 7,
    rating: 4.4,
    location: 'Islamabad',
    features: ['7 Seater', 'Sunroof', 'Turbocharged'],
    status: 'available'
  },
  {
    id: 'vh-3g6f9d2s',
    name: 'MG ZS',
    type: 'SUV',
    pricePerDay: 12000,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800&v=2',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    rating: 4.6,
    location: 'Karachi',
    features: ['Panoramic Sunroof', 'Leather Seats', 'Modern Tech'],
    status: 'available'
  }
];
