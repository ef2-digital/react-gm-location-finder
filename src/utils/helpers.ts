import { Locale } from 'date-fns';
import { map } from 'lodash-es';
import { Center, DEFAULT_OFFSET_X } from 'src/types';
import { twMerge } from 'tailwind-merge';
import { nl, fr, de } from 'date-fns/locale';
import { getDistance } from 'geolib';

export const classNamesTailwind = (...args: (string | { [key: string]: boolean } | undefined)[]): string => {
    return args.reduce<string>((a: string, c) => {
        if (!c) {
            return a;
        }

        // prettier-ignore
        const cn =
            typeof c === 'string'
                ? c
                : classNamesTailwind(...Object.entries(c).filter(([_, value]) => value).map(([key]) => key));

        if (Boolean(cn.length)) {
            return Boolean(a.length) ? twMerge(a, cn) : cn;
        }

        return a;
    }, '');
};

export const notNull = <T extends object>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

/**
 * Calculate distance between two coordinates in kilometers using geolib.
 * More reliable than manual haversine or Google Maps geometry calculations.
 */
export const calculateDistance = (
    from: google.maps.LatLng | google.maps.LatLngLiteral | { lat: number; lng: number },
    to: google.maps.LatLng | google.maps.LatLngLiteral | { lat: number; lng: number }
): number => {
    const fromCoords = getCenterCoordinates(from);
    const toCoords = getCenterCoordinates(to);

    // getDistance returns meters, convert to kilometers
    const distanceInMeters = getDistance(
        { latitude: fromCoords.lat, longitude: fromCoords.lng },
        { latitude: toCoords.lat, longitude: toCoords.lng }
    );

    return distanceInMeters / 1000;
};

export const offsetCenter = (
    map: google.maps.Map,
    center: google.maps.LatLng | google.maps.LatLngLiteral,
    offsetX?: number,
    offsetY?: number,
    newZoom?: number
): google.maps.LatLng | google.maps.LatLngLiteral => {
    const zoom = newZoom ?? map.getZoom();
    const projection = map.getProjection();

    if (!projection || !zoom) {
        return center;
    }

    const worldCoordinateCenter = projection.fromLatLngToPoint(center);

    if (!worldCoordinateCenter) {
        return center;
    }

    const scale = Math.pow(2, zoom);
    const pixelOffset = new google.maps.Point(offsetX ? offsetX / scale : scale || 0, offsetY ? offsetY / scale : scale || 0);
    const worldCoordinateNewCenter = new google.maps.Point(worldCoordinateCenter.x - pixelOffset.x, worldCoordinateCenter.y);
    return projection.fromPointToLatLng(worldCoordinateNewCenter) ?? center;
};

export const defaultOffsetCenter = (map: google.maps.Map, center: Center, width: number, zoom?: number): Center => {
    return offsetCenter(map, center, 0, 0, zoom);
};

export const localeMap = new Map<string, Locale>([
    ['nl', nl],
    ['fr', fr],
    ['de', de]
]);
// Search params utilities for lat/lng/zoom
export const setLatLngSearchParams = (lat: number, lng: number, zoom?: number): void => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    params.set('lat', lat.toString());
    params.set('lng', lng.toString());
    if (zoom !== undefined) {
        params.set('zoom', zoom.toString());
    }

    window.history.replaceState({}, document.title, `${window.location.pathname}?${params.toString()}`);
};

export const getLatLngSearchParams = (): { lat: number; lng: number; zoom?: number } | null => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    const zoom = params.get('zoom');

    if (lat && lng) {
        return {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            zoom: zoom ? parseFloat(zoom) : undefined
        };
    }

    return null;
};

export const clearLatLngSearchParams = (): void => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    params.delete('lat');
    params.delete('lng');
    params.delete('zoom');

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;

    window.history.replaceState({}, document.title, newUrl);
};

// Helper to extract lat/lng from either LatLng objects or LatLngLiterals
export const getCenterCoordinates = (
    center: google.maps.LatLng | google.maps.LatLngLiteral | { lat: number; lng: number }
): { lat: number; lng: number } => {
    if (!center) {
        return { lat: 0, lng: 0 };
    }

    // Check if it's a LatLng object (has methods)
    if (typeof (center as google.maps.LatLng).lat === 'function') {
        return {
            lat: (center as google.maps.LatLng).lat(),
            lng: (center as google.maps.LatLng).lng()
        };
    }

    // Otherwise it's a LatLngLiteral or our Center type with properties
    return {
        lat: (center as google.maps.LatLngLiteral).lat,
        lng: (center as google.maps.LatLngLiteral).lng
    };
};
