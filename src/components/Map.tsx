import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Vendor } from '../types/vendor';
import { GlassCard } from './ui/GlassCard';
import { Star, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const MAPBOX_API_KEY = 'pk.eyJ1IjoicnVkcmFzaW5naDUiLCJhIjoiY200dzVpeGh1MGFveDJpb2pxaGRkZ3E5bSJ9._ykAoaDDzpU35vfjS4jEfg';

// New Delhi coordinates
const DEFAULT_CENTER = [28.6139, 77.2090];
const DEFAULT_ZOOM = 13;

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          map.setView([latitude, longitude], 16);
        },
        () => {
          map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
        }
      );
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [map]);

  return position ? (
    <>
      {/* Accuracy circle */}
      <Circle
        center={position}
        pathOptions={{ 
          color: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 0.1,
          weight: 1
        }}
        radius={30}
      />
      {/* Location dot */}
      <Circle
        center={position}
        pathOptions={{ 
          color: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 1,
          weight: 2
        }}
        radius={8}
      />
    </>
  ) : null;
}

interface MapProps {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
}

export function Map({ vendors, selectedVendor }: MapProps) {
  const isOpen = (vendor: Vendor) => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openingTime = parseInt(vendor.openingTime?.replace(':', '') || '0900');
    const closingTime = parseInt(vendor.closingTime?.replace(':', '') || '1700');
    return currentTime >= openingTime && currentTime <= closingTime;
  };

  return (
    <GlassCard className="h-full overflow-hidden">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        <LocationMarker />
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`}
          attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          maxZoom={18}
          tileSize={512}
          zoomOffset={-1}
        />
        {vendors.map((vendor) => (
          <Marker
            key={vendor.id}
            position={[vendor.lat, vendor.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{vendor.name}</h3>
                  <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-orange-500 fill-current" />
                    <span className="text-orange-500 font-medium">{vendor.rating}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isOpen(vendor) ? 'text-green-600' : 'text-red-600'}`}>
                    {isOpen(vendor) ? 'Open Now' : 'Closed'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{vendor.cuisine}</p>
                <button 
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
                  onClick={() => window.open(`https://maps.google.com/?q=${vendor.lat},${vendor.lng}`)}
                >
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </GlassCard>
  );
}