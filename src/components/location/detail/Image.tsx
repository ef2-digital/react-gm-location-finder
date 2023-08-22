import { LocationProps } from '../../../contexts/locationFinderContext';
import { classNamesTailwind } from '../../../utils/helpers';

const Image = ({
  location,
  className,
}: {
  location: LocationProps;
  className?: string;
}) => {
  const image =
    location?.image && Boolean(location.image.length)
      ? location?.image[0]
      : undefined;

  if (!image) {
    return <></>;
  }

  return (
    <img
      className={classNamesTailwind(
        'aspect-[4/2] object-cover object-center w-full rounded',
        className
      )}
      src={image}
    />
  );
};

export default Image;
