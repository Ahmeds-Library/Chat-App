
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequest } from '@/types/auth';
import { AuthLayout } from './AuthLayout';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, Lock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const { handleError } = useErrorHandler();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFormError,
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      clearError();
      console.log('🔐 Login form submission:', { username: data.username, number: data.number });
      await login(data);
    } catch (error: any) {
      handleError(error, 'Login Form', {
        customMessage: 'Failed to sign in. Please check your credentials.',
        showToast: false
      });
      if (error.message) {
        setFormError('root', { message: error.message });
      }
    }
  };

  const watchedFields = watch();

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your conversations"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </Label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              className={`pl-10 h-12 transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] ${
                watchedFields.username ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' : ''
              } ${errors.username ? 'ring-2 ring-red-500 border-red-500' : ''}`}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
              })}
            />
          </div>
          {errors.username && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="space-y-2">
          <Label htmlFor="number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </Label>
          <div className="relative group">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="number"
              type="tel"
              placeholder="Enter your phone number"
              className={`pl-10 h-12 transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] ${
                watchedFields.number ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' : ''
              } ${errors.number ? 'ring-2 ring-red-500 border-red-500' : ''}`}
              {...register('number', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: 'Please enter a valid phone number',
                },
              })}
            />
          </div>
          {errors.number && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
              {errors.number.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`pl-10 pr-10 h-12 transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] ${
                watchedFields.password ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' : ''
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {(error || errors.root) && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>{error || errors.root?.message}</span>
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" text="Signing In..." />
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>Sign In</span>
            </span>
          )}
        </Button>

        {/* Sign Up Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all duration-200 hover:underline transform hover:scale-105 inline-block"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
