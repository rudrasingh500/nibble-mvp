import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { supabase } from '../lib/supabase';
import { MapPin, Plus, Minus, Clock, DollarSign, Phone, Mail, Globe } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { OperatingHours, MenuItem } from '../types/vendor';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVendorAdded: () => void;
}

const initialFormData = {
  name: '',
  description: '',
  image: '',
  cuisine: '',
  lat: '',
  lng: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  price_range: '1',
  operating_hours: [
    { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Saturday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Sunday', isOpen: false, openTime: '', closeTime: '' }
  ],
  menu_items: [{ name: '', price: '', description: '' }]
};

export function AddVendorModal({ isOpen, onClose, onVendorAdded }: AddVendorModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [locationType, setLocationType] = useState<'current' | 'manual' | null>(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            setFormData({
              ...formData,
              lat: latitude.toString(),
              lng: longitude.toString(),
              address: data.display_name || ''
            });
          } catch (error) {
            console.error('Error getting address:', error);
            setFormData({
              ...formData,
              lat: latitude.toString(),
              lng: longitude.toString()
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from('vendors').insert({
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      user_id: userData.user.id,
      price_range: parseInt(formData.price_range),
      rating: 0
    });

    if (!error) {
      onVendorAdded();
      onClose();
      setFormData(initialFormData);
      setLocationType(null);
    }
  };

  const updateOperatingHours = (index: number, field: keyof OperatingHours, value: any) => {
    const newHours = [...formData.operating_hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData({ ...formData, operating_hours: newHours });
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menu_items: [...formData.menu_items, { name: '', price: '', description: '' }]
    });
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const newItems = [...formData.menu_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, menu_items: newItems });
  };

  const removeMenuItem = (index: number) => {
    const newItems = formData.menu_items.filter((_, i) => i !== index);
    setFormData({ ...formData, menu_items: newItems });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-800">Add New Vendor</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
            <div className="space-y-4">
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
            </div>
          </section>

          {/* Contact Info Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Location</h3>
            <div className="space-y-4">
              <select
                value={locationType || ''}
                onChange={(e) => {
                  const value = e.target.value as 'current' | 'manual' | '';
                  setLocationType(value || null);
                  if (value === 'current') {
                    getCurrentLocation();
                  } else if (value === '') {
                    setFormData({
                      ...formData,
                      lat: '',
                      lng: '',
                      address: ''
                    });
                  }
                }}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              >
                <option value="">Select location type</option>
                <option value="current">Use current location</option>
                <option value="manual">Enter manually</option>
              </select>

              {locationType === 'manual' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {locationType === 'current' && formData.address && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Current location:</p>
                  <p className="text-gray-800 mt-1">{formData.address}</p>
                </div>
              )}
            </div>
          </section>

          {/* Operating Hours Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Operating Hours</h3>
            <div className="space-y-4">
              {formData.operating_hours.map((hours, index) => (
                <div key={hours.day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="text-sm font-medium text-gray-700">{hours.day}</span>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={(e) => updateOperatingHours(index, 'isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Open</span>
                  </label>
                  {hours.isOpen && (
                    <>
                      <input
                        type="time"
                        value={hours.openTime}
                        onChange={(e) => updateOperatingHours(index, 'openTime', e.target.value)}
                        className="px-3 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.closeTime}
                        onChange={(e) => updateOperatingHours(index, 'closeTime', e.target.value)}
                        className="px-3 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Menu Items Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Menu Items</h3>
            <div className="space-y-4">
              {formData.menu_items.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={item.description}
                      onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    />
                  </div>
                  {formData.menu_items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMenuItem}
                className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
              >
                <Plus className="w-5 h-5" />
                <span>Add Menu Item</span>
              </button>
            </div>
          </section>

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