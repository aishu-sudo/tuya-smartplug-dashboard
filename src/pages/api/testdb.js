// pages/api/testdb.js
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("tuya-dashboard");

        // Try to list collections
        const collections = await db.listCollections().toArray();

        res.status(200).json({
            success: true,
            message: "✅ MongoDB connected!",
            collections: collections.map(col => col.name)
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            message: "❌ MongoDB connection failed",
            error: error.message
        });
    }
}