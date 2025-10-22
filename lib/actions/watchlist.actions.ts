'use server';

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('No database connection');

    // Find user by email in the user collection (Better Auth)
    const user = await db.collection('user').findOne(
      { email },
      { projection: { _id: 1, id: 1 } }
    );

    if (!user) {
      return [];
    }

    // Use the user's id (or _id as fallback) to query watchlist
    const userId = user.id || user._id?.toString();
    if (!userId) {
      return [];
    }

    // Query watchlist by userId and return just the symbols
    const items = await Watchlist.find(
      { userId },
      { symbol: 1, _id: 0 }
    ).lean();

    return items.map(item => item.symbol);
  } catch (error) {
    console.error('[Server] Failed to get watchlist symbols by email:', error);
    return [];
  }
};