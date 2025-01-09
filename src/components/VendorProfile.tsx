import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Vendor } from '../types/vendor';
import { GlassCard } from './ui/GlassCard';
import { Store, PenSquare, Trash2, Heart, ArrowLeft, LogOut } from 'lucide-react';
import { EditVendorModal } from './EditVendorModal';
import { motion } from 'framer-motion';

export function VendorProfile() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [favorites, setFavorites] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'vendors' | 'favorites'>('vendors');

  useEffect(() => {
    fetchUserVendors();
    fetchUserFavorites();
  }, []);

  const fetchUserVendors = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setVendors(data);
    }
    setLoading(false);
  };

  const fetchUserFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('vendors (*)')
      .eq('user_id', user.id);

    if (data) {
      setFavorites(data.map(f => f.vendors));
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const { error } = await supabase.rpc('delete_vendor_with_relations', {
        target_id: vendorId
      });

      if (error) throw error;

      setVendors(vendors.filter(v => v.id !== vendorId));
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Map</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-white/80 backdrop-blur-lg rounded-xl p-1">
            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'vendors'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>My Vendors</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>Favorites</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'vendors' ? vendors : favorites).map((vendor) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {vendor.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{vendor.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                        {vendor.cuisine}
                      </span>
                      {activeTab === 'vendors' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingVendor(vendor)}
                            className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                          >
                            <PenSquare className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(vendor.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <EditVendorModal
        vendor={editingVendor}
        isOpen={!!editingVendor}
        onClose={() => setEditingVendor(null)}
        onVendorUpdated={fetchUserVendors}
      />
    </div>
  );
}