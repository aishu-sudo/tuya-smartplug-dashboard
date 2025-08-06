// pages/api/status.js
const { TuyaContext } = require('@tuya/tuya-connector-nodejs');
import clientPromise from '@/lib/mongodb';
require('dotenv').config();

const {
    ACCESS_ID,
    ACCESS_KEY,
    ENDPOINT,
    DEVICE_ID
} = process.env;

const tuya = new TuyaContext({
    baseUrl: ENDPOINT,
    accessKey: ACCESS_ID,
    secretKey: ACCESS_KEY
});

const dpMap = {
    "1": "Switch 1",
    "9": "Countdown 1",
    "17": "Add Electricity",
    "18": "Current",
    "19": "Power",
    "20": "Voltage",
    "21": "Test Bit",
    "22": "voltage coe",
    "23": "electric coe",
    "24": "power coe",
    "25": "electricity coe",
    "26": "Fault",
    "38": "Relay Status",
    "39": "Light Mode",
    "40": "Child Lock",
    "41": "Cycle Time",
    "42": "Random Time",
    "43": "Inching Switch",
    "51": "Overcharge Switch"
};

export default async function handler(req, res) {
    try {
        const response = await tuya.request({
            method: 'GET',
            path: `/v1.0/iot-03/devices/${DEVICE_ID}/status`
        });

        const result = {};
        for (const dp of response.result) {
            const label = dpMap[dp.code] || dp.code;
            result[label] = dp.value;
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error fetching status:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}