// app/api/log/route.js
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
    try {
        const body = await req.json();
        const client = await clientPromise;
        const db = client.db("tuya-dashboard");

        await db.collection("power_logs").insertOne({
            timestamp: new Date(),
            cur_power: body.cur_power,
            cur_voltage: body.cur_voltage,
            cur_current: body.cur_current,
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false, error: error.message });
    }
}