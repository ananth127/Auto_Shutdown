import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shutdown, setShutdown] = useState(false);

  const register = async () => {
    try {
      const res = await axios.post('https://auto-shutdown-alpha.vercel.app/register', { username, password });
      alert(`User registered successfully. Unique ID: ${res.data.uniqueId}`);
    } catch (error) {
      alert('Error registering user');
    }
  };

  const login = async () => {
    try {
      const res = await axios.post('https://auto-shutdown-alpha.vercel.app/login', { username, password });
      setUniqueId(res.data.uniqueId);
      setIsLoggedIn(true);
      alert('Login successful');
    } catch (error) {
      alert('Error logging in');
    }
  };

  const generateExecutable = async () => {
    try {
      await axios.post('https://auto-shutdown-alpha.vercel.app/generate', { uniqueId });
      alert('Executable generated successfully');
    } catch (error) {
      alert('Error generating executable');
    }
  };

  const toggleShutdown = async () => {
    try {
      const newShutdownState = !shutdown; // Toggle shutdown value
      await axios.post('https://auto-shutdown-alpha.vercel.app/toggle-shutdown', { uniqueId, shutdown: newShutdownState });
      setShutdown(newShutdownState);
      alert(`Shutdown state updated to ${newShutdownState ? 'ON' : 'OFF'}`);
    } catch (error) {
      alert('Error toggling shutdown state');
    }
  };

  const fetchShutdownState = async () => {
    try {
      const res = await axios.get(`https://auto-shutdown-alpha.vercel.app/get-shutdown/${uniqueId}`);
      setShutdown(res.data.shutdown);
    } catch (error) {
      alert('Error fetching shutdown state');
    }
  };

  return (
    <div>
      <h1>Register / Login</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>

      {isLoggedIn && (
        <div>
          <h2>Manage Shutdown</h2>
          <button onClick={fetchShutdownState}>Fetch Shutdown State</button>
          <p>Current Shutdown State: {shutdown ? 'ON' : 'OFF'}</p>
          <button onClick={toggleShutdown}>
            {shutdown ? 'Turn OFF Shutdown' : 'Turn ON Shutdown'}
          </button>

          <div>
          <h2>Generate Executable</h2>
          <button onClick={generateExecutable}>Generate .exe</button>
        </div>
        </div>
        
      )}
    </div>
  );
}

export default App;
