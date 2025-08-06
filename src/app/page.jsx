"use client";

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
    const [data, setData] = useState(null);
    const [livePowerData, setLivePowerData] = useState([]);
    const [error, setError] = useState(null);
    const [isOn, setIsOn] = useState(true);
    const [speed, setSpeed] = useState(100);

    // Fetch real-time power data every 5s
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/status');
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                    setLivePowerData(prev => [
                        ...prev.slice(-29), // keep 30 points max
                        {
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            value: json.data.cur_power,
                        }
                    ]);
                } else {
                    setError('Status error');
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleDevice = async () => {
        try {
            const res = await fetch('/api/toggle', {
                method: 'POST',
                body: JSON.stringify({ state: !isOn }),
                headers: { 'Content-Type': 'application/json' },
            });
            const json = await res.json();
            if (json.success) setIsOn(json.state);
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    const changeSpeed = async (value) => {
        setSpeed(value);
        try {
            await fetch('/api/set-speed', {
                method: 'POST',
                body: JSON.stringify({ speed: value }),
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (err) {
            console.error('Speed update failed:', err);
        }
    };

    const chartData = {
        labels: livePowerData.map((p) => p.time),
        datasets: [
            {
                label: 'Live Power (W)',
                data: livePowerData.map((p) => p.value),
                borderColor: 'green',
                fill: false,
            },
        ],
    };

    return (
        <div style={{ fontFamily: 'Arial', padding: 20 }}>
            <h1>🔌 Tuya Smart Plug Dashboard</h1>

            {error && <p style={{ color: 'red' }}>❌ {error}</p>}

            {data && (
                <>
                    <ul>
                        <li><strong>Power:</strong> {data.cur_power} W</li>
                        <li><strong>Current:</strong> {data.cur_current} mA</li>
                        <li><strong>Voltage:</strong> {(data.cur_voltage / 10).toFixed(1)} V</li>
                    </ul>

                    <button onClick={toggleDevice} style={{ marginTop: 10 }}>
                        {isOn ? 'Turn OFF' : 'Turn ON'}
                    </button>

                    <div style={{ marginTop: 20 }}>
                        <label><strong>Speed Control:</strong> {speed}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={speed}
                            onChange={(e) => changeSpeed(parseInt(e.target.value))}
                        />
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <h3>📈 Real-Time Power Usage</h3>
                        <Line data={chartData} />
                    </div>
                </>
            )}
        </div>
    );
}
