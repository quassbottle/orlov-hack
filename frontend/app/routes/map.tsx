import { LatLngTuple } from "leaflet";
import { ClientOnly } from "remix-utils/client-only";
import InteractiveMap from "~/lib/.client/components/InteractiveMap";

export default function FullScreenMap() {
    const mockedUserLocation: LatLngTuple = [55.7558, 37.6173]; // Москва
    const mockedMarkers: LatLngTuple[] = [
      [55.751244, 37.618423],
      [55.760186, 37.618711],
    ];
  
    return (
      <div className="h-[calc(100vh-150px)] w-full overflow-hidden">
        <div className="relative w-full h-full">
          <ClientOnly>
            {() => (
              <InteractiveMap
                className="w-full h-full"
                userLocation={mockedUserLocation}
                markers={mockedMarkers}
              />
            )}
          </ClientOnly>
        </div>
      </div>
    );
  }
  