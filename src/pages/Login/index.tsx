import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThermometerSun, User, Lock, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/store'
import type { UserRole } from '@/types'

const roles: { value: UserRole; label: string }[] = [
  { value: 'headquarters', label: '总部调度管理员' },
  { value: 'regional', label: '区域经理' },
  { value: 'team_leader', label: '片区运维组长' },
  { value: 'operator', label: '换热站运维员' },
]

const userPresets: Record<UserRole, { name: string; region: string }> = {
  headquarters: { name: '张建国', region: '全国' },
  regional: { name: '王强', region: '华北区域' },
  team_leader: { name: '李明', region: '海淀区' },
  operator: { name: '赵亮', region: '中关村换热站' },
}

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('headquarters')
  const [showRoles, setShowRoles] = useState(false)
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)

  const handleLogin = () => {
    const preset = userPresets[selectedRole]
    login({
      id: `user_${selectedRole}`,
      name: preset.name,
      role: selectedRole,
      region: preset.region,
    })
    navigate('/dashboard')
  }

  const currentRole = roles.find((r) => r.value === selectedRole)!

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F97316]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316]/15 rounded-2xl mb-4">
            <ThermometerSun className="w-9 h-9 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">智慧供热管网</h1>
          <p className="text-sm text-[#64748B]">运营监测与智能调度分析平台</p>
        </div>

        <div className="card p-8 space-y-6">
          <div>
            <label className="text-xs text-[#94A3B8] mb-2 block">选择角色</label>
            <div className="relative">
              <button
                onClick={() => setShowRoles(!showRoles)}
                className="w-full flex items-center justify-between bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] hover:border-[#475569] transition-colors"
              >
                <span>{currentRole.label}</span>
                <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${showRoles ? 'rotate-180' : ''}`} />
              </button>
              {showRoles && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F172A] border border-[#334155] rounded-lg overflow-hidden z-10">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => { setSelectedRole(role.value); setShowRoles(false) }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        role.value === selectedRole ? 'bg-[#F97316]/10 text-[#F97316]' : 'text-[#94A3B8] hover:bg-[#1E293B]'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#94A3B8] mb-2 block">用户名</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={userPresets[selectedRole].name}
                readOnly
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-3 text-sm text-[#F1F5F9] focus:border-[#F97316] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#94A3B8] mb-2 block">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="password"
                defaultValue="••••••••"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-3 text-sm text-[#F1F5F9] focus:border-[#F97316] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="text-xs text-[#64748B]">
            当前角色可查看范围：<span className="text-[#F97316]">{userPresets[selectedRole].region}</span>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#F97316]/25 text-sm"
          >
            登录系统
          </button>
        </div>

        <div className="text-center mt-6 text-[10px] text-[#475569]">
          智慧供热管网运营监测与智能调度分析平台 v2.0
        </div>
      </div>
    </div>
  )
}
