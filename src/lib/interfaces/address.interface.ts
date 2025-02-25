export interface Address {
  streetNumber: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  placeId?: string; // Google Maps Place ID
}

export interface GeocodingResult {
  address: Address;
  placeId: string;
  formattedAddress: string;
} 