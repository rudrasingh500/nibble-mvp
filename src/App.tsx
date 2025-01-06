import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, LogIn, LogOut, User } from 'lucide-react';
import { VendorCard } from './components/VendorCard';
import { VendorModal } from './components/VendorModal';
import { AddVendorModal } from './components/AddVendorModal';
import { AuthModal } from './components/AuthModal';
import { VendorProfile } from './components/VendorProfile';
import { Map } from './components/Map';
import { SearchBar } from './components/ui/SearchBar';
import { Vendor } from './types/vendor';
import { supabase } from './lib/supabase';

export default function App() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchVendors = async () => {
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setVendors(data);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAddVendorClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showProfile && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-white/20">
          <div className="max-w-7xl mx-auto py-4 px-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowProfile(false)}
                className="text-orange-600 hover:text-orange-700"
              >
                ← Back to Map
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
        <VendorProfile />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600">
                nibble
              </h1>
            </div>

            <div className="flex-1 max-w-2xl">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>

            <div className="flex items-center space-x-4">
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
              <button
                onClick={handleAddVendorClick}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Vendor</span>
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800">
              {filteredVendors.length} Street Vendors Near You
            </h2>
            <div className="space-y-6">
              {filteredVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onClick={() => setSelectedVendor(vendor)}
                />
              ))}
            </div>
          </motion.div>

          <div className="h-[calc(100vh-12rem)] sticky top-32">
            <Map vendors={vendors} selectedVendor={selectedVendor} />
          </div>
        </div>
      </main>

      <VendorModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
      />
      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onVendorAdded={fetchVendors}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}