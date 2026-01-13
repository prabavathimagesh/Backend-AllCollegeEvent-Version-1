import { Request } from "express";
import { Prisma } from "@prisma/client";

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
  identity: string;
  roleId: number;
  email: string;
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