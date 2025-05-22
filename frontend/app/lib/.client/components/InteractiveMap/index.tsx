import L, { LatLngBounds, LatLngTuple } from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import { useEffect, useState, useRef, useImperativeHandle } from 'react';
import 'leaflet/dist/leaflet.css';
import CustomZoomControl from '~/components/ui/zoom';

L.Control.Attribution.prototype.options.prefix = '';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});

interface InteractiveMapProps {
  className?: string;
  userLocation?: LatLngTuple | null;
  markers?: LatLngTuple[];
  mapRef?: React.RefObject<L.Map>;
}

const InteractiveMap = ({
  className = 'h-full w-full',
  userLocation = null,
  markers = [],
  mapRef,
}: InteractiveMapProps) => {
  const [center] = useState<LatLngTuple>([53.195, 45.004]);
  const localMapRef = useRef<L.Map>(null);

  useImperativeHandle(mapRef, () => localMapRef.current!, [localMapRef.current]);

  const allPoints = userLocation ? [...markers, userLocation] : markers;

  useEffect(() => {
    if (localMapRef.current && allPoints.length > 0) {
      const bounds = new LatLngBounds(allPoints);
      localMapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [JSON.stringify(allPoints)]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      minZoom={2}
      maxZoom={18}
      scrollWheelZoom
      className={className}
      ref={localMapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=""
      />

      {markers.map((position, index) => (
        <Marker key={`marker-${index}`} position={position} icon={DefaultIcon}>
          <Popup>
            <span className="font-medium">Отметка {index + 1}</span>
          </Popup>
        </Marker>
      ))}

      {userLocation && (
        <Marker position={userLocation} icon={DefaultIcon}>
          <Popup>
            <span className="font-medium">Локация пользователя</span>
          </Popup>
        </Marker>
      )}

      <CustomZoomControl />
    </MapContainer>
  );
};

export default InteractiveMap;