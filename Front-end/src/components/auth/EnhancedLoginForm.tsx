
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { toast } from '@/hooks/use-toast';
import { gsap } from 'gsap';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  number: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const EnhancedLoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sparkleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Enhanced entrance animations
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { 
          opacity: 0, 
          y: 50, 
          scale: 0.9,
          rotationX: -10 
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotationX: 0,
          duration: 1,
          ease: "back.out(1.7)"
        }
      );
    }

    // Animated sparkles
    sparkleRefs.current.forEach((sparkle, index) => {
      if (sparkle) {
        gsap.fromTo(sparkle,
          { 
            opacity: 0, 
            scale: 0,
            rotation: 0 
          },
          { 
            opacity: 1, 
            scale: 1,
            rotation: 360,
            duration: 0.8,
            delay: 0.5 + index * 0.2,
            ease: "elastic.out(1, 0.3)",
            repeat: -1,
            repeatDelay: 3,
            yoyo: true
          }
        );
      }
    });

    // Form field animations on focus
    const inputs = formRef.current?.querySelectorAll('input');
    inputs?.forEach((input) => {
      input.addEventListener('focus', () => {
        gsap.to(input.parentElement, {
          scale: 1.02,
          duration: 0.2,
          ease: "power2.out"
        });
      });
      
      input.addEventListener('blur', () => {
        gsap.to(input.parentElement, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      });
    });

    return () => {
      inputs?.forEach((input) => {
        input.removeEventListener('focus', () => {});
        input.removeEventListener('blur', () => {});
      });
    };
  }, []);

  const watchedFields = watch();

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearError();

    // Loading animation
    if (formRef.current) {
      gsap.to(formRef.current, {
        opacity: 0.7,
        scale: 0.98,
        duration: 0.3
      });
    }

    try {
      await login(data);
      
      // Success toast
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show error toast instead of page refresh
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please check your username, phone number, and password.",
        variant: "destructive",
      });
      
      // Set form errors for invalid password
      if (error.message && error.message.toLowerCase().includes('password')) {
        setError('password', {
          type: 'manual',
          message: 'Invalid password'
        });
      }
      
      // Error shake animation
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          keyframes: [
            { x: -10, duration: 0.1 },
            { x: 10, duration: 0.1 },
            { x: -10, duration: 0.1 },
            { x: 10, duration: 0.1 },
            { x: 0, duration: 0.1 }
          ],
          ease: "power2.inOut"
        });
      }
    } finally {
      setIsSubmitting(false);
      if (formRef.current) {
        gsap.to(formRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.3
        });
      }
    }
  };

  const isFormValid = watchedFields.username && watchedFields.number && watchedFields.password;

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your conversations"
    >
      <div className="relative">
        {/* Floating sparkles */}
        <div className="absolute -top-6 -right-6 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              ref={(el) => sparkleRefs.current[i] = el}
              className="absolute"
              style={{
                left: `${i * 15}px`,
                top: `${i * 10}px`
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>

        <Card 
          ref={cardRef}
          className="relative overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 dark:border-gray-700/50 shadow-2xl"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          
          <CardHeader className="space-y-1 relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="relative">
            {error && (
              <Alert variant="destructive" className="mb-6 animate-fade-in">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Username Field */}
                <div className="group relative">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white/50 dark:bg-gray-800/50"
                      {...register('username')}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.username.message}</p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="group relative">
                  <Label htmlFor="number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="number"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white/50 dark:bg-gray-800/50"
                      {...register('number')}
                    />
                  </div>
                  {errors.number && (
                    <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.number.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="group relative">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pr-10 h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white/50 dark:bg-gray-800/50"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`
                  w-full h-12 relative overflow-hidden
                  bg-gradient-to-r from-blue-600 to-purple-600 
                  hover:from-blue-700 hover:to-purple-700 
                  disabled:from-gray-400 disabled:to-gray-500
                  transform transition-all duration-200 
                  ${isFormValid ? 'hover:scale-105 hover:shadow-lg' : ''}
                  disabled:cursor-not-allowed
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span className="font-medium">Sign In</span>
                )}
                
                {/* Button shine effect */}
                <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </Button>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};
