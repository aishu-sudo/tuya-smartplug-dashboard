import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("tuya-dashboard");

        // Try to list collections
        const collections = await db.listCollections().toArray();

        return NextResponse.json({
            success: true,
            message: "✅ MongoDB connected!",
            collections: collections.map(col => col.name)
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "❌ MongoDB connection failed",
            error: error.message
        }, { status: 500 });
    }
}