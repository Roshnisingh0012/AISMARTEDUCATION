import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // FastAPI OAuth2PasswordRequestForm expects form-data
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // Save token
      localStorage.setItem('token', response.data.access_token);

      // Fetch user profile to determine role (optional, but good for redirecting)
      const userResponse = await axios.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${response.data.access_token}` }
      });

      const role = userResponse.data.role;
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/learner');
      }

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full mt-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="flex justify-center mb-6 text-blue-600">
          <LogIn size={48} />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Sign In</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Username)</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="learner@gov.in"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition mt-4 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo Accounts:</p>
          <p className="mt-1">Learner: <b>learner@gov.in</b> / <b>Learner@123</b></p>
          <p>Admin: <b>admin@gov.in</b> / <b>Admin@123</b></p>
        </div>
      </div>
    </div>
  );
};
