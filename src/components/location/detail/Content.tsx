import { LocationProps } from '../../../contexts/locationFinderContext';

const Content = ({
  location,
  className,
}: {
  location: LocationProps;
  className?: string;
}) => {
  return (
    <div className={className}>
      <div className="mt-4 md:overflow-auto flex-grow">
        <strong className="mb-4 block truncate text-lg font-extrabold leading-none text-dark">
          {location.title}
        </strong>
        {/* prettier-ignore */}
        <address className="flex flex-col font-medium not-italic leading-6 text-sm">
                <span>{location.street},</span>
                 <span>{location.city}</span>
                 {location.phone && <span>Tel: <a className='underline' href={`tel:${location.phone}`}>{location.phone}</a></span>}
                 {location.email && <span>E-mail: <a className='underline' href={`mailto:${location.email}`}>{location.email}</a></span>}
             </address>
      </div>
    </div>
  );
};

export default Content;
