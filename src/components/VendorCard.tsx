import React, { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Vendor } from '../types/vendor';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabase';
import { calculateDistance } from '../utils/distance';

interface VendorCardProps {
  vendor: Vendor;
  onClick: () => void;
}

export function VendorCard({ vendor, onClick }: VendorCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [distance, setDistance] = useState<string | null>(null);

  useEffect(() => {
    checkFavoriteStatus();
    checkUser();
    calculateDistanceToVendor();
  }, []);

  const calculateDistanceToVendor = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const dist = calculateDistance(userLat, userLng, vendor.lat, vendor.lng);
        setDistance(dist.toFixed(1));
      });
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const checkFavoriteStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select()
      .eq('user_id', user.id)
      .eq('vendor_id', vendor.id);

    setIsFavorited(data && data.length > 0);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('vendor_id', vendor.id);
    } else {
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          vendor_id: vendor.id
        });
    }

    setIsFavorited(!isFavorited);
  };

  const isOpen = () => {
    if (!vendor.operatingHours?.length) return false;
    
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHours = vendor.operatingHours.find(h => h.day === day);
    
    if (!currentHours?.isOpen) return false;
    
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(currentHours.openTime?.replace(':', '') || '0');
    const closeTime = parseInt(currentHours.closeTime?.replace(':', '') || '0');
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <GlassCard 
      onClick={onClick}
      className="overflow-hidden cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <img 
          src={vendor.image} 
          alt={vendor.name} 
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          {user && (
            <button
              onClick={toggleFavorite}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
            >
              <Heart 
                className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}`}
              />
            </button>
          )}
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-orange-500 fill-current" />
              <span className="font-medium text-orange-500">{vendor.rating}</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-gray-800">{vendor.name}</h3>
        <div className="flex items-center space-x-4 mt-2 text-gray-500">
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {distance ? `${distance}km away` : 'Calculating...'}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {isOpen() ? (
              <span className="text-green-600">Open Now</span>
            ) : (
              <span className="text-red-600">Closed</span>
            )}
          </span>
        </div>
        <p className="mt-3 text-gray-600">{vendor.description}</p>
        <div className="mt-4">
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
            {vendor.cuisine}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}