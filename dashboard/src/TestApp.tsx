import React, { useState } from 'react';

const TestApp: React.FC = () => {
  const [count, setCount] = useState(0);
  
  console.log('TestApp rendered, count:', count);
  
  const handleClick = () => {
    console.log('Button clicked! Current count:', count);
    setCount(count + 1);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0b0f',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      gap: '20px'
    }}>
      <h1 style={{ fontSize: '32px' }}>Button Test Page</h1>
      
      <div style={{
        background: count > 0 ? '#00e5a0' : '#ff4d6a',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        CLICKS: {count}
      </div>
      
      <button
        onClick={handleClick}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          background: '#7c5cfc',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        CLICK ME!
      </button>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        maxWidth: '400px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <strong>Instructions:</strong>
        <ul style={{ marginTop: '10px', textAlign: 'left' }}>
          <li>Open browser console (F12)</li>
          <li>Click the button above</li>
          <li>Watch the counter increase</li>
          <li>Check console for log messages</li>
        </ul>
        {count > 0 && (
          <div style={{ marginTop: '15px', color: '#00e5a0', fontWeight: 'bold' }}>
            ✅ Buttons are working! You've clicked {count} times.
          </div>
        )}
      </div>
      
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#00e5a0',
        color: '#000',
        padding: '8px 16px',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '12px'
      }}>
        REACT LOADED ✓
      </div>
    </div>
  );
};

export default TestApp;
