'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  EyeOff, 
  Zap, 
  Building2, 
  BarChart3, 
  Users, 
  Shield,
  Chrome,
  Star,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          toast.error('Invalid email or password');
          break;
        case 'AccountNotLinked':
          toast.error('Account already exists with different sign in method');
          break;
        default:
          toast.error('An error occurred during sign in');
      }
    }
  }, [error]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Successfully signed in');
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', {
        callbackUrl,
      });
    } catch (error) {
      toast.error('Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GBP Manager</h1>
              <p className="text-primary-200 text-sm">Professional Edition</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Welcome back to your Business Command Center
            </h2>
            <p className="text-xl text-primary-100 leading-relaxed mb-8">
              Access powerful tools to manage your Google Business Profiles, 
              track performance, and grow your online presence across multiple locations.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Multi-Location Management</h3>
                <p className="text-primary-200">Control all your business listings from one dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Advanced Analytics</h3>
                <p className="text-primary-200">Track performance with real-time insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Team Collaboration</h3>
                <p className="text-primary-200">Work together with role-based access</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 text-warning-400 fill-current" />
              ))}
            </div>
            <p className="text-primary-100 mb-3">
              &quot;GBP Manager transformed how we handle our 50+ locations. The analytics 
              alone saved us hours of manual work every week.&quot;
            </p>
            <p className="text-sm text-primary-200">
              — Sarah Johnson, Marketing Director
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-secondary-50/30">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">GBP Manager</span>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="heading-2 text-foreground mb-2">Sign in to your account</h1>
            <p className="body text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Google Sign In */}
          <div className="mb-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full h-12 text-base"
            >
              {isGoogleLoading ? (
                <div className="loading-spinner w-5 h-5 mr-3"></div>
              ) : (
                <Chrome className="h-5 w-5 mr-3" />
              )}
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-secondary-50/30 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="form-label">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className={`form-input ${errors.email ? 'border-error-500' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="form-label">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`form-input pr-12 ${errors.password ? 'border-error-500' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-border rounded"
                />
                <Label htmlFor="remember-me" className="text-sm text-muted-foreground">
                  Remember me
                </Label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner w-5 h-5 mr-3"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="body-small text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Create your account
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="caption">Your data is protected with enterprise-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
} 