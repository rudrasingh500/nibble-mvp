import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Vendor } from '../types/vendor';
import { GlassCard } from './ui/GlassCard';
import { Store, PenSquare, Trash2, Heart, ArrowLeft, LogOut, Camera, User, Save, X } from 'lucide-react';
import { EditVendorModal } from './EditVendorModal';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  email: string;
}

export function VendorProfile() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [favorites, setFavorites] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'vendors' | 'favorites'>('vendors');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchUserVendors();
    fetchUserFavorites();
  }, []);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name
      });
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

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

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile?.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(profile => profile ? { ...profile, avatar_url: publicUrl } : null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setError('');

    if (!editForm.username || !editForm.first_name || !editForm.last_name) {
      setError('All fields are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username.toLowerCase(),
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id);

      if (error) {
        if (error.message.includes('username')) {
          setError('This username is already taken');
        } else {
          setError(error.message);
        }
        return;
      }

      await fetchUserProfile();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
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
        {profile && (
          <GlassCard className="mb-8 p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
                    <Camera className="w-6 h-6" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {isEditing ? (
                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                        pattern="^[a-zA-Z0-9_]{3,30}$"
                        title="Username must be 3-30 characters and can only contain letters, numbers, and underscores"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-gray-600">@{profile.username}</p>
                    <p className="text-gray-500">{profile.email}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                        setEditForm({
                          username: profile.username,
                          first_name: profile.first_name,
                          last_name: profile.last_name
                        });
                      }}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      className="p-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    <PenSquare className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        )}

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