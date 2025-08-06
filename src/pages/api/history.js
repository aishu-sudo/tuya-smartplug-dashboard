import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("tuya-dashboard");

        const recent = await db
            .collection("power_logs")
            .find({})
            .sort({ timestamp: -1 })
            .limit(20)
            .toArray();

        const dailyData = recent.map((item) => ({
            date: item.timestamp.toISOString().split("T")[0],
            kwh: item.cur_power / 1000,
        }));

        return Response.json({ success: true, data: dailyData.reverse() });
    } catch (error) {
        return Response.json({ success: false, error: error.message });
    }
}