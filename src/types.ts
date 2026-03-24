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
  type: 'Sedan' | 'SUV' | 'Hatchback' | 'Luxury';
  pricePerDay: number;
  image: string;
  transmission: 'Automatic' | 'Manual';
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  seats: number;
  rating: number;
  location: string;
  features: string[];
  status: 'available' | 'rented' | 'maintenance';
  description?: string;
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
  destination?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'promotion' | 'info' | 'invitation';
  read: boolean;
  createdAt: string;
  link?: string;
  invitationId?: string;
}

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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
    id: '7',
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
    id: '8',
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
    id: '9',
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
    id: '10',
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
    id: '11',
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
    id: '12',
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
    id: '13',
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
    id: '14',
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
    id: '15',
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
    id: '16',
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
    id: '17',
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
    id: '18',
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
    id: '19',
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
    id: '20',
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
    id: '21',
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
    id: '22',
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
    id: '23',
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
    id: '24',
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
