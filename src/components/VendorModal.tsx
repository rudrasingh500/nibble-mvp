import React, { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Utensils, DollarSign } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Vendor } from '../types/vendor';
import { supabase } from '../lib/supabase';

interface VendorModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

interface Review {
  id: string;
  vendor_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  username?: string;
}

export function VendorModal({ vendor, onClose, onReviewSubmitted }: VendorModalProps) {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (vendor) {
      fetchReviews();
    }
  }, [vendor, user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchReviews = async () => {
    if (!vendor) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          vendor_id,
          user_id,
          rating,
          comment,
          created_at,
          updated_at
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviewsWithUsers = await Promise.all(
        (data || []).map(async (review) => {
          const { data: userData } = await supabase
            .from('profiles').select('username').eq('id', review.user_id).single();
          return {
            ...review,
            username: userData?.username || 'Anonymous'
          };
        })
      );

      setReviews(reviewsWithUsers);
      
      if (user) {
        const userReview = reviewsWithUsers.find(review => review.user_id === user.id);
        setUserReview(userReview || null);
        if (userReview) {
          setRating(userReview.rating);
          setComment(userReview.comment);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    console.log('submitting review from vendor modal...');
    e.preventDefault();
    setError('');

    if (!user) return;
    if (!vendor) return;

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.split(/\s+/).length > 50) {
      setError('Comment must not exceed 50 words');
      return;
    }

    try {
      if (userReview) {
        await supabase
          .from('reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', userReview.id);
          console.log('Updated review:', userReview.id);
      } else {
        await supabase
          .from('reviews')
          .insert({
            vendor_id: vendor.id,
            user_id: user.id,
            rating,
            comment
          });
          console.log('Inserted new review for vendor:', vendor.id);

      }

      const { data: updatedReviews, error: fetchError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('vendor_id', vendor.id);
      
      if (fetchError) throw fetchError;
      console.log('Fetched reviews:', updatedReviews);

      const totalRating = updatedReviews?.reduce((sum: number, review: any) => sum + review.rating, 0) || 0;
      const averageRating = (totalRating / (updatedReviews?.length || 1)).toFixed(1);
      console.log('Calculated average rating:', averageRating);

      const {error: updateError } = await supabase
        .from('vendors')
        .update({ rating: averageRating })
        .eq('id', vendor.id);
      if (updateError) throw updateError;
      console.log(`Vendor (${vendor.id}) average rating updated successfully.`);

      await fetchReviews();
      onReviewSubmitted();
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    }
  };

  if (!vendor) return null;

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

  const formatPrice = (price: string) => {
    if (!price) return '';
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericPrice);
  };

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
              {vendor.address}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {isOpen() ? (
                <span className="text-green-600">Open Now</span>
              ) : (
                <span className="text-red-600">Closed</span>
              )}
            </span>
            <span className="flex items-center">
              <Utensils className="w-4 h-4 mr-1" />
              {vendor.cuisine}
            </span>
            <span className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              {'$'.repeat(vendor.priceRange || 1)}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">About</h3>
            <p className="text-gray-600">{vendor.description}</p>
          </div>

          {vendor.menuItems && vendor.menuItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Menu Items</h3>
              <div className="space-y-2">
                {vendor.menuItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-700">{item.name}</span>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                    <span className="text-gray-600 font-medium">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vendor.operatingHours && vendor.operatingHours.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Hours</h3>
              <div className="grid grid-cols-2 gap-2">
                {vendor.operatingHours.map((hours) => (
                  <div key={hours.day} className="flex justify-between">
                    <span className="text-gray-600 font-medium">{hours.day}</span>
                    <span className="text-gray-700">
                      {hours.isOpen
                        ? `${hours.openTime} - ${hours.closeTime}`
                        : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Reviews</h3>
            </div>

            {user && (isEditing || !userReview) && (
              <div className="mb-6 bg-orange-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-3">
                  {userReview ? 'Edit Your Review' : 'Write a Review'}
                </h4>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHoveredRating(value)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              value <= (hoveredRating || rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment (max 50 words)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                      rows={4}
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {comment.split(/\s+/).filter(Boolean).length}/50 words
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setRating(userReview?.rating || 0);
                          setComment(userReview?.comment || '');
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                      {userReview ? 'Update Review' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">
                        @{review.username}
                      </span>
                      <div className="flex items-center text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    {user && user.id === review.user_id && !isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${vendor.lat},${vendor.lng}`)}
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