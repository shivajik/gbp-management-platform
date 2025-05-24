import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test if User table exists and is accessible
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown database error',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      } : error,
    }, { status: 500 });
  }
} 