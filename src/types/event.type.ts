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
