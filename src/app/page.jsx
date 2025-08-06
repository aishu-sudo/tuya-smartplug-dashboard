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
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOn, setIsOn] = useState(true);
    const [speed, setSpeed] = useState(100); // 0-100%

    // Fetch real-time data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/status');
                const json = await res.json();

                if (json.success) {
                    setData(json.data);
                } else {
                    setError(json.error || 'Failed to fetch');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch historical data
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/history');
                const json = await res.json();
                if (json.success) {
                    setHistory(json.data);
                }
            } catch (err) {
                console.error('History fetch error:', err);
            }
        };

        fetchHistory();
    }, []);

    const toggleDevice = async () => {
        try {
            const res = await fetch('/api/toggle', {
                method: 'POST',
                body: JSON.stringify({ state: !isOn }),
                headers: { 'Content-Type': 'application/json' },
            });
            const json = await res.json();
            if (json.success) {
                setIsOn(!isOn);
            }
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
            console.error('Speed change failed:', err);
        }
    };

    const formatVoltage = (raw) => (raw / 10).toFixed(1); // 2323 => 232.3 V
    const energyCostPerKWh = 12; // BDT per kWh (adjust as needed)

    const chartData = {
        labels: history.map((item) => item.date),
        datasets: [
            {
                label: 'Energy (kWh)',
                data: history.map((item) => item.kwh),
                borderColor: 'blue',
                fill: false,
            },
        ],
    };

    return (
        <div style={{ fontFamily: 'Arial', padding: 20 }}>
            <h1>🔌 Tuya Smart Plug Dashboard</h1>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>❌ {error}</p>}

            {data && (
                <>
                    <ul>
                        <li><strong>Power:</strong> {data.cur_power} W</li>
                        <li><strong>Current:</strong> {data.cur_current} mA</li>
                        <li><strong>Voltage:</strong> {formatVoltage(data.cur_voltage)} V</li>
                    </ul>

                    <button onClick={toggleDevice}>
                        {isOn ? 'Turn OFF' : 'Turn ON'}
                    </button>

                    <div style={{ marginTop: 20 }}>
                        <label><strong>Speed Control: </strong>{speed}%</label>
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
                        <h3>📅 Daily Energy Usage</h3>
                        <table border="1" cellPadding="5">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Energy (kWh)</th>
                                    <th>Cost (৳)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item.date}>
                                        <td>{item.date}</td>
                                        <td>{item.kwh.toFixed(2)}</td>
                                        <td>{(item.kwh * energyCostPerKWh).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <h3>📈 Energy Usage Trend</h3>
                        <Line data={chartData} />
                    </div>
                </>
            )}
        </div>
    );
}
