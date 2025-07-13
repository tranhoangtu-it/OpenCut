import { db, sql } from "@opencut/db";
import { waitlist } from "@opencut/db/schema";

// Cache for waitlist count with 5 minute TTL
let waitlistCountCache: { count: number; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; /**
 * Retrieves the current count of entries in the waitlist, using a cached value if available and valid.
 *
 * If the cached count is older than 5 minutes, fetches the latest count from the database and updates the cache.
 * In case of a database error, returns the cached count if available; otherwise, returns 0.
 *
 * @returns The number of entries in the waitlist.
 */

export async function getWaitlistCount() {
  try {
    // Check cache first
    if (waitlistCountCache && Date.now() - waitlistCountCache.timestamp < CACHE_TTL) {
      return waitlistCountCache.count;
    }

    // Fetch from database
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(waitlist);
    
    const count = result[0]?.count || 0;
    
    // Update cache
    waitlistCountCache = {
      count,
      timestamp: Date.now()
    };
    
    return count;
  } catch (error) {
    console.error("Failed to fetch waitlist count:", error);
    // Return cached value if available, otherwise 0
    return waitlistCountCache?.count || 0;
  }
}

/**
 * Clears the cached waitlist count, forcing the next retrieval to query the database.
 *
 * Call this function whenever the waitlist changes to ensure the count remains accurate.
 */
export function invalidateWaitlistCountCache() {
  waitlistCountCache = null;
}
