import React from 'react';
import { Bell, Settings, User, Search } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Title section */}
        <div className="flex-1">
          {title && <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>}
          {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索治理日志、任务或角色..." 
            className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2 pl-10 pr-4 text-sm transition-all outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <button className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Settings */}
          <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
            <Settings size={20} />
          </button>

          <div className="h-8 w-px bg-slate-200 mx-1"></div>

          {/* User Profile */}
          <button className="flex items-center gap-2 p-1.5 pr-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <User size={18} />
            </div>
            <span className="text-sm font-bold hidden sm:inline-block">管理员</span>
          </button>
        </div>
      </div>
    </header>
  );
}
