import { FormEvent, useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const AUTH_KEY = 'whatifverse_fake_auth';
const LOGIN_USER = 'hansil';
const LOGIN_PASS = 'hansil@890';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const onLogin = (event: FormEvent) => {
    event.preventDefault();

    if (username === LOGIN_USER && password === LOGIN_PASS) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
      return;
    }

    setError('Invalid credentials');
  };

  if (!isAuthenticated) {
    return (
      <main className="page" style={{ maxWidth: 520, paddingTop: '4rem' }}>
        <section className="card">
          <h1>What If Verse Login</h1>
          <p className="subtitle">Fake login for prototype access</p>
          <form className="stack-sm" onSubmit={onLogin}>
            <label>
              Username
              <input value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error ? <p className="warning">{error}</p> : null}
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </form>
        </section>
      </main>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
