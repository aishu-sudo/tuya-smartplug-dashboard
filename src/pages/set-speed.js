let currentSpeed = 100;

export default function handler(req, res) {
    if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        currentSpeed = body.speed;
        return res.status(200).json({ success: true, speed: currentSpeed });
    }

    res.status(405).json({ success: false, message: 'Method Not Allowed' });
}