import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Vendor } from '../types/vendor';
import { GlassCard } from './ui/GlassCard';
import { Store, PenSquare, Trash2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditVendorModal } from './EditVendorModal';
import { motion } from 'framer-motion';

export function VendorProfile() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [favorites, setFavorites] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'vendors' | 'favorites'>('vendors');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchVendorProfile(), fetchFavorites()]);
      setLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (!loading && vendors.length === 0) {
      setActiveTab('favorites');
    }
  }, [loading, vendors]);

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          vendor_id,
          vendors (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.vendors) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVendors(vendors.filter(vendor => vendor.id !== id));
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const removeFavorite = async (vendorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('vendor_id', vendorId);

      if (error) throw error;
      setFavorites(favorites.filter(vendor => vendor.id !== vendorId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          {activeTab === 'vendors' ? (
            <Store className="w-8 h-8 text-orange-500" />
          ) : (
            <Heart className="w-8 h-8 text-red-500" />
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab === 'vendors' ? 'My Vendor Stalls' : 'Favorite Vendors'}
          </h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'vendors'
                ? 'bg-orange-500 text-white'
                : 'text-orange-600 hover:bg-orange-50'
            }`}
          >
            My Vendors
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'favorites'
                ? 'bg-red-500 text-white'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            Favorites
          </button>
        </div>
      </div>

      {activeTab === 'vendors' ? (
        vendors.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-600">You haven't added any vendor stalls yet.</p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {vendors.map((vendor) => (
              <GlassCard key={vendor.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{vendor.name}</h3>
                      <p className="text-gray-600 mt-1">{vendor.cuisine}</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-500">
                        <p>Opens: {vendor.openingTime || 'Not set'}</p>
                        <p>Closes: {vendor.closingTime || 'Not set'}</p>
                        <p>Price Range: {'$'.repeat(vendor.priceRange || 1)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingVendor(vendor)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <PenSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteVendor(vendor.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      ) : (
        <div className="relative">
          {favorites.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar flex space-x-6 pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {favorites.length === 0 ? (
              <GlassCard className="p-8 text-center w-full">
                <p className="text-gray-600">You haven't favorited any vendors yet.</p>
              </GlassCard>
            ) : (
              favorites.map((vendor) => (
                <GlassCard key={vendor.id} className="p-6 min-w-[300px] flex-shrink-0">
                  <div className="flex flex-col space-y-4">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-48 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{vendor.name}</h3>
                      <p className="text-gray-600 mt-1">{vendor.cuisine}</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-500">
                        <p>Opens: {vendor.openingTime || 'Not set'}</p>
                        <p>Closes: {vendor.closingTime || 'Not set'}</p>
                        <p>Price Range: {'$'.repeat(vendor.priceRange || 1)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFavorite(vendor.id)}
                      className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                      <span>Remove from Favorites</span>
                    </button>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      )}

      <EditVendorModal
        vendor={editingVendor}
        isOpen={!!editingVendor}
        onClose={() => setEditingVendor(null)}
        onVendorUpdated={fetchVendorProfile}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}