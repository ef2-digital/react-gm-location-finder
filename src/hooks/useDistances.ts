export const useDistances = () => {
  const calculateDistance = (
    from: google.maps.LatLng | google.maps.LatLngLiteral,
    to: google.maps.LatLng | google.maps.LatLngLiteral
  ): number => {
    return (
      google.maps.geometry?.spherical.computeDistanceBetween(from, to) / 1000
    );
  };

  return { calculateDistance };
};
