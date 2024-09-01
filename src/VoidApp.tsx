import { useEffect, useState } from 'react';
import './VoidApp.css';
import { SERVER_URL } from './server';

function VoidApp() {
  const [count, setCount] = useState(0);

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
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default VoidApp;
