
const axios = require('axios');
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




app.post('/api/create-vm', async (req, res) => {
  let { proxmoxHost, username, password, node, vmid, name, memory, cores, storage, iso } = req.body;
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

    // 2. Buat payload hanya dengan field yang diizinkan
    const payload = {
      vmid,
      name,
      memory,
      cores,
      storage
    };
    // Hanya tambahkan iso jika ada, tidak kosong, dan storage bertipe iso
    if (iso && typeof iso === 'string' && iso.includes(':iso/') && iso.trim() !== '') {
      payload.iso = iso;
    }

    const createRes = await axios.post(
      `https://${proxmoxHost}:${proxmoxPort}/api2/json/nodes/${node}/qemu`,
      payload,
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

app.get('/api/proxmox-dropdowns', async (req, res) => {
  const { proxmoxHost, username, password } = req.query;
  const proxmoxPort = process.env.DEFAULT_PROXMOX_PORT || 8006;
  if (!proxmoxHost || !username || !password) {
    return res.json({ success: false, error: 'Missing credentials' });
  }
  try {
    // Login ke Proxmox
    const loginRes = await axios.post(`https://${proxmoxHost}:${proxmoxPort}/api2/json/access/ticket`, {
      username,
      password
    }, { httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });
    const ticket = loginRes.data.data.ticket;
    const csrf = loginRes.data.data.CSRFPreventionToken;

    // Get nodes
    const nodesRes = await axios.get(`https://${proxmoxHost}:${proxmoxPort}/api2/json/nodes`, {
      headers: { Cookie: `PVEAuthCookie=${ticket}` },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    const nodes = nodesRes.data.data.map(n => n.node);

    // Get storages (dari node pertama saja)
    let storages = [];
    let isos = [];
    if (nodes.length > 0) {
      const storageRes = await axios.get(`https://${proxmoxHost}:${proxmoxPort}/api2/json/nodes/${nodes[0]}/storage`, {
        headers: { Cookie: `PVEAuthCookie=${ticket}` },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      });
      storages = storageRes.data.data.map(s => s.storage);

      // Get ISO list dari storage yang bertipe iso
      const isoStorage = storageRes.data.data.find(s => s.content && s.content.includes('iso'));
      if (isoStorage) {
        const isoListRes = await axios.get(`https://${proxmoxHost}:${proxmoxPort}/api2/json/nodes/${nodes[0]}/storage/${isoStorage.storage}/content`, {
          headers: { Cookie: `PVEAuthCookie=${ticket}` },
          httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        isos = (isoListRes.data.data || []).filter(f => f.content === 'iso').map(f => `${isoStorage.storage}:iso/${f.volid.split('/').pop()}`);
      }
    }

    // Get nextid (VMID baru)
    let vmids = [];
    if (nodes.length > 0) {
      const nextidRes = await axios.get(`https://${proxmoxHost}:${proxmoxPort}/api2/json/cluster/nextid`, {
        headers: { Cookie: `PVEAuthCookie=${ticket}` },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      });
      vmids = [nextidRes.data.data];
    }

    // Names dummy (bisa diisi dari template/VM list jika mau)
    const names = ['ubuntu-test', 'debian-test'];

    res.json({ success: true, nodes, storages, isos, vmids, names });
  } catch (err) {
    res.json({ success: false, error: err.message, details: err.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
