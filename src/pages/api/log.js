// pages/api/log.js
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        // Safely parse the request body
        let body;
        try {
            body = req.body; // In Pages Router, body is already parsed
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return res.status(400).json({
                success: false,
                error: 'Invalid JSON in request body'
            });
        }

        // Validate required fields
        if (!body || typeof body !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Request body must be a valid object'
            });
        }

        const { cur_power, cur_voltage, cur_current } = body;

        // Validate that required fields exist and are numbers
        if (cur_power === undefined || cur_voltage === undefined || cur_current === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: cur_power, cur_voltage, cur_current'
            });
        }

        const client = await clientPromise;
        const db = client.db("tuya-dashboard");

        await db.collection("power_logs").insertOne({
            timestamp: new Date(),
            cur_power: Number(cur_power) || 0,
            cur_voltage: Number(cur_voltage) || 0,
            cur_current: Number(cur_current) || 0,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}