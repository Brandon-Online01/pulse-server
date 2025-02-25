import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
import { Address, GeocodingResult } from '../interfaces/address.interface';

@Injectable()
export class GoogleMapsService {
  private readonly client: Client;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({});
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });

      if (response.data.results.length === 0) {
        throw new Error('No results found');
      }

      const result = response.data.results[0];
      const addressComponents = result.address_components;

      const formattedAddress: Address = {
        streetNumber: this.findAddressComponent(addressComponents, 'street_number'),
        street: this.findAddressComponent(addressComponents, 'route'),
        suburb: this.findAddressComponent(addressComponents, 'sublocality'),
        city: this.findAddressComponent(addressComponents, 'locality'),
        province: this.findAddressComponent(addressComponents, 'administrative_area_level_1'),
        state: this.findAddressComponent(addressComponents, 'administrative_area_level_1'),
        country: this.findAddressComponent(addressComponents, 'country'),
        postalCode: this.findAddressComponent(addressComponents, 'postal_code'),
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };

      return {
        address: formattedAddress,
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
      };
    } catch (error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  async optimizeRoute(
    origin: { lat: number; lng: number },
    destinations: Array<{ lat: number; lng: number }>,
    waypoints?: Array<{ lat: number; lng: number }>,
  ) {
    try {
      const response = await this.client.directions({
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${origin.lat},${origin.lng}`, // Return to origin
          waypoints: destinations.map(d => `${d.lat},${d.lng}`),
          optimize: true,
          mode: TravelMode.driving,
          key: this.apiKey,
        },
      });

      if (!response.data.routes.length) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      const waypointOrder = route.waypoint_order;
      const legs = route.legs;

      return {
        waypointOrder,
        totalDistance: legs.reduce((acc, leg) => acc + leg.distance.value, 0),
        totalDuration: legs.reduce((acc, leg) => acc + leg.duration.value, 0),
        legs: legs.map(leg => ({
          distance: leg.distance,
          duration: leg.duration,
          startLocation: leg.start_location,
          endLocation: leg.end_location,
          steps: leg.steps,
        })),
      };
    } catch (error) {
      throw new Error(`Route optimization failed: ${error.message}`);
    }
  }

  private findAddressComponent(
    components: google.maps.GeocoderAddressComponent[],
    type: string,
  ): string {
    const component = components.find(c => c.types.includes(type));
    return component ? component.long_name : '';
  }
} 