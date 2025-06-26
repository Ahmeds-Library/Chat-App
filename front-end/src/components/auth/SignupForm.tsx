
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { SignupRequest } from '@/types/auth';
import { AuthLayout } from './AuthLayout';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, Lock } from 'lucide-react';

export const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading, error, clearError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFormError,
  } = useForm<SignupRequest>();

  const onSubmit = async (data: SignupRequest) => {
    try {
      clearError();
      console.log('Attempting signup with:', { username: data.username, number: data.number });
      await signup(data);
      // Navigation is handled in AuthContext after successful signup
    } catch (error: any) {
      console.error('Signup form submission error:', error);
      // Set form-level error if needed
      if (error.message) {
        setFormError('root', { message: error.message });
      }
    }
  };

  // Handle Enter key press to prevent unwanted form submissions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const watchedFields = watch();
  const password = watch('password');

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join ChatApp and start connecting with others"
    >
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-6">
        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              className={`pl-10 h-12 transition-all duration-200 ${
                watchedFields.username ? 'ring-2 ring-blue-500 border-blue-500' : ''
              } ${errors.username ? 'ring-2 ring-red-500 border-red-500' : ''}`}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores',
                },
              })}
            />
          </div>
          {errors.username && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="space-y-2">
          <Label htmlFor="number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="number"
              type="tel"
              placeholder="Enter your phone number"
              className={`pl-10 h-12 transition-all duration-200 ${
                watchedFields.number ? 'ring-2 ring-blue-500 border-blue-500' : ''
              } ${errors.number ? 'ring-2 ring-red-500 border-red-500' : ''}`}
              {...register('number', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: 'Please enter a valid phone number',
                },
                minLength: {
                  value: 10,
                  message: 'Phone number must be at least 10 digits',
                },
              })}
            />
          </div>
          {errors.number && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
              {errors.number.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                watchedFields.password ? 'ring-2 ring-blue-500 border-blue-500' : ''
              } ${errors.password ? 'ring-2 ring-red-500 border-red-500' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 4,
                  message: 'Password must be at least 4 characters',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className={`pl-10 pr-10 h-12 transition-all duration-200 ${
                watchedFields.confirmPassword ? 'ring-2 ring-blue-500 border-blue-500' : ''
              } ${errors.confirmPassword ? 'ring-2 ring-red-500 border-red-500' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {(error || errors.root) && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error || errors.root?.message}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>

        {/* Sign In Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
