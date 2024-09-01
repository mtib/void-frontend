import { useState } from 'react';
import './VoidApp.css';

function VoidApp() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Void</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default VoidApp;
