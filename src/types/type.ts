import { Request } from "express";
import { Prisma } from "@prisma/client";
import { EventMode } from "@prisma/client";

// types

export interface EventType {
  identity: string;
  id: number;
  title: string;
  description?: string | null;
  bannerImage?: string | null;
  venueName?: string | null;
  mode?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  venue?: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  orgIdentity: string;
  createdBy?: number | null;

  org?: {
    organizationName: string;
  };
}

export interface DecodedToken {
  id: number;
  identity: string;
  email: string;
  roleId: string;
  type: "user" | "org";
  iat?: number;
  exp?: number;
}

export interface JwtPayload {
  identity: string;
  email: string;
  roleId?: string | null;
  type?: string;
  iat?: number;
  exp?: number;
}

export interface UserType {
  identity: string;
  id: string;

  name: string;
  email: string;
  password?: string;

  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  profileImage?: string;

  isActive: boolean;
  isDeleted: boolean;

  createdAt: Date;
  lastLoginAt?: Date;

  roleId?: number;
}

export interface AceCategory {
  identity: string;
  categoryName: string;
}

export interface AuthRequest extends Request {
  user: {
    id: number;
    identity: string;
  };
}

export type Platform = "web" | "mobile";

/**
 * Prisma payload type for Event with all required relations
 */
export type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    org: true;
    cert: true;
    location: true;
    calendars: true;
    tickets: true;
    eventPerks: {
      include: { perk: true };
    };
    eventAccommodations: {
      include: { accommodation: true };
    };
    Collaborator: {
      include: {
        member: true;
        org: true;
      };
    };
  };
}>;

export type AssetItem = {
  identity: string;
  color?: string;
};

export interface EventFilterDTO {
  // 1. Events filter (trending/featured)
  eventTypes?: ('trending' | 'featured')[];
  trendingThreshold?: number; // viewCount threshold for trending
  
  // 2. Mode
  modes?: EventMode[]; // OFFLINE, ONLINE, HYBRID
  
  // 3. Location (single choice)
  country?: string;
  state?: string;
  city?: string;
  
  // 4. Certification (single choice)
  certIdentity?: string;
  
  // 5. Perks (multi choice)
  perkIdentities?: string[];
  
  // 6. Accommodation (multi choice)
  accommodationIdentities?: string[];
  
  // 7. Type (single choice)
  eventTypeIdentity?: string;
  
  // 8. Eligible department (multi choice)
  eligibleDeptIdentities?: string[];
  
  // 9. Date range
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  
  // 10. Pricing
  priceRange?: {
    min?: number;
    max?: number;
  };
  
  // 11. Search (title AND tags combined)
  searchText?: string;
  
  // 12. Sorting
  sortBy?: 'viewCount' | 'titleAsc' | 'titleDesc' | 'recentlyAdded';
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface FilterResult {
  events: any[];
  total: number;
  executionTime: number;
}
