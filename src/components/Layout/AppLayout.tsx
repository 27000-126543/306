import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  TrendingUp,
  FileText,
  ThermometerSun,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react'
import { useAppStore } from '@/store'

const navItems = [
  { path: '/dashboard', label: '全国总览', icon: LayoutDashboard },
  { path: '/alerts', label: '预警中心', icon: AlertTriangle },
  { path: '/forecast', label: '负荷预测', icon: TrendingUp },
  { path: '/reports', label: '诊断报告', icon: FileText },
]

export default function AppLayout() {
  const { sidebarCollapsed, toggleSidebar, currentUser, logout } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabels: Record<string, string> = {
    headquarters: '总部调度管理员',
    regional: '区域经理',
    team_leader: '片区运维组长',
    operator: '换热站运维员',
  }

  return (
    <div className="flex h-screen bg-[#0F172A]">
      <aside
        className={`${
          sidebarCollapsed ? 'w-[68px]' : 'w-[220px]'
        } bg-[#0C1222] border-r border-[#1E293B] flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="h-16 flex items-center px-4 border-b border-[#1E293B]">
          <ThermometerSun className="w-7 h-7 text-[#F97316] flex-shrink-0" />
          {!sidebarCollapsed && (
            <div className="ml-3 overflow-hidden">
              <div className="text-sm font-semibold text-[#F1F5F9] whitespace-nowrap">智慧供热平台</div>
              <div className="text-[10px] text-[#64748B] whitespace-nowrap">运营监测与智能调度</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20'
                    : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9] border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="ml-3 text-sm whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#1E293B] p-3">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-[#F97316]" />
            </div>
            {!sidebarCollapsed && currentUser && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#F1F5F9] truncate">{currentUser.name}</div>
                <div className="text-[10px] text-[#64748B] truncate">{roleLabels[currentUser.role]}</div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={handleLogout} className="text-[#64748B] hover:text-[#EF4444] transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[#0C1222] border-b border-[#1E293B] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="text-[#64748B] hover:text-[#F1F5F9] transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2 text-xs text-[#64748B]">
              <span>全国</span>
              <span>/</span>
              <span className="text-[#F1F5F9]">运营监测总览</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-[#94A3B8]">
              <span className="status-dot status-dot-normal" />
              <span>系统运行正常</span>
            </div>
            <div className="text-xs text-[#64748B] font-mono">
              {new Date().toLocaleDateString('zh-CN')} {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
