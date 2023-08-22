const LIBRARIES: ('geometry' | 'places')[] = ['places', 'geometry'];
const DEFAULT_ZOOM = 8;

const BOUNDS_NETHERLANDS: google.maps.LatLngBoundsLiteral = {
  east: 7.5,
  north: 53.7,
  south: 50.6,
  west: 3.1,
};

const DEFAULT_CENTER: google.maps.LatLngLiteral = {
  lat: 52.370216,
  lng: 4.895168,
};

export { LIBRARIES, DEFAULT_ZOOM, BOUNDS_NETHERLANDS, DEFAULT_CENTER };
