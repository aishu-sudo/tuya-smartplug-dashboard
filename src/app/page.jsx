"use client";

import { useEffect, useState } from 'react';

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Poll every 5 seconds
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
        const interval = setInterval(fetchData, 5000); // every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const formatVoltage = (raw) => (raw / 10).toFixed(1); // e.g., 2323 => 232.3 V

    return (
        <div style={{ fontFamily: 'Arial', padding: 20 }}>
            <h1>🔌 Tuya Smart Plug Dashboard</h1>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>❌ {error}</p>}

            {data && (
                <ul>
                    <li><strong>Power:</strong> {data.cur_power} W</li>
                    <li><strong>Current:</strong> {data.cur_current} mA</li>
                    <li><strong>Voltage:</strong> {formatVoltage(data.cur_voltage)} V</li>
                </ul>
            )}
        </div>
    );
}
