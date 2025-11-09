import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
            {/* Login Container */}
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-12 animate-slide-up">
                    <h1 className="text-2xl font-medium text-white mb-2 font-mono">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-dark-muted font-mono">
                        Login to your LITE account
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {error && (
                        <div className="bg-red-500/5 border border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm font-mono">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            disabled={loading}
                            className="input-field"
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            disabled={loading}
                            className="input-field"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full mt-8"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <p className="text-sm text-dark-muted font-mono">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-accent-blue hover:underline transition-all font-medium font-mono"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
