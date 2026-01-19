import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Video, ShoppingBag, UserCircle, BarChart3, FolderOpen, User, LogOut, History } from 'lucide-react';
import { SoraPage } from './pages/SoraPage';
import { EcommercePage } from './pages/EcommercePage';
import { AnalyzePage } from './pages/AnalyzePage';
import { StudioPage } from './pages/StudioPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { authService } from './services/authService';

const Sidebar = () => {
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      authService.logout();
      window.location.href = '/login';
    }
  };

  return (
    <nav className="w-64 bg-slate-900 h-screen text-white p-6 fixed flex flex-col">
      <div className="text-2xl font-bold mb-10 text-brand-500">SoraStudio Pro</div>
      <div className="flex-1 space-y-4">
        <Link to="/projects" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><FolderOpen size={20}/> 项目管理</Link>
        <Link to="/history" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><History size={20}/> 历史记录</Link>
        <Link to="/sora" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><Video size={20}/> Sora 提示词</Link>
        <Link to="/analyze" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><BarChart3 size={20}/> 视频风格分析</Link>
        <Link to="/studio" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><UserCircle size={20}/> 数字人工作台</Link>
        <Link to="/ecommerce" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><ShoppingBag size={20}/> 电商带货</Link>
      </div>

      {/* 用户菜单 */}
      <div className="border-t border-slate-700 pt-4 space-y-2">
        <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg">
          <User size={20}/> 个人资料
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg w-full text-left"
        >
          <LogOut size={20}/> 退出登录
        </button>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<div className="text-2xl text-center py-20">欢迎来到 SoraStudio Pro<br/><span className="text-lg text-gray-600">请选择左侧功能开始使用</span></div>} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/sora" element={<SoraPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/ecommerce" element={<EcommercePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}