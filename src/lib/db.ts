import { PrismaClient } from '@prisma/client';

/**
 * Global variable to store the Prisma client instance
 * This ensures we have a single instance across the application
 */
declare global {
  // Allow global variable in Node.js
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Create a new Prisma client instance
 * @returns PrismaClient instance
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

  return client;
}

/**
 * Global Prisma client instance
 * In development, store the client on the global object to prevent
 * multiple instances from being created during hot reloads
 */
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

/**
 * Gracefully disconnect from the database
 * Called during application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    process.exit(1);
  }
}

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection is successful
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get database health status
 * @returns Promise<{ status: string; timestamp: Date; latency?: number }>
 */
export async function getDatabaseHealth(): Promise<{
  status: string;
  timestamp: Date;
  latency?: number;
}> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return {
      status: 'healthy',
      timestamp: new Date(),
      latency,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
    };
  }
}

/**
 * Execute database queries with proper error handling
 * @param operation - Database operation function
 * @returns Promise with the operation result
 */
export async function withDatabase<T>(
  operation: (db: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await operation(prisma);
  } catch (error) {
    console.error('Database operation failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Unknown database error'
    );
  }
}

/**
 * Batch operations helper
 * @param operations - Array of database operations
 * @returns Promise with all operation results
 */
export async function batchOperations<T>(
  operations: Array<(db: PrismaClient) => Promise<T>>
): Promise<T[]> {
  return Promise.all(operations.map(op => withDatabase(op)));
}

/**
 * Transaction helper
 * @param operations - Array of operations to run in a transaction
 * @returns Promise with transaction result
 */
export async function withTransaction<T>(
  operations: (
    db: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ) => Promise<T>
): Promise<T> {
  return prisma.$transaction(operations);
}

export default prisma;
