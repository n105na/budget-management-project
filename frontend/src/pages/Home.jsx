import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-[#f6f8f9] text-[#2b3d50]">
      <div className="text-center max-w-4xl p-16 rounded-2xl shadow-lg bg-white">
        <div
          className="inline-flex items-center justify-center p-4 rounded-full mb-6 shadow bg-[#870839]">
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
            className="px-6 py-2 rounded-md font-semibold shadow transition hover:opacity-90 hover:cursor-pointer bg-[#00064d] text-[#f6f8f9]"
            onClick={() => navigate('/login')}
          >
            Login to Get Started
          </button>
           {/*
          <button
            className="px-6 py-2 rounded-md font-semibold border transition  hover:cursor-pointer border-[#00064d] bg-[#f6f8f9] text-[#00064d]"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
          */}
        </div>
      </div>
    </div>
  );
}
