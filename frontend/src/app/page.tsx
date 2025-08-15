'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckSquare, Brain, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Smart Todo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Smart Todo List</span>
            <span className="block text-blue-600">with AI Power</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Intelligent task management with AI-powered prioritization, deadline suggestions, 
            and context-aware recommendations. Transform your productivity with smart insights.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started Free
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">AI Prioritization</h3>
              <p className="mt-2 text-base text-gray-500">
                Smart task ranking based on urgency and context analysis
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Deadlines</h3>
              <p className="mt-2 text-base text-gray-500">
                AI-suggested realistic deadlines based on task complexity
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Context Analysis</h3>
              <p className="mt-2 text-base text-gray-500">
                Process daily context from messages, emails, and notes
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Organization</h3>
              <p className="mt-2 text-base text-gray-500">
                Auto-categorization and intelligent task enhancement
              </p>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-20 max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Try Demo Account
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">Username:</span>
                <span className="font-mono">testuser</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Password:</span>
                <span className="font-mono">shri*****8</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h2 className="ml-3 text-xl font-bold text-gray-900">Smart Todo</h2>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              AI-Powered Task Management for Enhanced Productivity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
