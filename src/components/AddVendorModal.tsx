import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { supabase } from '../lib/supabase';
import { MapPin } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVendorAdded: () => void;
}

export function AddVendorModal({ isOpen, onClose, onVendorAdded }: AddVendorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    cuisine: '',
    lat: '',
    lng: '',
    phone: '',
    email: '',
    price_range: '1',
    opening_time: '09:00',
    closing_time: '17:00',
    menu_items: [{ name: '', price: '' }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from('vendors').insert({
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      user_id: userData.user.id,
    });

    if (!error) {
      onVendorAdded();
      onClose();
      setFormData({
        name: '',
        description: '',
        image: '',
        cuisine: '',
        lat: '',
        lng: '',
        phone: '',
        email: '',
        price_range: '1',
        opening_time: '09:00',
        closing_time: '17:00',
        menu_items: [{ name: '', price: '' }],
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menu_items: [...formData.menu_items, { name: '', price: '' }],
    });
  };

  const updateMenuItem = (index: number, field: 'name' | 'price', value: string) => {
    const newMenuItems = [...formData.menu_items];
    newMenuItems[index][field] = value;
    setFormData({ ...formData, menu_items: newMenuItems });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-800">Add New Vendor</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Image
            </label>
            <ImageUpload
              onUpload={(url) => setFormData({ ...formData, image: url })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Type
              </label>
              <input
                type="text"
                required
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <select
              value={formData.price_range}
              onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            >
              <option value="1">$ (Under $10)</option>
              <option value="2">$$ ($11-$30)</option>
              <option value="3">$$$ ($31-$60)</option>
              <option value="4">$$$$ (Above $60)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Time
              </label>
              <input
                type="time"
                required
                value={formData.opening_time}
                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Closing Time
              </label>
              <input
                type="time"
                required
                value={formData.closing_time}
                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                required
                placeholder="Latitude"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
              <input
                type="number"
                step="any"
                required
                placeholder="Longitude"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="mt-2 text-orange-600 hover:text-orange-700 text-sm"
            >
              Use Current Location
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Menu Items
            </label>
            {formData.menu_items.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addMenuItem}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              + Add Menu Item
            </button>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Add Vendor
          </button>
        </form>
      </div>
    </Modal>
  );
}