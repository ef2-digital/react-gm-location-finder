export type Location<T extends object = {}> = T & {
    id: string;
    position: google.maps.LatLngLiteral;
};

export const DEFAULT_ZOOM = 8;

export const DEFAULT_CENTER: google.maps.LatLngLiteral = {
    lat: 52.370216,
    lng: 4.895168
};

export const DEFAULT_BOUNDS: google.maps.LatLngBoundsLiteral = {
    east: 7.5,
    north: 53.7,
    south: 50.6,
    west: 3.1
};

export type Center = google.maps.LatLng | google.maps.LatLngLiteral;
export type Bounds = google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;