import React, { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Vendor } from '../types/vendor';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabase';

interface VendorCardProps {
  vendor: Vendor;
  onClick: () => void;
}

export function VendorCard({ vendor, onClick }: VendorCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkFavoriteStatus();
    checkUser();
  }, []);

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
            {Math.round(Math.random() * 2 + 0.5)}km away
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Open Now
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