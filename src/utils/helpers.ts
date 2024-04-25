import { Locale } from 'date-fns';
import { map } from 'lodash-es';
import { Center, DEFAULT_OFFSET_X } from 'src/types';
import { twMerge } from 'tailwind-merge';
import { nl, fr, de } from 'date-fns/locale';

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

export const calculateDistance = (
    from: google.maps.LatLng | google.maps.LatLngLiteral,
    to: google.maps.LatLng | google.maps.LatLngLiteral
): number => {
    const distance = google.maps.geometry?.spherical.computeDistanceBetween(from, to);
    return distance ? distance / 1000 : 0;
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
    return offsetCenter(map, center, width > 768 ? DEFAULT_OFFSET_X : 0, 0, zoom);
};

export const localeMap = new Map<string, Locale>([
    ['nl', nl],
    ['fr', fr],
    ['de', de]
]);
