const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Lipwa API Configuration
const LIPWA_API_KEY = 'lp_8aaa0ce9b6281b1c07e275d57244bcf034a641dff';
const LIPWA_CHANNEL_ID = 'CH_7C5A4904';
const LIPWA_API_URL = 'https://pay.lipwa.app/api/payments';

// In-memory storage for demo purposes
const paymentSessions = {};

// Endpoint to initiate STK Push
app.post('/api/stk', async (req, res) => {
    const { phone_number, amount, reference } = req.body;

    try {
        const response = await axios.post(LIPWA_API_URL, {
            amount,
            callback_url: 'https://yourdomain.com/api/lipwa-callback', // Replace with your actual callback URL
            channel_id: LIPWA_CHANNEL_ID,
            phone_number,
            api_ref: reference
        }, {
            headers: {
                'Authorization': `Bearer ${LIPWA_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Store the session for verification
        paymentSessions[reference] = {
            status: 'pending',
            phone_number,
            amount,
            response: response.data
        };

        res.json(response.data);
    } catch (error) {
        console.error('Error initiating STK Push:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to initiate STK Push' });
    }
});

// Endpoint to verify payment status (simplified for demo)
app.get('/api/verify', (req, res) => {
    const { reference } = req.query;
    const session = paymentSessions[reference];

    if (!session) {
        return res.status(404).json({ error: 'Payment session not found' });
    }

    // In a real app, you would call Lipwa's API to verify the status
    res.json({
        status: session.status,
        data: session.response
    });
});

// Callback endpoint for Lipwa
app.post('/api/lipwa-callback', (req, res) => {
    const { status, transaction_id, api_ref } = req.body;
    const session = paymentSessions[api_ref];

    if (session) {
        session.status = status;
        session.transaction_id = transaction_id;
    }

    console.log('Callback received:', req.body);
    res.status(200).send('Callback received');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
