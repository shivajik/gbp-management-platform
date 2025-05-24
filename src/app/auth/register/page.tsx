'use client';

// Force dynamic rendering - this page handles form submissions and API calls
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  TrendingUp,
  Clock,
  Globe,
  Shield,
  CheckCircle,
  Users,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
    organizationName: z
      .string()
      .min(2, 'Organization name must be at least 2 characters'),
    organizationType: z.enum(['BUSINESS', 'AGENCY'], {
      required_error: 'Please select an organization type',
    }),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          organizationName: data.organizationName,
          organizationType: data.organizationType,
        }),
      });

      if (response.ok) {
        toast.success(
          'Account created successfully! Please check your email to verify your account.'
        );
        router.push('/auth/login?message=account-created');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create account');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Info Panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-success-600 via-success-700 to-success-800 lg:flex lg:w-1/2">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="h-full w-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpolygon points='20 0 40 20 20 40 0 20'/%3E%3C/g%3E%3C/svg%3E")`,
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
              <p className="text-sm text-success-200">Start Your Journey</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <h2 className="mb-6 text-4xl font-bold leading-tight">
              Join thousands of businesses growing with GBP Manager
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-success-100">
              Start managing your Google Business Profiles like a pro. No setup
              fees, no long-term contracts. Just powerful tools to grow your
              business.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Setup in Minutes</h3>
                <p className="text-success-200">
                  Connect your Google account and start managing immediately
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Proven Results</h3>
                <p className="text-success-200">
                  Our users see 40% more customer engagement on average
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Multi-Location Ready</h3>
                <p className="text-success-200">
                  Scale from 1 to 1000+ locations with enterprise features
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-sm text-success-200">Active Users</div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">50k+</div>
              <div className="text-sm text-success-200">Locations Managed</div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm text-success-200">Uptime</div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center gap-2 text-success-200">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Google Verified Partner</span>
            </div>
            <div className="flex items-center gap-2 text-success-200">
              <Shield className="h-5 w-5" />
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex flex-1 items-center justify-center bg-secondary-50/30 p-8">
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
              Create your account
            </h1>
            <p className="body text-muted-foreground">
              Get started with your 14-day free trial
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="form-label">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                className={`form-input ${errors.name ? 'border-error-500' : ''}`}
                {...register('name')}
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

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

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="form-label">
                Organization Name
              </Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="Enter your business/agency name"
                className={`form-input ${errors.organizationName ? 'border-error-500' : ''}`}
                {...register('organizationName')}
              />
              {errors.organizationName && (
                <p className="form-error">{errors.organizationName.message}</p>
              )}
            </div>

            {/* Organization Type */}
            <div className="space-y-2">
              <Label htmlFor="organizationType" className="form-label">
                Organization Type
              </Label>
              <select
                id="organizationType"
                className={`form-input ${errors.organizationType ? 'border-error-500' : ''}`}
                {...register('organizationType')}
              >
                <option value="">Select organization type</option>
                <option value="BUSINESS">Business Owner</option>
                <option value="AGENCY">Agency/Service Provider</option>
              </select>
              {errors.organizationType && (
                <p className="form-error">{errors.organizationType.message}</p>
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
                  autoComplete="new-password"
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className={`form-input pr-12 ${errors.confirmPassword ? 'border-error-500' : ''}`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-border text-primary-500 focus:ring-primary-500"
                  {...register('agreeToTerms')}
                />
                <Label
                  htmlFor="agreeToTerms"
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="form-error">{errors.agreeToTerms.message}</p>
              )}
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
                  Creating account...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-5 w-5" />
                  Start Free Trial
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="body-small text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="caption">
              14-day free trial • No credit card required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
