import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
    >
      <div className="text-center max-w-4xl p-16 rounded-2xl shadow-lg"
        style={{ backgroundColor: 'white' }}
      >
        <div
          className="inline-flex items-center justify-center p-4 rounded-full mb-6 shadow"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <LayoutDashboard className="h-12 w-12 text-white" />
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Mission Budget Management System
        </h1>

        <p className="text-lg mb-8 text-gray-600">
          A secure platform for managing university mission reimbursements and budgets.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="px-6 py-2 rounded-md font-semibold shadow transition hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            onClick={() => navigate('/login')}
          >
            Login to Get Started
          </button>

          <button
            className="px-6 py-2 rounded-md font-semibold border transition hover:bg-gray-100"
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
            onClick={() => navigate('/dashboard')}
          >
            Somthing
          </button>
        </div>
      </div>
    </div>
  );
}
