'use server';

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export const getUserIdByEmail = async (email: string): Promise<string | null> => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('No database connection');

    const user = await db.collection('user').findOne(
      { email },
      { projection: { _id: 1, id: 1 } }
    );

    if (!user) return null;
    return user.id || user._id?.toString() || null;
  } catch (error) {
    console.error('[Server] Failed to get user id by email:', error);
    return null;
  }
};

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
  try {
    const userId = await getUserIdByEmail(email);
    if (!userId) return [];

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

export const toggleWatchlist = async (symbol: string, company: string, isAdded: boolean) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.email) {
      throw new Error('Unauthorized');
    }

    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      throw new Error('User not found');
    }

    await connectToDatabase();

    if (isAdded) {
      await Watchlist.findOneAndUpdate(
        { userId, symbol: symbol.toUpperCase() },
        { userId, symbol: symbol.toUpperCase(), company, addedAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      await Watchlist.findOneAndDelete({ userId, symbol: symbol.toUpperCase() });
    }

    revalidatePath('/watchlist');
    revalidatePath(`/stocks/${symbol}`);
    
    return { success: true };
  } catch (error) {
    console.error('[Server] Failed to toggle watchlist:', error);
    return { success: false, error: 'Failed to update watchlist' };
  }
};

export const getWatchlist = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.email) {
      return [];
    }

    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return [];
    }

    await connectToDatabase();
    const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();

    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error('[Server] Failed to get watchlist:', error);
    return [];
  }
};