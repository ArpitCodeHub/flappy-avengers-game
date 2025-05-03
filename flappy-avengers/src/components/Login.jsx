import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Login = ({ onLogin, onSwitchToSignup, onPlayAsGuest }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, playAsGuest } = useContext(AuthContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.message);
    }
  };
  
  const handlePlayAsGuest = () => {
    const result = playAsGuest();
    if (result.success) {
      onPlayAsGuest(result.user);
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Login to Flappy Avengers</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p className="auth-switch">
        Don't have an account? <button onClick={onSwitchToSignup} disabled={loading}>Sign up</button>
      </p>
      
      <button onClick={handlePlayAsGuest} className="guest-button" disabled={loading}>
        Play as Guest
      </button>
    </div>
  );
};

export default Login;