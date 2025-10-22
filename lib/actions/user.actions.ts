'use server';

import { connectToDatabase } from "@/database/mongoose";

export const getAllUsersForNewsEmail = async () => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if(!db) throw new Error('No database connection');

        const users = await db.collection('user').find(
            {email:{ $exists: true, $ne: null }},
            {projection: {_id: 1, id: 1, email: 1, name: 1, country:1}}
        ).toArray();

        console.log(`[Server] Found ${users.length} users in database`);

        const filteredUsers = users.filter((user) => user.email && user.name).map((user)=>({
            id: user.id || user._id?.toString() || '',
            email: user.email || '',
            name: user.name || '',
            country: user.country || '',
        }));

        console.log(`[Server] Filtered to ${filteredUsers.length} users with email and name`);
        return filteredUsers;
    } catch (e) {
        console.error('[Server] Failed to get all users for news email:', e);
        return [];
    }
};