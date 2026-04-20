'use server';

import { connectToDatabase } from "@/database/mongoose";
import { Alert } from "@/database/models/alert.model";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getUserIdByEmail } from "./watchlist.actions";

export const createAlert = async (alertData: any) => {
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

    const newAlert = await Alert.create({
      userId,
      ...alertData,
      createdAt: new Date(),
    });

    revalidatePath('/watchlist');
    return { success: true, alert: JSON.parse(JSON.stringify(newAlert)) };
  } catch (error) {
    console.error('[Server] Failed to create alert:', error);
    return { success: false, error: 'Failed to create alert' };
  }
};

export const getAlertsByUserId = async () => {
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
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(alerts));
  } catch (error) {
    console.error('[Server] Failed to get alerts:', error);
    return [];
  }
};

export const deleteAlert = async (alertId: string) => {
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
    await Alert.findOneAndDelete({ _id: alertId, userId });

    revalidatePath('/watchlist');
    return { success: true };
  } catch (error) {
    console.error('[Server] Failed to delete alert:', error);
    return { success: false, error: 'Failed to delete alert' };
  }
};

export const getAlertsForSymbol = async (symbol: string) => {
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
    const alerts = await Alert.find({ userId, symbol: symbol.toUpperCase() }).sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(alerts));
  } catch (error) {
    console.error('[Server] Failed to get alerts for symbol:', error);
    return [];
  }
};
