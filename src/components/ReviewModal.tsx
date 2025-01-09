import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  };
  onReviewSubmitted: () => void;
}

export function ReviewModal({ 
  isOpen, 
  onClose, 
  vendorId, 
  existingReview,
  onReviewSubmitted 
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.split(/\s+/).length > 50) {
      setError('Comment must not exceed 50 words');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (existingReview) {
        await supabase
          .from('reviews')
          .update({ rating, comment, updated_at: new Date().toISOString() })
          .eq('id', existingReview.id);
      } else {
        await supabase
          .from('reviews')
          .insert({
            vendor_id: vendorId,
            user_id: user.id,
            rating,
            comment
          });
      }

      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {existingReview ? 'Edit Review' : 'Write a Review'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              {existingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}