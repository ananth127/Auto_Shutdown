import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [shutdown, setShutdown] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); // Tracks if user is authorized
  const [id, setId] = useState(""); // Tracks the user's ID

  // Function to fetch the shutdown state from the backend
  const fetchShutdownState = async () => {
    try {
      const response = await axios.get('http://192.168.64.76:5000/get-shutdown');
      setShutdown(response.data.shutdown);
    } catch (error) {
      console.error('Error fetching shutdown state:', error);
    }
  };

  // Fetch the shutdown state and check if ID is "mine"
  useEffect(() => {
    fetchShutdownState();

    // Simulating a user ID, you can replace this with actual user info
    const userId = "mine"; // Example of a valid ID
    setId(userId);
    
    // If the ID is "mine", enable the toggle button
    if (userId === "mine") {
      setIsAuthorized(true);
    }
  }, []);

  // Function to toggle shutdown state
  const toggleShutdown = async () => {
    try {
      const newShutdownState = !shutdown;
      await axios.get(`http://192.168.64.76:5000/set-shutdown?shutdown=${newShutdownState}`);
      setShutdown(newShutdownState);
    } catch (error) {
      console.error('Error updating shutdown state:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Shutdown State: {shutdown ? 'ON' : 'OFF'}
      </h1>

      {/* Show toggle button only if authorized */}
      {isAuthorized ? (
        <button style={styles.button} onClick={toggleShutdown}>
          {shutdown ? 'Turn off Shutdown' : 'Turn on Shutdown'}
        </button>
      ) : (
        <p style={styles.warning}>You are not authorized to toggle the shutdown state.</p>
      )}
    </div>
  );
}

// Basic styling for the app's UI
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
  },
  button: {
    fontSize: '1rem',
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  warning: {
    color: 'red',
    fontSize: '1.2rem',
  },
};

export default App;
