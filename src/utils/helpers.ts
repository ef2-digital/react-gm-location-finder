import { twMerge } from 'tailwind-merge';

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
    offsetY?: number
): google.maps.LatLng | google.maps.LatLngLiteral => {
    const zoom = map.getZoom();
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
