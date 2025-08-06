"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
    const [data, setData] = useState(null);
    const [livePowerData, setLivePowerData] = useState([]);
    const [liveVoltageData, setLiveVoltageData] = useState([]);
    const [liveCurrentData, setLiveCurrentData] = useState([]);
    const [error, setError] = useState(null);
    const [speed, setSpeed] = useState(100);

    // Fetch real-time power data and store to MongoDB
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/status");
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                    const powerValue = json.data.Power || json.data["cur_power"] || 0;
                    const voltageValue = (json.data.Voltage || json.data["cur_voltage"] || 0) / 10;
                    const currentValue = json.data.Current || json.data["cur_current"] || 0;

                    setLivePowerData(prev => [
                        ...prev.slice(-29),
                        {
                            time: currentTime,
                            value: powerValue,
                        }
                    ]);

                    setLiveVoltageData(prev => [
                        ...prev.slice(-29),
                        {
                            time: currentTime,
                            value: voltageValue,
                        }
                    ]);

                    setLiveCurrentData(prev => [
                        ...prev.slice(-29),
                        {
                            time: currentTime,
                            value: currentValue,
                        }
                    ]);

                    // 🔄 Store in MongoDB - map the correct field names
                    const logData = {
                        cur_power: powerValue,
                        cur_voltage: voltageValue * 10, // Store as original format
                        cur_current: currentValue,
                    };
                    
                    await fetch("/api/log", {
                        method: "POST",
                        body: JSON.stringify(logData),
                        headers: { "Content-Type": "application/json" }
                    });
                } else {
                    setError("Status error");
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const changeSpeed = async (value) => {
        setSpeed(value);
        try {
            await fetch("/api/set-speed", {
                method: "POST",
                body: JSON.stringify({ speed: value }),
                headers: { "Content-Type": "application/json" },
            });
        } catch (err) {
            console.error("Speed update failed:", err);
        }
    };

    const powerChartData = {
        labels: livePowerData.map((p) => p.time),
        datasets: [
            {
                label: "Live Power (W)",
                data: livePowerData.map((p) => p.value),
                borderColor: "green",
                backgroundColor: "rgba(0, 255, 0, 0.1)",
                fill: false,
                tension: 0.4,
            },
        ],
    };

    const voltageChartData = {
        labels: liveVoltageData.map((v) => v.time),
        datasets: [
            {
                label: "Live Voltage (V)",
                data: liveVoltageData.map((v) => v.value),
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.1)",
                fill: false,
                tension: 0.4,
            },
        ],
    };

    const currentChartData = {
        labels: liveCurrentData.map((c) => c.time),
        datasets: [
            {
                label: "Live Current (mA)",
                data: liveCurrentData.map((c) => c.value),
                borderColor: "red",
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                fill: false,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ fontFamily: "Arial", padding: 20 }}>
            <h1>🔌 Tuya Smart Plug Dashboard</h1>

            {error && <p style={{ color: "red" }}>❌ {error}</p>}

            {data && (
                <>
                    <div style={{ 
                        padding: "15px", 
                        backgroundColor: "#e8f5e8", 
                        borderRadius: "8px",
                        border: "2px solid #44ff44",
                        marginBottom: "20px"
                    }}>
                        <h3 style={{ margin: "0 0 10px 0", color: "#2d5a2d" }}>
                            Device Status: ON
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            <li><strong>Power:</strong> {data.Power || data.cur_power || 0} W</li>
                            <li><strong>Current:</strong> {data.Current || data.cur_current || 0} mA</li>
                            <li><strong>Voltage:</strong> {((data.Voltage || data.cur_voltage || 0) / 10).toFixed(1)} V</li>
                        </ul>
                    </div>

                    <div style={{ marginTop: 10, display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        
                    </div>

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
                        <Line data={powerChartData} options={chartOptions} />
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <h3>⚡ Real-Time Voltage Usage</h3>
                        <Line data={voltageChartData} options={chartOptions} />
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <h3>🔋 Real-Time Current Usage</h3>
                        <Line data={currentChartData} options={chartOptions} />
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <h3>📜 Recorded History (Last 10 Entries)</h3>
                        <History />
                    </div>
                </>
            )}
        </div>
    );
}

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/history");
                const json = await res.json();
                if (json.success) {
                    setHistory(json.data);
                }
            } catch (error) {
                console.error("History fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div style={{ marginTop: 20 }}>
            {loading && <p>Loading history...</p>}
            {!loading && history.length === 0 && <p>No history found.</p>}
            <ul>
                {history.map((item, index) => (
                    <li key={index}>
                        🕒 {new Date(item.timestamp).toLocaleString()} — 
                        ⚡ Power: {item.Power}W, 
                        🔌 Voltage: {(item.Voltage / 10).toFixed(1)}V, 
                        🔋 Current: {item.Current}mA
                    </li>
                ))}
            </ul>
        </div>
    );
}
