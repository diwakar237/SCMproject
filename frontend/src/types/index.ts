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

// Stage 3: Vendors & Services
export type VendorBookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface VendorServiceItem {
  id: number;
  vendorId: number;
  serviceName: string;
  description: string;
  price?: number;
  basePrice?: number;
  packageTier?: string;
  priceUnit?: string;
}

export interface Vendor {
  id: number;
  userId: number;
  businessName: string;
  category: string;
  city: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  rating: number;
  reviewCount: number;
  approved: boolean;
  services?: VendorServiceItem[];
}

export interface VendorBooking {
  id: number;
  vendorId: number;
  vendorName: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  serviceId?: number;
  serviceName?: string;
  eventDate: string;
  status: VendorBookingStatus;
  guestCount?: number;
  totalCost?: number;
  totalPrice?: number;
  requirements?: string;
  rejectionReason?: string;
  createdAt: string;
}

// Stage 3: Event Planner & Schedule
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskCategory = 'VENUE' | 'CATERING' | 'DECOR' | 'LOGISTICS' | 'GUESTS' | 'ENTERTAINMENT' | 'OTHER';

export interface PlannerTask {
  id: number;
  userId: number;
  bookingId?: number;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  deadlineDate?: string;
  eventTimeSlot?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Stage 3: Events & RSVP
export type RsvpStatus = 'ATTENDING' | 'DECLINED' | 'PENDING';

export interface EventGuest {
  id: number;
  eventId: number;
  guestName: string;
  guestEmail: string;
  invitationToken: string;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  dietaryRequirements?: string;
  notes?: string;
  respondedAt?: string;
}

export interface EventEntity {
  id: number;
  userId: number;
  bookingId?: number;
  title: string;
  description?: string;
  eventType: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  locationName: string;
  locationAddress?: string;
  dressCode?: string;
  guests?: EventGuest[];
  createdAt: string;
}

export interface PublicInvitation {
  invitationToken: string;
  eventTitle: string;
  description?: string;
  eventType: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  locationName: string;
  locationAddress?: string;
  dressCode?: string;
  guestName: string;
  guestEmail: string;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  dietaryRequirements?: string;
}

// Stage 3: Reviews
export interface Review {
  id: number;
  userId: number;
  userName: string;
  bookingId: number;
  venueId: number;
  rating: number;
  cleanlinessRating?: number;
  staffRating?: number;
  valueRating?: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

// Stage 3: Payments
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: number;
  bookingId: number;
  bookingReference: string;
  venueName: string;
  userId: number;
  userEmail: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  paymentProvider: string;
  transactionReference: string;
  receiptNumber: string;
  createdAt: string;
}

// Stage 3: Notifications
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Stage 3: Admin Dashboard
export interface AdminStats {
  totalUsers: number;
  totalVenues: number;
  totalBookings: number;
  totalConfirmedRevenue: number;
  pendingBookingsCount: number;
  pendingVenuesCount: number;
  pendingVendorsCount: number;
  totalReviews: number;
  recentAuditLogs: Array<{
    id: number;
    actorEmail: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: string;
    createdAt: string;
  }>;
}
