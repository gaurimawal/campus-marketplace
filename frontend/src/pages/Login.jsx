import { memo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card p-8 bg-white/5 border border-white/10 backdrop-blur-xl">
        <h1 className="mb-2 text-2xl font-bold text-white">Sign In</h1>
        <p className="mb-8 text-sm text-gray-400">
          Access your Campus Exchange account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
              className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
              placeholder="you@university.edu"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
              className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-violet-400 hover:text-violet-300">
            Register
          </Link>
        </p>

        <div className="mt-6 rounded-xl bg-white/5 border border-white/5 p-4 text-xs text-gray-400">
          <p className="font-bold text-white mb-1">Demo credentials</p>
          <p>Email: <span className="text-gray-200">admin@campus.edu</span></p>
          <p>Password: <span className="text-gray-200">admin123</span></p>
        </div>
      </div>
    </div>
  );
}

export default memo(Login);
