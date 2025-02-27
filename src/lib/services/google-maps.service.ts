import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  Client, 
  TravelMode, 
  TransitMode, 
  UnitSystem,
  TravelRestriction,
  TransitRoutingPreference
} from '@googlemaps/google-maps-services-js';
import { Address, GeocodingResult } from '../interfaces/address.interface';

interface GeocoderAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LatLngCoordinates {
  lat: number;
  lng: number;
}

export interface RouteOptions {
  travelMode?: TravelMode;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  routingPreference?: TransitRoutingPreference;
  transitMode?: TransitMode[];
  unitSystem?: UnitSystem;
}

export interface RouteWaypoint {
  location: string | Coordinates;
  stopover?: boolean;
}

export interface RouteResult {
  waypointOrder: number[];
  totalDistance: number;
  totalDuration: number;
  legs: Array<{
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    startLocation: { lat: number; lng: number };
    endLocation: { lat: number; lng: number };
    startAddress?: string;
    endAddress?: string;
    steps: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      instructions: string;
      travelMode: string;
    }>;
  }>;
  polyline?: string;
}

@Injectable()
export class GoogleMapsService {
  private readonly client: Client;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({});
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  /**
   * Convert an address to coordinates (forward geocoding)
   * @param address The address to geocode
   * @returns Geocoding result with coordinates and formatted address
   */
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

  /**
   * Convert coordinates to an address (reverse geocoding)
   * @param coordinates The coordinates to reverse geocode
   * @returns Geocoding result with address details
   */
  async reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult> {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${coordinates.latitude},${coordinates.longitude}`,
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
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };

      return {
        address: formattedAddress,
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
      };
    } catch (error) {
      throw new Error(`Reverse geocoding failed: ${error.message}`);
    }
  }

  /**
   * Convert GCS (Geographic Coordinate System) coordinates to address
   * @param gcsCoordinates The GCS coordinates in standard format
   * @returns Geocoding result with address details
   */
  async gcsToAddress(gcsCoordinates: string): Promise<GeocodingResult> {
    try {
      // Parse GCS coordinates (format can be adjusted based on your specific GCS format)
      const [latStr, lngStr] = gcsCoordinates.split(',').map(coord => coord.trim());
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid GCS coordinates format');
      }

      return this.reverseGeocode({ latitude, longitude });
    } catch (error) {
      throw new Error(`GCS to address conversion failed: ${error.message}`);
    }
  }

  /**
   * Optimize a route with multiple destinations
   * @param origin Starting location (coordinates or address)
   * @param destinations Array of destinations to visit
   * @param options Route options for customization
   * @param returnToOrigin Whether to return to the origin point
   * @returns Optimized route details
   */
  async optimizeRoute(
    origin: Coordinates | string,
    destinations: Array<Coordinates | string>,
    options: RouteOptions = {},
    returnToOrigin = true,
  ): Promise<RouteResult> {
    try {
      const originStr = typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`;
      
      // Format destinations as waypoints
      const waypoints = destinations.map(dest => {
        const destStr = typeof dest === 'string' ? dest : `${dest.latitude},${dest.longitude}`;
        return destStr;
      });

      // Set the destination (last point or back to origin)
      const destination = returnToOrigin ? originStr : waypoints.pop();

      // Ensure transitMode is an array if provided
      const transitModeArray = options.transitMode || undefined;

      const response = await this.client.directions({
        params: {
          origin: originStr,
          destination: destination,
          waypoints: waypoints.length > 0 ? waypoints : undefined,
          optimize: true,
          mode: options.travelMode || TravelMode.driving,
          avoid: this.buildAvoidanceArray(options),
          transit_routing_preference: options.routingPreference,
          transit_mode: transitModeArray,
          units: options.unitSystem,
          key: this.apiKey,
        },
      });

      if (!response.data.routes.length) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      const waypointOrder = route.waypoint_order;
      const legs = route.legs;
      const encodedPolyline = route.overview_polyline?.points;

      return {
        waypointOrder,
        totalDistance: legs.reduce((acc, leg) => acc + leg.distance.value, 0),
        totalDuration: legs.reduce((acc, leg) => acc + leg.duration.value, 0),
        legs: legs.map(leg => ({
          distance: leg.distance,
          duration: leg.duration,
          startLocation: leg.start_location,
          endLocation: leg.end_location,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          steps: leg.steps.map(step => ({
            distance: step.distance,
            duration: step.duration,
            instructions: step.html_instructions,
            travelMode: step.travel_mode,
          })),
        })),
        polyline: encodedPolyline,
      };
    } catch (error) {
      throw new Error(`Route optimization failed: ${error.message}`);
    }
  }

  /**
   * Optimize a route with multiple destinations using lat/lng format
   * @param origin Starting location in {lat, lng} format
   * @param destinations Array of destinations in {lat, lng} format
   * @param options Route options for customization
   * @param returnToOrigin Whether to return to the origin point
   * @returns Optimized route details
   */
  async optimizeRouteLatLng(
    origin: LatLngCoordinates,
    destinations: Array<LatLngCoordinates>,
    options: RouteOptions = {},
    returnToOrigin = true,
  ): Promise<RouteResult> {
    // Convert from {lat, lng} to {latitude, longitude} format
    const convertedOrigin: Coordinates = {
      latitude: origin.lat,
      longitude: origin.lng
    };
    
    const convertedDestinations: Coordinates[] = destinations.map(dest => ({
      latitude: dest.lat,
      longitude: dest.lng
    }));
    
    return this.optimizeRoute(convertedOrigin, convertedDestinations, options, returnToOrigin);
  }

  /**
   * Plan a route with specific preferences like scenic routes or less traffic
   * @param origin Starting location
   * @param destination Final destination
   * @param waypoints Optional stops along the route
   * @param options Route options including preferences
   * @returns Route details
   */
  async planRoute(
    origin: Coordinates | string,
    destination: Coordinates | string,
    waypoints: RouteWaypoint[] = [],
    options: RouteOptions = {},
  ): Promise<RouteResult> {
    try {
      const originStr = typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`;
      const destinationStr = typeof destination === 'string' ? destination : `${destination.latitude},${destination.longitude}`;
      
      // Format waypoints
      const formattedWaypoints = waypoints.map(wp => {
        const locationStr = typeof wp.location === 'string' 
          ? wp.location 
          : `${wp.location.latitude},${wp.location.longitude}`;
        return `${wp.stopover === false ? 'via:' : ''}${locationStr}`;
      });

      // Ensure transitMode is an array if provided
      const transitModeArray = options.transitMode || undefined;

      const response = await this.client.directions({
        params: {
          origin: originStr,
          destination: destinationStr,
          waypoints: formattedWaypoints.length > 0 ? formattedWaypoints : undefined,
          alternatives: true, // Request alternative routes
          mode: options.travelMode || TravelMode.driving,
          avoid: this.buildAvoidanceArray(options),
          transit_routing_preference: options.routingPreference,
          transit_mode: transitModeArray,
          units: options.unitSystem,
          key: this.apiKey,
        },
      });

      if (!response.data.routes.length) {
        throw new Error('No route found');
      }

      // Get the first route (could also return alternatives)
      const route = response.data.routes[0];
      const legs = route.legs;
      const encodedPolyline = route.overview_polyline?.points;

      return {
        waypointOrder: route.waypoint_order || [],
        totalDistance: legs.reduce((acc, leg) => acc + leg.distance.value, 0),
        totalDuration: legs.reduce((acc, leg) => acc + leg.duration.value, 0),
        legs: legs.map(leg => ({
          distance: leg.distance,
          duration: leg.duration,
          startLocation: leg.start_location,
          endLocation: leg.end_location,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          steps: leg.steps.map(step => ({
            distance: step.distance,
            duration: step.duration,
            instructions: step.html_instructions,
            travelMode: step.travel_mode,
          })),
        })),
        polyline: encodedPolyline,
      };
    } catch (error) {
      throw new Error(`Route planning failed: ${error.message}`);
    }
  }

  /**
   * Get a scenic route between two points
   * @param origin Starting location
   * @param destination Final destination
   * @param options Additional route options
   * @returns Route details optimized for scenic experience
   */
  async getScenicRoute(
    origin: Coordinates | string,
    destination: Coordinates | string,
    options: RouteOptions = {},
  ): Promise<RouteResult> {
    // For scenic routes, we avoid highways and prefer driving
    const scenicOptions: RouteOptions = {
      ...options,
      travelMode: TravelMode.driving,
      avoidHighways: true,
    };

    return this.planRoute(origin, destination, [], scenicOptions);
  }

  /**
   * Get a route optimized for less traffic
   * @param origin Starting location
   * @param destination Final destination
   * @param options Additional route options
   * @returns Route details optimized to avoid traffic
   */
  async getLowTrafficRoute(
    origin: Coordinates | string,
    destination: Coordinates | string,
    options: RouteOptions = {},
  ): Promise<RouteResult> {
    // For low traffic routes, we request alternatives and could
    // potentially select the one with the shortest duration
    const trafficOptions: RouteOptions = {
      ...options,
      travelMode: TravelMode.driving,
    };

    // In a real implementation, you might want to request departure_time
    // to get real-time traffic information, but that requires additional setup
    return this.planRoute(origin, destination, [], trafficOptions);
  }

  /**
   * Helper method to build the avoidance array for the directions API
   * @param options Route options with avoidance preferences
   * @returns Array of travel restrictions
   */
  private buildAvoidanceArray(options: RouteOptions): TravelRestriction[] {
    const avoidItems: TravelRestriction[] = [];
    
    if (options.avoidTolls) avoidItems.push(TravelRestriction.tolls);
    if (options.avoidHighways) avoidItems.push(TravelRestriction.highways);
    if (options.avoidFerries) avoidItems.push(TravelRestriction.ferries);
    
    return avoidItems;
  }

  private findAddressComponent(
    components: GeocoderAddressComponent[],
    type: string,
  ): string {
    const component = components.find(c => c.types.includes(type));
    return component ? component.long_name : '';
  }
} 