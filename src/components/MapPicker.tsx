import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Modal } from './ui/Modal';
import { Search, MapPin, Crosshair } from 'lucide-react';
import L from 'leaflet';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onClose: () => void;
}

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export function MapPicker({ onLocationSelect, onClose }: MapPickerProps) {
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          handleLocationSelect(latitude, longitude);
        },
        () => {
          setMapCenter([51.505, -0.09]);
        }
      );
    }
  }, []);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setSelectedLocation([lat, lon]);
        setMapCenter([lat, lon]);
        setAddress(data[0].display_name);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedLocation && address) {
      onLocationSelect(selectedLocation[0], selectedLocation[1], address);
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      className="!z-[60]"
    >
      <div className="p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <MapPin className="w-6 h-6 text-orange-500 mr-2" />
            Pick Location
          </h2>
          <button
            onClick={handleCurrentLocation}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
          >
            <Crosshair className="w-4 h-4" />
            <span>Use Current Location</span>
          </button>
        </div>
        
        <div className="mb-4 flex space-x-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter address or click on the map..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="h-[400px] mb-4 rounded-xl overflow-hidden border border-gray-200">
          <MapContainer
            center={mapCenter}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker onLocationSelect={handleLocationSelect} />
            <MapController center={mapCenter} />
          </MapContainer>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 bg-orange-500 text-white rounded-xl transition-colors ${
              !selectedLocation || !address
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-orange-600'
            }`}
            disabled={!selectedLocation || !address}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </Modal>
  );
}