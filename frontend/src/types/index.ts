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

// Stage 2: Recommendations
export interface RecommendationRequest {
  eventType?: string;
  targetCity?: string;
  guestCount: number;
  maxBudget?: number;
  date?: string;
  timeSlot?: TimeSlot;
  preferredFacilities?: string[];
}

export interface ScoreBreakdown {
  overallScore: number;
  budgetScore: number;
  locationScore: number;
  capacityScore: number;
  eventTypeScore: number;
  facilitiesScore: number;
  availabilityScore: number;
}

export interface RecommendationResult {
  venue: Venue;
  scoreBreakdown: ScoreBreakdown;
  plainExplanation: string;
  matchingHighlights: string[];
}

// Stage 2: Budgets
export interface EventBudget {
  id: number;
  userId: number;
  userName?: string;
  eventTitle: string;
  totalLimit: number;
  venueCost: number;
  cateringCost: number;
  decorationCost: number;
  photographyCost: number;
  entertainmentCost: number;
  otherCost: number;
  subtotal: number;
  contingencyPercent: number;
  contingencyAmount: number;
  totalEstimatedCost: number;
  variance: number;
  isOverBudget: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRequest {
  eventTitle: string;
  totalLimit: number;
  venueCost?: number;
  cateringCost?: number;
  decorationCost?: number;
  photographyCost?: number;
  entertainmentCost?: number;
  otherCost?: number;
  contingencyPercent?: number;
  currency?: string;
}

// Stage 2: Parking Assistance
export type ParkingDataSource = 'SENSOR' | 'MANUAL' | 'SIMULATED_DEMO' | 'PREDICTED';

export interface ParkingHistoryItem {
  id: number;
  occupiedSpots: number;
  dataSource: ParkingDataSource;
  recordedAt: string;
}

export interface ParkingLot {
  id: number;
  venueId: number;
  lotName: string;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  occupancyPercent: number;
  dataSource: ParkingDataSource;
  lastUpdatedAt: string;
  suggestedArrivalWindow: string;
  recentHistory?: ParkingHistoryItem[];
}

export interface ParkingPrediction {
  lotId: number;
  lotName: string;
  totalSpots: number;
  predictedOccupiedSpots: number;
  predictedAvailableSpots: number;
  predictedOccupancyPercent: number;
  dataSource: ParkingDataSource;
  predictionBasis: string;
  suggestedArrivalWindow: string;
}
