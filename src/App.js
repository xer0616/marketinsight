import React, { useState } from 'react';
import './App.css';

function App() {
  const [showMessage, setShowMessage] = useState(false);

  const toggleMessage = () => {
    setShowMessage(!showMessage);
  };

  return (
    <div className="App">
      <h1>Welcome to My GitHub Page!</h1>
      <button onClick={toggleMessage}>
        {showMessage ? 'Hide Message' : 'Show Message'}
      </button>
      {showMessage && <p>Hello, this is a simple React demo!</p>}
    </div>
  );
}

export default App;
