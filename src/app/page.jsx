"use client";

import { useEffect, useState } from 'react';

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/status');
                const json = await res.json();

                if (json.success) {
                    console.log(json)
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
    }, []);

    return (
        <div style={{ fontFamily: 'Arial', padding: 20 }}>
            <h1>🔌 Tuya Smart Plug Dashboard</h1>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>❌ {error}</p>}

            {data && (
                <ul>
                    <li><strong>Power:</strong> {data["Power"]} W</li>
                    <li><strong>Current:</strong> {data["Current"]} mA</li>
                    <li><strong>Voltage:</strong> {data["Voltage"]} V</li>
                    {/* Add more fields as needed */}
                </ul>
            )}
        </div>
    );
}
