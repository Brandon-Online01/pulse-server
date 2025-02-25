export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface RouteStop {
  clientId: number;
  taskId: number;
  location: Location;
  estimatedArrivalTime?: Date;
}

export interface OptimizedRoute {
  userId: number;
  stops: RouteStop[];
  totalDistance: number;
  estimatedDuration: number;
} 