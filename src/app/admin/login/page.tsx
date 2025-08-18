// app/admin/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 1 * 60 * 1000; // 15 minutes

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Check for existing lockout on component mount
  useEffect(() => {
    const storedLockoutEnd = localStorage.getItem('admin_lockout_end');
    const storedAttempts = localStorage.getItem('admin_login_attempts');
    
    if (storedLockoutEnd) {
      const lockoutEnd = parseInt(storedLockoutEnd);
      const now = Date.now();
      
      if (now < lockoutEnd) {
        setIsLocked(true);
        setLockoutEndTime(lockoutEnd);
      } else {
        // Lockout expired, clear storage
        localStorage.removeItem('admin_lockout_end');
        localStorage.removeItem('admin_login_attempts');
      }
    }
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || !lockoutEndTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((lockoutEndTime - now) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsLocked(false);
        setLockoutEndTime(null);
        setLoginAttempts(0);
        localStorage.removeItem('admin_lockout_end');
        localStorage.removeItem('admin_login_attempts');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutEndTime]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log("User already logged in, redirecting...", user.uid);
      router.push("/admin/upload");
    }
  }, [user, authLoading, router]);

  const handleFailedAttempt = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('admin_login_attempts', newAttempts.toString());
    
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutEnd = Date.now() + LOCKOUT_DURATION;
      setIsLocked(true);
      setLockoutEndTime(lockoutEnd);
      localStorage.setItem('admin_lockout_end', lockoutEnd.toString());
      setError(`Too many failed attempts. Account locked for 15 minutes.`);
    } else {
      const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
      setError(`Invalid credentials. ${remaining} attempt(s) remaining before lockout.`);
    }
  };

  const clearFailedAttempts = () => {
    setLoginAttempts(0);
    localStorage.removeItem('admin_login_attempts');
  };

  const validateInput = (email: string, password: string): string | null => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    
    // Password strength validation
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    
    // Check for potential injection attempts
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /expression\(/i
    ];
    
    const inputString = email + password;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(inputString)) {
        return "Invalid characters detected";
      }
    }
    
    return null;
  };

  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/invalid-email':
        return 'Invalid email format';
      default:
        return 'Login failed. Please try again.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      return;
    }
    
    setLoading(true);
    setError("");

    // Input validation
    const validationError = validateInput(email, password);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login with email:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", result.user.uid);
      
      // Clear failed attempts on successful login
      clearFailedAttempts();
      
      // Verify user has admin privileges (implement this check in your auth context)
      // You should validate admin status server-side as well
      const tokenResult = await result.user.getIdTokenResult();
      
      // For development: comment out the admin check or set up admin claims first
      // Uncomment the lines below once you've set up admin claims
      /*
      if (!tokenResult.claims.admin) {
        await auth.signOut();
        throw new Error('Unauthorized: Admin access required');
      }
      */
      
      console.log('Token claims:', tokenResult.claims);
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        console.log("Redirecting to upload page...");
        router.push("/admin/upload");
      }, 100);
      
    } catch (err: any) {
      console.error("Login error:", err);
      
      if (err.code) {
        setError(getFirebaseErrorMessage(err.code));
      } else {
        setError(err.message || "Login failed");
      }
      
      handleFailedAttempt();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Don't render login form if user is already authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure administrative access
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLocked || loading}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                maxLength={100}
              />
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={isLocked || loading}
                className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={100}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked || loading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            </div>
          )}

          {isLocked && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <div className="text-orange-600 text-sm text-center">
                Account locked. Time remaining: {formatTime(timeRemaining)}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || isLocked}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div>
            <Link 
              href="/" 
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </form>

        {loginAttempts > 0 && !isLocked && (
          <div className="text-center text-xs text-gray-500">
            Failed attempts: {loginAttempts}/{MAX_LOGIN_ATTEMPTS}
          </div>
        )}
      </div>
    </div>
  );
}