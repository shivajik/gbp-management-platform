'use client';

import { useState, useEffect, Suspense } from 'react';
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
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
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
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
          <Zap className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold text-foreground">
          GBP Manager
        </span>
      </div>

      {/* Form Header */}
      <div className="mb-8 text-center">
        <h1 className="heading-2 mb-2 text-foreground">
          Sign in to your account
        </h1>
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
          className="h-12 w-full text-base"
        >
          {isGoogleLoading ? (
            <div className="loading-spinner mr-3 h-5 w-5"></div>
          ) : (
            <Chrome className="mr-3 h-5 w-5" />
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
          <span className="bg-secondary-50/30 px-4 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="form-label">
            Email address
          </Label>
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
          <Label htmlFor="password" className="form-label">
            Password
          </Label>
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
              className="h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
            />
            <Label
              htmlFor="remember-me"
              className="text-sm text-muted-foreground"
            >
              Remember me
            </Label>
          </div>

          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full text-base"
        >
          {isLoading ? (
            <>
              <div className="loading-spinner mr-3 h-5 w-5"></div>
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
            className="font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Create your account
          </Link>
        </p>
      </div>

      {/* Security Notice */}
      <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span className="caption">
          Your data is protected with enterprise-grade security
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Info Panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 lg:flex lg:w-1/2">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="h-full w-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GBP Manager</h1>
              <p className="text-sm text-primary-200">Professional Edition</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <h2 className="mb-6 text-4xl font-bold leading-tight">
              Welcome back to your Business Command Center
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-primary-100">
              Access powerful tools to manage your Google Business Profiles,
              track performance, and grow your online presence across multiple
              locations.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Multi-Location Management
                </h3>
                <p className="text-primary-200">
                  Control all your business listings from one dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Advanced Analytics</h3>
                <p className="text-primary-200">
                  Track performance with real-time insights
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Team Collaboration</h3>
                <p className="text-primary-200">
                  Work together with role-based access
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className="h-4 w-4 fill-current text-warning-400"
                />
              ))}
            </div>
            <p className="mb-3 text-primary-100">
              &quot;GBP Manager transformed how we handle our 50+ locations. The
              analytics alone saved us hours of manual work every week.&quot;
            </p>
            <p className="text-sm text-primary-200">
              — Sarah Johnson, Marketing Director
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-secondary-50/30 p-8">
        <Suspense fallback={
          <div className="w-full max-w-md">
            <div className="animate-pulse">
              <div className="mb-8 h-8 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
