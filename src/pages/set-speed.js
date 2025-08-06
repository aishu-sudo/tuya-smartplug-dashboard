let currentSpeed = 100;

export default function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // Handle both cases: when body is already parsed and when it's a string
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            currentSpeed = body.speed;
            return res.status(200).json({ success: true, speed: currentSpeed });
        } catch (error) {
            console.error('Error parsing request body:', error);
            return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
        }
    }

    res.status(405).json({ success: false, message: 'Method Not Allowed' });
}