import React, { useState, useEffect } from 'react';

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #0074d9',
  borderRadius: 6,
  marginTop: 4,
  marginBottom: 2,
  fontSize: 16,
  background: '#f8fbff',
  color: '#222'
};
const selectStyle = {
  ...inputStyle
};
const buttonStyle = {
  background: '#0074d9',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 0',
  fontWeight: 600,
  fontSize: 18,
  marginTop: 8,
  cursor: 'pointer',
  boxShadow: '0 1px 4px #0074d922'
};

export default function CreateVMForm() {
  const [form, setForm] = useState({
    proxmoxHost: '',
    username: '',
    password: '',
    node: '',
    vmid: '',
    name: '',
    memory: '',
    cores: '',
    storage: '',
    iso: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // State untuk dropdown
  const [hosts, setHosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [vmids, setVmids] = useState([]);
  const [names, setNames] = useState([]);
  const [memories, setMemories] = useState([1024, 2048, 4096]);
  const [cores, setCores] = useState([1, 2, 4]);
  const [storages, setStorages] = useState([]);
  const [isos, setIsos] = useState([]);

  // Ambil data dropdown dari backend saat komponen mount atau saat host/user/password berubah
  useEffect(() => {
    // Hanya fetch jika sudah ada host, user, password
    if (!form.proxmoxHost || !form.username || !form.password) return;
    const fetchDropdowns = async () => {
      try {
        const params = {
          proxmoxHost: form.proxmoxHost,
          username: form.username,
          password: form.password
        };
        const paramStr = new URLSearchParams(params).toString();
        const url = `${process.env.REACT_APP_BACKEND_URL}/api/proxmox-dropdowns?${paramStr}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setNodes(data.nodes || []);
          setVmids(data.vmids || []);
          setNames(data.names || []);
          setStorages(data.storages || []);
          setIsos(data.isos || []);
        }
      } catch (err) {
        // Biarkan kosong jika gagal
      }
    };
    fetchDropdowns();
  }, [form.proxmoxHost, form.username, form.password]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-vm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('VM creation request sent!');
      } else {
        setMessage('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setMessage('Request failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: 400,
      margin: '32px auto',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 16px #0074d933',
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      border: '1px solid #0074d9'
    }}>
      <h2 style={{ color: '#0074d9', textAlign: 'center', marginBottom: 8 }}>Buat VM Proxmox</h2>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>Proxmox Host
        <select name="proxmoxHost" value={form.proxmoxHost} onChange={handleChange} required style={selectStyle}>
          <option value="">Pilih Host</option>
          {hosts.length === 0 && (
            <option value="172.23.8.113">172.23.8.113</option>
          )}
          {hosts.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>Username
        <input name="username" placeholder="Username (user@pam)" value={form.username} onChange={handleChange} required style={inputStyle} />
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>Password
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} />
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>Node
        <select name="node" value={form.node} onChange={handleChange} required style={selectStyle}>
          <option value="">Pilih Node</option>
          {nodes.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>VM ID
        <input name="vmid" placeholder="VM ID (unik)" value={form.vmid} onChange={handleChange} required style={inputStyle} />
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>VM Name
        <input name="name" placeholder="VM Name" value={form.name} onChange={handleChange} required style={inputStyle} />
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>Memory (MB)
        <input name="memory" placeholder="Memory (MB)" value={form.memory} onChange={handleChange} required style={inputStyle} />
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>CPU Cores
        <input name="cores" placeholder="CPU Cores" value={form.cores} onChange={handleChange} required style={inputStyle} />
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>Storage Name
        <select name="storage" value={form.storage} onChange={handleChange} required style={selectStyle}>
          <option value="">Pilih Storage</option>
          {storages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label style={{ color: '#0074d9', fontWeight: 500 }}>ISO Image
        <select name="iso" value={form.iso} onChange={handleChange} style={selectStyle}>
          <option value="">Pilih ISO (opsional)</option>
          {isos.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </label>
      <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'Processing...' : 'Buat VM'}</button>
      <div style={{ marginTop: 10, color: message.startsWith('Error') ? 'red' : '#0074d9', textAlign: 'center' }}>{message}</div>
    </form>
  );
//

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #0074d9',
  borderRadius: 6,
  marginTop: 4,
  marginBottom: 2,
  fontSize: 16,
  background: '#f8fbff',
  color: '#222'
};
const selectStyle = {
  ...inputStyle
};
const buttonStyle = {
  background: '#0074d9',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 0',
  fontWeight: 600,
  fontSize: 18,
  marginTop: 8,
  cursor: 'pointer',
  boxShadow: '0 1px 4px #0074d922'
};
}
