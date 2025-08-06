import { useEffect, useState } from 'react';

export default function Home() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`https://openapi.tuyaeu.com/v1.0/iot-03/devices/${process.env.DEVICE_ID}/status`)
            .then(res => res.json())
            .then(json => setData(json.data))
            .catch(err => console.error('Failed to fetch:', err));
    }, []);

    return (
        <div style={{ fontFamily: 'Arial', padding: 20 }}>
            <h1>🔌 Tuya Smart Plug Dashboard</h1>
            {data ? (
                <ul>
                    <li><strong>Power:</strong> {data.power} W</li>
                    <li><strong>Current:</strong> {data.current} mA</li>
                    <li><strong>Voltage:</strong> {data.voltage} V</li>
                </ul>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
