import { useEffect, useState } from 'react';
import './VoidApp.css';
import { SERVER_URL } from './server';
import Background from './components/background/Background';

function VoidApp() {
  const [message, setMessage] = useState('VOID');

  useEffect(() => {
    (async () => {
      const response = await fetch(`${SERVER_URL}/`);
      const responseData = await response.json() as { message: string; };
      setMessage(responseData.message);
    })();
  }, []);

  return (
    <>
      <h1>{message}</h1>
      <div className="card">
      </div>
      <Background />
    </>
  );
}

export default VoidApp;
