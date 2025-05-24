import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseHealth } from '@/lib/db';

/**
 * Health check endpoint for monitoring system status
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const dbHealth = await getDatabaseHealth();

    // Get system information
    const systemHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    // Overall health status
    const isHealthy = dbHealth.status === 'healthy';
    const overallStatus = isHealthy ? 'healthy' : 'unhealthy';

    return NextResponse.json(
      {
        status: overallStatus,
        checks: {
          database: dbHealth,
          system: systemHealth,
        },
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
