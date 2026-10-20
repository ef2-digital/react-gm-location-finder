# @ef2/react-gm-location-finder

React components and hooks for a Google Maps location finder: a map with markers, a places search,
a location list with load-more, cards and opening hours.

## Installation (2.x)

2.x runs on React 19 and HeroUI 3, styled with Tailwind 4. HeroUI's own peer dependencies have to
be installed by the consumer as well, because Yarn 1 does not install peers by itself:

```bash
yarn add @ef2/react-gm-location-finder @react-google-maps/api @heroui/react @heroui/styles \
  react-aria react-aria-components @internationalized/date @react-aria/ssr @react-aria/utils
```

In the Tailwind 4 stylesheet of the consumer:

```css
@import 'tailwindcss';
@import '@heroui/styles';
@source '../node_modules/@ef2/react-gm-location-finder/dist';
```

The `@source` path is relative to the stylesheet. Without that line the Tailwind classes this
package uses are never generated, and the components render unstyled without any error.

## Usage

Wrap the part of the application that shows the finder in `LocationFinderProvider`, once the Google
Maps script has loaded:

```tsx
import { useJsApiLoader } from '@react-google-maps/api';
import { LocationFinderProvider } from '@ef2/react-gm-location-finder';

const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_API_KEY',
    libraries: ['places', 'geometry'],
    language: 'nl',
    region: 'nl',
});

<LocationFinderProvider loading={!isLoaded} locations={locations}>
    {children}
</LocationFinderProvider>;
```

Inside it, `useLocationFinder`, `usePlacesFinder` and `useLoadMore` drive the search and the list,
and `Map`, `Markers`, `Card`, `OpeningHours` and `OpeningHourLabel` render it.

## Upgrading from 1.x

The props of the package's own components (`location`, `locale`, the `label*` props) are unchanged.
The props two components inherit from the UI library have changed with it:

- `OpeningHourLabel` extends HeroUI 3's `ChipProps`. `color` takes `default`, `accent`, `success`,
  `warning` or `danger`; `variant` takes `primary`, `secondary`, `tertiary` or `soft`; `size` takes
  `sm`, `md` or `lg`. NextUI's `variant="dot"` and `"flat"`, `radius`, `startContent`,
  `endContent`, `avatar`, `classNames` and `onClose` no longer exist. Use `className` for styling.
- `OpeningHours` extends HeroUI 3's `Table`, which is a wrapper around the table. Props on the
  component itself land on that wrapper (`className`, `variant`). Props for the table element, such
  as `aria-label`, `selectionMode` or `onSelectionChange`, go in `contentProps`. NextUI's
  `classNames`, `removeWrapper`, `isStriped`, `isCompact` and `color` no longer exist.
- `@nextui-org/react` and `framer-motion` are no longer peer dependencies; `@heroui/react` 3 is.
