import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid username or password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-brand-background">
      <div className="w-full max-w-sm p-8 space-y-6 bg-brand-surface border border-brand-border rounded-xl shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-brand-primary">naturals</h1>
          <p className="text-xs text-brand-text-secondary tracking-[0.2em]">SALON | SPA | MAKEUP STUDIO</p>
        </div>
        <h1 className="text-2xl font-bold text-center text-brand-text-primary">Voucher Portal Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username (e.g., admin or user1)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-brand-surface border border-brand-border rounded-lg text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-brand-surface border border-brand-border rounded-lg text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <div>
            <button type="submit" disabled={isLoading} className="w-full py-3 font-semibold text-white transition-colors bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to rounded-lg shadow-sm hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};