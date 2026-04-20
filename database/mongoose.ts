import mongoose from 'mongoose';

// Support both MONGODB_URI and MONGO_URI for convenience
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    if (!MONGODB_URI) throw new Error('MONGODB_URI (or MONGO_URI) must be set within .env');

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }
    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorName = err instanceof Error ? err.name : '';
        
        if (errorName.includes('ServerSelectionError') || errorMessage.includes('ServerSelectionError')) {
             console.error('\n❌ MongoDB Connection Error: Could not connect to any servers.');
             console.error('💡 This is often caused by an IP whitelist issue in MongoDB Atlas.');
             try {
                 // Try to fetch public IP to help the user
                 const response = await fetch('https://ifconfig.me/ip');
                 const ip = await response.text();
                 console.error(`👉 Your current public IP is: ${ip.trim()}`);
                 console.error('🔗 Add this IP to your Atlas whitelist: https://cloud.mongodb.com/\n');
             } catch (ipErr) {
                 // Ignore IP fetch errors
             }
        }
        throw err;
    }

    // Mask potential credentials in the URI before logging
    const maskedUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`connected to database ${process.env.NODE_ENV} - ${maskedUri}`);
    return cached.conn;
}