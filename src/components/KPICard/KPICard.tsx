import { ArrowUp, ArrowDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  unit: string
  change: number
  icon: React.ReactNode
  color: string
  delay?: string
}

export default function KPICard({ title, value, unit, change, icon, color, delay = '' }: KPICardProps) {
  const isPositive = change >= 0

  return (
    <div
      className={`card relative overflow-hidden opacity-0 animate-fade-in-up ${delay}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${color === 'orange' ? 'bg-[#F97316]' : color === 'blue' ? 'bg-[#3B82F6]' : color === 'green' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
      <div className="flex items-start justify-between pl-4">
        <div>
          <div className="text-xs text-[#94A3B8] mb-1">{title}</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-[#F1F5F9]">{value}</span>
            <span className="text-xs text-[#64748B]">{unit}</span>
          </div>
          <div className="flex items-center mt-2 space-x-1">
            {isPositive ? (
              <ArrowUp className="w-3 h-3 text-[#22C55E]" />
            ) : (
              <ArrowDown className="w-3 h-3 text-[#EF4444]" />
            )}
            <span className={`text-xs font-mono ${isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-[10px] text-[#64748B]">较上周</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          color === 'orange' ? 'bg-[#F97316]/15' : color === 'blue' ? 'bg-[#3B82F6]/15' : color === 'green' ? 'bg-[#22C55E]/15' : 'bg-[#EF4444]/15'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
