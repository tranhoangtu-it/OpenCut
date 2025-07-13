import { db, sql } from "@opencut/db";
import { waitlist } from "@opencut/db/schema";

// Cache for waitlist count with 5 minute TTL
let waitlistCountCache: { count: number; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

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

// Function to invalidate cache (call this when someone joins waitlist)
export function invalidateWaitlistCountCache() {
  waitlistCountCache = null;
}
