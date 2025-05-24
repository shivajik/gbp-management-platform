'use client';

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
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
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
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  organizationType: z.enum(['BUSINESS', 'AGENCY'], {
    required_error: 'Please select an organization type',
  }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
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
        toast.success('Account created successfully! Please check your email to verify your account.');
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
    <div className="min-h-screen flex">
      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-success-600 via-success-700 to-success-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpolygon points='20 0 40 20 20 40 0 20'/%3E%3C/g%3E%3C/svg%3E")`
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
              <p className="text-success-200 text-sm">Start Your Journey</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Join thousands of businesses growing with GBP Manager
            </h2>
            <p className="text-xl text-success-100 leading-relaxed mb-8">
              Start managing your Google Business Profiles like a pro. No setup fees, 
              no long-term contracts. Just powerful tools to grow your business.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Setup in Minutes</h3>
                <p className="text-success-200">Connect your Google account and start managing immediately</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Proven Results</h3>
                <p className="text-success-200">Our users see 40% more customer engagement on average</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Multi-Location Ready</h3>
                <p className="text-success-200">Scale from 1 to 1000+ locations with enterprise features</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-sm text-success-200">Active Users</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="text-2xl font-bold text-white">50k+</div>
              <div className="text-sm text-success-200">Locations Managed</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
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
            <h1 className="heading-2 text-foreground mb-2">Create your account</h1>
            <p className="body text-muted-foreground">
              Get started with your 14-day free trial
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="form-label">Full Name</Label>
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

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="form-label">Organization Name</Label>
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
              <Label htmlFor="organizationType" className="form-label">Organization Type</Label>
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
              <Label htmlFor="password" className="form-label">Password</Label>
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="form-label">Confirm Password</Label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-border rounded mt-1"
                  {...register('agreeToTerms')}
                />
                <Label htmlFor="agreeToTerms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
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
              className="w-full h-12 text-base"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner w-5 h-5 mr-3"></div>
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
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="caption">14-day free trial • No credit card required</span>
          </div>
        </div>
      </div>
    </div>
  );
} 