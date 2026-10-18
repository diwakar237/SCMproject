export type UserRole = 'CUSTOMER' | 'VENUE_OWNER' | 'VENDOR' | 'EVENT_ORGANIZER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Venue {
  id: number;
  ownerId: number;
  ownerName: string;
  name: string;
  city: string;
  address: string;
  description: string;
  category: string;
  capacity: number;
  basePricePerDay: number;
  cleaningFee: number;
  rating: number;
  reviewCount: number;
  supportedEventTypes: string;
  facilities: string;
  imageUrls: string;
  approved: boolean;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
export type TimeSlot = 'FULL_DAY' | 'MORNING' | 'EVENING';

export interface StatusHistory {
  id: number;
  fromStatus?: BookingStatus;
  toStatus: BookingStatus;
  changedByName: string;
  remarks: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  bookingReference: string;
  venueId: number;
  venueName: string;
  venueCity: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  eventDate: string;
  timeSlot: TimeSlot;
  eventType: string;
  guestCount: number;
  baseCost: number;
  serviceFee: number;
  totalCost: number;
  status: BookingStatus;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  history?: StatusHistory[];
}

export interface VenueAvailability {
  venueId: number;
  date: string;
  available: boolean;
  bookedSlots: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
