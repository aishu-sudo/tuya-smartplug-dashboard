let deviceState = true; // simulate ON by default

export default function handler(req, res) {
    if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        deviceState = body.state;
        return res.status(200).json({ success: true, state: deviceState });
    }

    res.status(405).json({ success: false, message: 'Method Not Allowed' });
}