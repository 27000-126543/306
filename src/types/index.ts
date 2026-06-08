export type UserRole = 'headquarters' | 'regional' | 'team_leader' | 'operator'

export interface UserInfo {
  id: string
  name: string
  role: UserRole
  region?: string
  cityId?: string
}

export interface KPIData {
  totalHeatLoad: number
  avgHeatingEfficiency: number
  heatLossRate: number
  roomTempComplianceRate: number
  timestamp: string
}

export type QualityLevel = 'excellent' | 'good' | 'medium' | 'poor'

export interface CityHeatData {
  cityId: string
  cityName: string
  qualityLevel: QualityLevel
  complianceRate: number
  complaintRate: number
  heatLoad: number
  lng: number
  lat: number
}

export interface DistrictData {
  districtId: string
  cityId: string
  districtName: string
  complianceRate: number
  heatingEfficiency: number
  heatLossRate: number
}

export type StationStatus = 'normal' | 'warning' | 'error'

export interface HeatStation {
  stationId: string
  stationName: string
  districtId: string
  districtName: string
  supplyTemp: number
  returnTemp: number
  pressure: number
  complianceRate: number
  status: StationStatus
}

export interface TempHistoryPoint {
  time: string
  supplyTemp: number
  returnTemp: number
}

export interface RoomTempBoxPlotData {
  districtName: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]
}

export type AlertLevel = 1 | 2 | 3
export type AlertType = 'temperature' | 'pressure'
export type AlertStatus = 'pending' | 'confirmed' | 'reviewed' | 'approved' | 'resolved'

export interface ApprovalStep {
  step: number
  role: string
  assignee: string
  status: 'pending' | 'approved' | 'rejected'
  comment: string
  timestamp: string
}

export interface Alert {
  alertId: string
  level: AlertLevel
  type: AlertType
  region: string
  cityId: string
  stationName: string
  description: string
  status: AlertStatus
  createdAt: string
  updatedAt: string
  assignedTo: string
  approvalChain: ApprovalStep[]
}

export interface ForecastDataPoint {
  timestamp: string
  predictedLoad: number
  capacity: number
  temperature: number
}

export interface PeakShavingPlan {
  planId: string
  name: string
  description: string
  expectedEffect: string
  affectedScope: string
  priority: number
}

export interface WeeklyReport {
  reportId: string
  weekStart: string
  weekEnd: string
  region: string
  complianceRate: number
  complianceYoY: number
  complianceMoM: number
  heatLossRate: number
  energyCost: number
  energyCostYoY: number
  totalComplaints: number
  resolvedComplaints: number
}

export interface HeatLossReason {
  reason: string
  percentage: number
}

export interface EnergyCostItem {
  month: string
  cost: number
  unitAreaCost: number
}

export interface ComplianceTrend {
  month: string
  currentYear: number
  lastYear: number
}

export type WorkOrderStatus = 'pending_inspect' | 'in_progress' | 'pending_review' | 'recovered'

export interface WorkOrderProgress {
  id: string
  content: string
  operator: string
  timestamp: string
}

export interface WorkOrder {
  id: string
  stationId: string
  stationName: string
  alertId?: string
  alertLevel?: AlertLevel
  alertDesc?: string
  finding: string
  action: string
  estimatedRecovery: string
  status: WorkOrderStatus
  operator: string
  assignee: string
  createdAt: string
  updatedAt: string
  progress: WorkOrderProgress[]
}
