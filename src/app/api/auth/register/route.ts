import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';

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
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  organizationType: z.enum(['BUSINESS', 'AGENCY']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user and organization in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          role: validatedData.organizationType === 'AGENCY' ? 'AGENCY_OWNER' : 'BUSINESS_OWNER',
        },
      });

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: validatedData.organizationName,
          type: validatedData.organizationType,
          ownerId: user.id,
        },
      });

      // Update user with organization ID
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id },
      });

      // Log registration activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          resource: 'user',
          resourceId: user.id,
          description: `User registered with ${validatedData.organizationType.toLowerCase()} organization`,
          metadata: {
            organizationType: validatedData.organizationType,
            organizationName: validatedData.organizationName,
          },
        },
      });

      return { user: updatedUser, organization };
    });

    // Return success response (excluding password)
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        organizationId: result.user.organizationId,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // Provide more specific error information
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Check for common database errors
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please check your database configuration.' },
          { status: 500 }
        );
      }

      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }

      if (error.message.includes('schema')) {
        return NextResponse.json(
          { error: 'Database schema error. Please run database migrations.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Registration failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 