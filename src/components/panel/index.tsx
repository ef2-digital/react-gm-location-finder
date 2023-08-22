import { useContext, useEffect, useRef } from 'react';
import { classNamesTailwind } from '../../utils/helpers';
import AutocompletePanel from './AutocompletePanel';
import Panel from './Panel';
import {
  LocationFinderContext,
  LocationProps,
} from '../../contexts/locationFinderContext';
import ListItem from '../location/ListItem';
import DetailItem from '../location/DetailItem';
import { SettingContext } from '../../contexts/settingContext';

const LocationFinderPanel = ({ locations }: { locations: LocationProps[] }) => {
  const { renders, classNames } = useContext(SettingContext);

  const {
    refinedLocations,
    selectedLocation,
    setRefinedLocations,
    setLocations,
  } = useContext(LocationFinderContext);

  useEffect(() => {
    setRefinedLocations(locations);
    setLocations(locations);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    panelHeaderTopSlot,
    panelHeaderBottomSlot,
    renderListItem,
    renderListDetail,
  } = renders ?? {};

  return (
    <Panel>
      {selectedLocation ? (
        renderListDetail ? (
          renderListDetail({ location: selectedLocation })
        ) : (
          <DetailItem />
        )
      ) : (
        <>
          <Panel.Heading>
            {(panelHeaderTopSlot &&
              panelHeaderTopSlot({
                numberOfLocations: refinedLocations.length,
              })) ?? (
              <Panel.HeadingTop numberOfLocations={refinedLocations.length} />
            )}
            <AutocompletePanel ref={inputRef} />
            {panelHeaderBottomSlot &&
              panelHeaderBottomSlot({
                numberOfLocations: refinedLocations.length,
              })}
          </Panel.Heading>
          <Panel.Body>
            <ul
              className={classNamesTailwind(
                'overflow-y-auto divide-y',
                classNames?.list?.overview
              )}
            >
              {refinedLocations &&
                refinedLocations.map((listLocation: LocationProps) =>
                  renderListItem ? (
                    renderListItem({ location: listLocation })
                  ) : (
                    <ListItem
                      location={listLocation}
                      key={listLocation.id}
                      showOpeningHours={true}
                    />
                  )
                )}
            </ul>
          </Panel.Body>
        </>
      )}
    </Panel>
  );
};

export default LocationFinderPanel;
