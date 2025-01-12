import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, LogIn, LogOut, User, Menu } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    fetchVendors();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchVendors = async () => {
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      const transformedVendors: Vendor[] = data.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        description: vendor.description,
        image: vendor.image,
        rating: vendor.rating || 0,
        cuisine: vendor.cuisine,
        lat: vendor.lat,
        lng: vendor.lng,
        address: vendor.address || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        website: vendor.website || '',
        priceRange: vendor.price_range || 1,
        operatingHours: vendor.operating_hours || [],
        menuItems: vendor.menu_items || []
      }));
      setVendors(transformedVendors);
      
      // Update selected vendor if it exists
      if (selectedVendor) {
        const updatedVendor = transformedVendors.find(v => v.id === selectedVendor.id);
        if (updatedVendor) {
          setSelectedVendor(updatedVendor);
        }
      }
    }
  };

  const handleReviewSubmitted = async () => {
    await fetchVendors();
  };

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
    return <VendorProfile />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-orange-500 sm:w-8 sm:h-8" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600 sm:text-3xl">
                nibble
              </h1>
            </div>

            {/* Search Bar Section */}
            <div className="flex-1 max-w-full sm:max-w-2xl mx-4">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>

            {/* Hamburger Menu */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-orange-500 hover:text-orange-700 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/10 focus:outline-none z-50">
                  <ul className="py-2 text-gray-700">
                    {!user ? (
                      <li>
                        <button
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          Sign In
                        </button>
                      </li>
                    ) : (
                      <>
                        <li>
                          <button
                            onClick={() => {
                              setShowProfile(true);
                              setIsMenuOpen(false);
                            }}
                            className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            My Profile
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            Sign Out
                          </button>
                        </li>
                      </>
                    )}
                    <li>
                      <button
                        onClick={() => {
                          handleAddVendorClick();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        Add Vendor
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Buttons Section for Larger Screens */}
            <div className="hidden sm:flex items-center space-x-4">
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
        onReviewSubmitted={handleReviewSubmitted}
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
