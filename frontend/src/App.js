import React, { useState } from 'react';
import CreateVMForm from './CreateVMForm';

function App() {
  const [page, setPage] = useState('login');
  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h1>User Panel</h1>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setPage('login')}>Login</button>
        <button onClick={() => setPage('register')}>Register</button>
        <button onClick={() => setPage('create-vm')}>Buat VM</button>
      </div>
      {page === 'login' && <LoginForm />}
      {page === 'register' && <RegisterForm />}
      {page === 'create-vm' && <CreateVMForm />}
    </div>
  );
}

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    setMessage(data.message);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
      <div>{message}</div>
    </form>
  );
}

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    setMessage(data.message);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Register</button>
      <div>{message}</div>
    </form>
  );
}

export default App;
