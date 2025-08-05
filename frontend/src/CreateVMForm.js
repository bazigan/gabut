import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
      <h2>Buat VM Proxmox</h2>
      <input name="proxmoxHost" placeholder="Proxmox Host (IP/domain)" value={form.proxmoxHost} onChange={handleChange} required />
      <input name="username" placeholder="Username (user@pam)" value={form.username} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <input name="node" placeholder="Node Name" value={form.node} onChange={handleChange} required />
      <input name="vmid" placeholder="VM ID (unik)" value={form.vmid} onChange={handleChange} required />
      <input name="name" placeholder="VM Name" value={form.name} onChange={handleChange} required />
      <input name="memory" placeholder="Memory (MB)" value={form.memory} onChange={handleChange} required />
      <input name="cores" placeholder="CPU Cores" value={form.cores} onChange={handleChange} required />
      <input name="storage" placeholder="Storage Name" value={form.storage} onChange={handleChange} required />
      <input name="iso" placeholder="ISO Image (cth: local:iso/ubuntu.iso)" value={form.iso} onChange={handleChange} required />
      <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Buat VM'}</button>
      <div style={{ marginTop: 10 }}>{message}</div>
    </form>
  );
}
