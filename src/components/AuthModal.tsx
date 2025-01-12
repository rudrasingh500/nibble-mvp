import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { supabase } from '../lib/supabase';
import { Lock, Phone, Mail, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'method' | 'phone' | 'otp' | 'email';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<AuthStep>('method');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setStep('otp');
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        setError(error.message);
        return;
      }

      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Lock className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 'method' ? 'Sign In' :
             step === 'phone' ? 'Sign In with Phone' :
             step === 'otp' ? 'Enter Verification Code' :
             isSignUp ? 'Create Account' : 'Sign In with Email'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {step === 'method' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('phone')}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Continue with Phone</span>
            </button>

            <button
              onClick={() => setStep('email')}
              className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Continue with Email</span>
            </button>
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Enter your phone number with country code (e.g., +1 for US)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>Send Code</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setStep('method')}
              className="w-full text-orange-600 hover:text-orange-700 text-sm"
            >
              Back to sign in options
            </button>
          </form>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-orange-600 hover:text-orange-700 text-sm"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>

              <button
                type="button"
                onClick={() => setStep('method')}
                className="block w-full text-orange-600 hover:text-orange-700 text-sm"
              >
                Back to sign in options
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                required
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                maxLength={6}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the verification code sent to {phone}
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}