// Backend Express.js server for user panel

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Dummy register endpoint
app.post('/api/register', (req, res) => {
  // TODO: Implement registration logic
  res.json({ success: true, message: 'Register endpoint hit', data: req.body });
});

// Dummy login endpoint
app.post('/api/login', (req, res) => {
  // TODO: Implement login logic
  res.json({ success: true, message: 'Login endpoint hit', data: req.body });
});


// Endpoint untuk membuat VM di Proxmox
const axios = require('axios');

app.post('/api/create-vm', async (req, res) => {
  let { proxmoxHost, username, password, node, vmid, name, memory, cores, storage, iso } = req.body;
  // Gunakan default dari .env jika tidak dikirim dari frontend
  if (!proxmoxHost) proxmoxHost = process.env.DEFAULT_PROXMOX_HOST;
  const proxmoxPort = process.env.DEFAULT_PROXMOX_PORT || 8006;
  try {
    // 1. Login ke Proxmox untuk dapatkan ticket
    const loginRes = await axios.post(`https://${proxmoxHost}:${proxmoxPort}/api2/json/access/ticket`, {
      username,
      password
    }, { httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });

    const ticket = loginRes.data.data.ticket;
    const csrf = loginRes.data.data.CSRFPreventionToken;

    // 2. Buat VM
    const createRes = await axios.post(
      `https://${proxmoxHost}:${proxmoxPort}/api2/json/nodes/${node}/qemu`,
      {
        vmid,
        name,
        memory,
        cores,
        storage,
        iso
      },
      {
        headers: {
          Cookie: `PVEAuthCookie=${ticket}`,
          CSRFPreventionToken: csrf
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      }
    );

    res.json({ success: true, data: createRes.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: err.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
