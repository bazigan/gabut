import React, { useState, useEffect } from 'react';

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
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
      <h2>Buat VM Proxmox</h2>
      <label>Proxmox Host:
        <select name="proxmoxHost" value={form.proxmoxHost} onChange={handleChange} required>
          <option value="">Pilih Host</option>
          {hosts.length === 0 && (
            <option value="172.23.8.113">172.23.8.113</option>
          )}
          {hosts.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </label>
      <label>Username:
        <select name="username" value={form.username} onChange={handleChange} required>
          <option value="">Pilih User</option>
          {users.length === 0 && <>
            <option value="root@pam">root@pam</option>
            <option value="admin@pam">admin@pam</option>
          </>}
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </label>
      <label>Password:
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      </label>
      <label>Node:
        <select name="node" value={form.node} onChange={handleChange} required>
          <option value="">Pilih Node</option>
          {nodes.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label>VM ID:
        <select name="vmid" value={form.vmid} onChange={handleChange} required>
          <option value="">Pilih VMID</option>
          {vmids.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label>VM Name:
        <select name="name" value={form.name} onChange={handleChange} required>
          <option value="">Pilih Nama</option>
          {names.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label>Memory (MB):
        <select name="memory" value={form.memory} onChange={handleChange} required>
          <option value="">Pilih Memory</option>
          {memories.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
      <label>CPU Cores:
        <select name="cores" value={form.cores} onChange={handleChange} required>
          <option value="">Pilih Core</option>
          {cores.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>Storage Name:
        <select name="storage" value={form.storage} onChange={handleChange} required>
          <option value="">Pilih Storage</option>
          {storages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>ISO Image:
        <select name="iso" value={form.iso} onChange={handleChange} required>
          <option value="">Pilih ISO</option>
          {isos.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Buat VM'}</button>
      <div style={{ marginTop: 10 }}>{message}</div>
    </form>
  );
}
