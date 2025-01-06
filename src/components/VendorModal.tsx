import React from 'react';
import { Star, Clock, MapPin, Utensils, DollarSign } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Vendor } from '../types/vendor';

interface VendorModalProps {
  vendor: Vendor | null;
  onClose: () => void;
}

export function VendorModal({ vendor, onClose }: VendorModalProps) {
  if (!vendor) return null;

  const openingHours = {
    Monday: '11:00 AM - 9:00 PM',
    Tuesday: '11:00 AM - 9:00 PM',
    Wednesday: '11:00 AM - 9:00 PM',
    Thursday: '11:00 AM - 9:00 PM',
    Friday: '11:00 AM - 10:00 PM',
    Saturday: '12:00 PM - 10:00 PM',
    Sunday: '12:00 PM - 8:00 PM',
  };

  const popularItems = [
    { name: 'Al Pastor Tacos', price: '$3.50' },
    { name: 'Carne Asada Burrito', price: '$9.00' },
    { name: 'Horchata', price: '$3.00' },
  ];

  return (
    <Modal isOpen={!!vendor} onClose={onClose}>
      <div className="overflow-hidden">
        <img
          src={vendor.image}
          alt={vendor.name}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{vendor.name}</h2>
            <div className="flex items-center space-x-1 px-3 py-1 bg-orange-100 rounded-full">
              <Star className="w-5 h-5 text-orange-500 fill-current" />
              <span className="font-semibold text-orange-500">{vendor.rating}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-600 mb-6">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              2.5km away
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Open Now
            </span>
            <span className="flex items-center">
              <Utensils className="w-4 h-4 mr-1" />
              {vendor.cuisine}
            </span>
            <span className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Cash Only
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">About</h3>
            <p className="text-gray-600">{vendor.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Popular Items</h3>
            <div className="space-y-2">
              {popularItems.map((item) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-600 font-medium">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Hours</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(openingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="text-gray-600 font-medium">{day}</span>
                  <span className="text-gray-700">{hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${vendor.location.lat},${vendor.location.lng}`)}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}