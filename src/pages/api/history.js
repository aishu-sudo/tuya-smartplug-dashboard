// pages/api/history.js
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("tuya-dashboard");

        const recent = await db
            .collection("power_logs")
            .find({})
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();

        const formatted = recent.map((item) => ({
            timestamp: item.timestamp,
            Power: item.cur_power,
            Voltage: item.cur_voltage,
            Current: item.cur_current
        }));

        res.status(200).json({ success: true, data: formatted.reverse() });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}