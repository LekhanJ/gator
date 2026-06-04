import { db } from "../index.js";
import { feeds } from "../../../schema.js";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
    const [feed] = await db.insert(feeds).values({
        name,
        url,
        userId,
    }).returning();

    return feed;
}

export async function getFeedByUrl(url: string) {
    const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));
    return feed;
}