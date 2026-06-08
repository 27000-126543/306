import type {
  CityHeatData,
  DistrictData,
  HeatStation,
  TempHistoryPoint,
  RoomTempBoxPlotData,
  Alert,
  ForecastDataPoint,
  PeakShavingPlan,
  WeeklyReport,
  HeatLossReason,
  EnergyCostItem,
  ComplianceTrend,
} from '@/types'

export const cityHeatData: CityHeatData[] = [
  { cityId: 'harbin', cityName: '哈尔滨', qualityLevel: 'excellent', complianceRate: 96.8, complaintRate: 0.8, heatLoad: 12500, lng: 126.63, lat: 45.75 },
  { cityId: 'changchun', cityName: '长春', qualityLevel: 'good', complianceRate: 93.2, complaintRate: 1.2, heatLoad: 10200, lng: 125.35, lat: 43.88 },
  { cityId: 'shenyang', cityName: '沈阳', qualityLevel: 'good', complianceRate: 91.5, complaintRate: 1.5, heatLoad: 11800, lng: 123.43, lat: 41.80 },
  { cityId: 'huhehaote', cityName: '呼和浩特', qualityLevel: 'good', complianceRate: 92.1, complaintRate: 1.1, heatLoad: 7800, lng: 111.75, lat: 40.84 },
  { cityId: 'urumqi', cityName: '乌鲁木齐', qualityLevel: 'medium', complianceRate: 87.5, complaintRate: 2.3, heatLoad: 8500, lng: 87.68, lat: 43.77 },
  { cityId: 'beijing', cityName: '北京', qualityLevel: 'excellent', complianceRate: 97.2, complaintRate: 0.6, heatLoad: 15200, lng: 116.41, lat: 39.90 },
  { cityId: 'tianjin', cityName: '天津', qualityLevel: 'good', complianceRate: 94.0, complaintRate: 1.0, heatLoad: 9800, lng: 117.20, lat: 39.08 },
  { cityId: 'shijiazhuang', cityName: '石家庄', qualityLevel: 'good', complianceRate: 91.8, complaintRate: 1.4, heatLoad: 8600, lng: 114.51, lat: 38.04 },
  { cityId: 'taiyuan', cityName: '太原', qualityLevel: 'medium', complianceRate: 88.3, complaintRate: 2.1, heatLoad: 7200, lng: 112.55, lat: 37.87 },
  { cityId: 'jinan', cityName: '济南', qualityLevel: 'good', complianceRate: 93.5, complaintRate: 1.1, heatLoad: 8900, lng: 117.00, lat: 36.67 },
  { cityId: 'zhengzhou', cityName: '郑州', qualityLevel: 'good', complianceRate: 92.7, complaintRate: 1.3, heatLoad: 9100, lng: 113.65, lat: 34.76 },
  { cityId: 'xian', cityName: '西安', qualityLevel: 'good', complianceRate: 94.1, complaintRate: 0.9, heatLoad: 10500, lng: 108.94, lat: 34.27 },
  { cityId: 'lanzhou', cityName: '兰州', qualityLevel: 'medium', complianceRate: 86.2, complaintRate: 2.8, heatLoad: 6500, lng: 103.83, lat: 36.06 },
  { cityId: 'xining', cityName: '西宁', qualityLevel: 'poor', complianceRate: 82.5, complaintRate: 3.5, heatLoad: 4200, lng: 101.78, lat: 36.62 },
  { cityId: 'yinchuan', cityName: '银川', qualityLevel: 'medium', complianceRate: 89.0, complaintRate: 1.9, heatLoad: 5100, lng: 106.27, lat: 38.47 },
  { cityId: 'dalian', cityName: '大连', qualityLevel: 'excellent', complianceRate: 95.5, complaintRate: 0.7, heatLoad: 7800, lng: 121.61, lat: 38.91 },
  { cityId: 'qiqihaer', cityName: '齐齐哈尔', qualityLevel: 'medium', complianceRate: 87.0, complaintRate: 2.4, heatLoad: 5600, lng: 123.97, lat: 47.35 },
  { cityId: 'jilin', cityName: '吉林', qualityLevel: 'good', complianceRate: 90.8, complaintRate: 1.6, heatLoad: 6200, lng: 126.55, lat: 43.84 },
  { cityId: 'tangshan', cityName: '唐山', qualityLevel: 'good', complianceRate: 92.3, complaintRate: 1.2, heatLoad: 7100, lng: 118.18, lat: 39.63 },
  { cityId: 'baotou', cityName: '包头', qualityLevel: 'medium', complianceRate: 88.7, complaintRate: 2.0, heatLoad: 6800, lng: 109.84, lat: 40.66 },
]

function genDistricts(cityId: string, cityName: string, names: string[]): DistrictData[] {
  return names.map((name, i) => {
    const id = `${cityId}_d${i}`
    return {
      districtId: id, cityId, districtName: name,
      complianceRate: +(85 + Math.random() * 13).toFixed(1),
      heatingEfficiency: +(84 + Math.random() * 10).toFixed(1),
      heatLossRate: +(5 + Math.random() * 5).toFixed(1),
    }
  })
}

function genStations(district: DistrictData, count: number): HeatStation[] {
  return Array.from({ length: count }, (_, i) => {
    const sid = `${district.districtId}_s${i}`
    const statuses: Array<'normal' | 'warning' | 'error'> = ['normal', 'normal', 'normal', 'normal', 'warning', 'error']
    return {
      stationId: sid,
      stationName: `${district.districtName}${i + 1}号站`,
      districtId: district.districtId,
      districtName: district.districtName,
      supplyTemp: +(65 + Math.random() * 10).toFixed(1),
      returnTemp: +(40 + Math.random() * 12).toFixed(1),
      pressure: +(0.45 + Math.random() * 0.25).toFixed(2),
      complianceRate: +(82 + Math.random() * 17).toFixed(1),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }
  })
}

function genTempHistory(baseSupply: number, baseReturn: number): TempHistoryPoint[] {
  const points: TempHistoryPoint[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    points.push({
      time: `${date.getMonth() + 1}/${date.getDate()}`,
      supplyTemp: +(baseSupply + (Math.random() - 0.5) * 4).toFixed(1),
      returnTemp: +(baseReturn + (Math.random() - 0.5) * 3).toFixed(1),
    })
  }
  return points
}

function genBoxPlot(districtNames: string[]): RoomTempBoxPlotData[] {
  return districtNames.map((name) => ({
    districtName: name,
    min: +(17 + Math.random() * 2).toFixed(1),
    q1: +(19.5 + Math.random() * 2).toFixed(1),
    median: +(21 + Math.random() * 2).toFixed(1),
    q3: +(23 + Math.random() * 2).toFixed(1),
    max: +(24.5 + Math.random() * 2).toFixed(1),
    outliers: Math.random() > 0.6 ? [+(15 + Math.random() * 3).toFixed(1)] : [],
  }))
}

const CITY_DISTRICT_NAMES: Record<string, string[]> = {
  beijing: ['海淀区', '朝阳区', '西城区', '东城区', '丰台区'],
  harbin: ['道里区', '道外区', '南岗区', '平房区'],
  changchun: ['南关区', '宽城区', '朝阳区', '二道区'],
  shenyang: ['和平区', '沈河区', '皇姑区', '铁西区'],
  tianjin: ['和平区', '河东区', '河西区', '南开区'],
  shijiazhuang: ['长安区', '桥西区', '新华区', '裕华区'],
  taiyuan: ['小店区', '迎泽区', '杏花岭区', '尖草坪区'],
  jinan: ['历下区', '市中区', '槐荫区', '天桥区'],
  zhengzhou: ['中原区', '二七区', '管城区', '金水区'],
  xian: ['新城区', '碑林区', '莲湖区', '雁塔区'],
  lanzhou: ['城关区', '七里河区', '西固区', '安宁区'],
  xining: ['城东区', '城中区', '城西区', '城北区'],
  yinchuan: ['兴庆区', '西夏区', '金凤区'],
  huhehaote: ['新城区', '回民区', '玉泉区', '赛罕区'],
  urumqi: ['天山区', '沙依巴克区', '新市区', '水磨沟区'],
  dalian: ['中山区', '西岗区', '沙河口区', '甘井子区'],
  qiqihaer: ['龙沙区', '建华区', '铁锋区'],
  jilin: ['昌邑区', '龙潭区', '船营区'],
  tangshan: ['路南区', '路北区', '古冶区', '开平区'],
  baotou: ['东河区', '昆都仑区', '青山区', '九原区'],
}

const _districtsCache: Record<string, DistrictData[]> = {}
export function getDistrictsForCity(cityId: string): DistrictData[] {
  if (_districtsCache[cityId]) return _districtsCache[cityId]
  if (districtsData[cityId]) {
    _districtsCache[cityId] = districtsData[cityId]
    return districtsData[cityId]
  }
  const names = CITY_DISTRICT_NAMES[cityId]
  if (!names) return []
  const city = cityHeatData.find((c) => c.cityId === cityId)
  const districts = genDistricts(cityId, city?.cityName || cityId, names)
  _districtsCache[cityId] = districts
  return districts
}

const _stationsCache: Record<string, HeatStation[]> = {}
export function getStationsForDistrict(districtId: string, district: DistrictData): HeatStation[] {
  if (_stationsCache[districtId]) return _stationsCache[districtId]
  if (heatStationsData[districtId]) {
    _stationsCache[districtId] = heatStationsData[districtId]
    return heatStationsData[districtId]
  }
  const count = 3 + Math.floor(Math.random() * 4)
  const stations = genStations(district, count)
  _stationsCache[districtId] = stations
  return stations
}

export function getStationsForCity(cityId: string): HeatStation[] {
  const districts = getDistrictsForCity(cityId)
  return districts.flatMap((d) => getStationsForDistrict(d.districtId, d))
}

export function getTempHistoryForStation(station: HeatStation): TempHistoryPoint[] {
  return genTempHistory(station.supplyTemp, station.returnTemp)
}

export function getBoxPlotForCity(cityId: string): RoomTempBoxPlotData[] {
  const names = CITY_DISTRICT_NAMES[cityId] || []
  return genBoxPlot(names)
}

export function cityHasDetail(cityId: string): boolean {
  return !!CITY_DISTRICT_NAMES[cityId]
}

export const districtsData: Record<string, DistrictData[]> = {
  beijing: [
    { districtId: 'hd', cityId: 'beijing', districtName: '海淀区', complianceRate: 98.2, heatingEfficiency: 89.5, heatLossRate: 6.8 },
    { districtId: 'cy', cityId: 'beijing', districtName: '朝阳区', complianceRate: 97.5, heatingEfficiency: 88.2, heatLossRate: 7.1 },
    { districtId: 'xc', cityId: 'beijing', districtName: '西城区', complianceRate: 96.8, heatingEfficiency: 87.9, heatLossRate: 7.5 },
    { districtId: 'dc', cityId: 'beijing', districtName: '东城区', complianceRate: 97.1, heatingEfficiency: 88.6, heatLossRate: 7.0 },
    { districtId: 'ft', cityId: 'beijing', districtName: '丰台区', complianceRate: 95.3, heatingEfficiency: 86.1, heatLossRate: 8.2 },
  ],
  harbin: [
    { districtId: 'dl', cityId: 'harbin', districtName: '道里区', complianceRate: 97.5, heatingEfficiency: 90.1, heatLossRate: 5.9 },
    { districtId: 'dn', cityId: 'harbin', districtName: '道外区', complianceRate: 96.2, heatingEfficiency: 89.3, heatLossRate: 6.3 },
    { districtId: 'nh', cityId: 'harbin', districtName: '南岗区', complianceRate: 97.0, heatingEfficiency: 89.8, heatLossRate: 6.1 },
    { districtId: 'px', cityId: 'harbin', districtName: '平房区', complianceRate: 95.8, heatingEfficiency: 88.5, heatLossRate: 6.8 },
  ],
}

export const heatStationsData: Record<string, HeatStation[]> = {
  hd: [
    { stationId: 's001', stationName: '中关村换热站', districtId: 'hd', districtName: '海淀区', supplyTemp: 72.5, returnTemp: 48.3, pressure: 0.65, complianceRate: 98.5, status: 'normal' },
    { stationId: 's002', stationName: '上地换热站', districtId: 'hd', districtName: '海淀区', supplyTemp: 70.2, returnTemp: 46.8, pressure: 0.62, complianceRate: 97.8, status: 'normal' },
    { stationId: 's003', stationName: '五道口换热站', districtId: 'hd', districtName: '海淀区', supplyTemp: 68.5, returnTemp: 45.1, pressure: 0.58, complianceRate: 96.2, status: 'warning' },
    { stationId: 's004', stationName: '西二旗换热站', districtId: 'hd', districtName: '海淀区', supplyTemp: 65.1, returnTemp: 42.3, pressure: 0.52, complianceRate: 92.1, status: 'warning' },
    { stationId: 's005', stationName: '清河换热站', districtId: 'hd', districtName: '海淀区', supplyTemp: 60.2, returnTemp: 38.5, pressure: 0.45, complianceRate: 85.3, status: 'error' },
    { stationId: 's006', stationName: '北太平庄换热站', districtId: 'hd', districtName: '海淀区', supplyTemp: 71.8, returnTemp: 47.5, pressure: 0.64, complianceRate: 97.5, status: 'normal' },
  ],
  cy: [
    { stationId: 's007', stationName: '国贸换热站', districtId: 'cy', districtName: '朝阳区', supplyTemp: 73.1, returnTemp: 49.2, pressure: 0.66, complianceRate: 98.1, status: 'normal' },
    { stationId: 's008', stationName: '望京换热站', districtId: 'cy', districtName: '朝阳区', supplyTemp: 71.5, returnTemp: 47.8, pressure: 0.63, complianceRate: 97.2, status: 'normal' },
    { stationId: 's009', stationName: '三里屯换热站', districtId: 'cy', districtName: '朝阳区', supplyTemp: 69.8, returnTemp: 46.1, pressure: 0.60, complianceRate: 95.8, status: 'normal' },
    { stationId: 's010', stationName: 'CBD换热站', districtId: 'cy', districtName: '朝阳区', supplyTemp: 74.2, returnTemp: 50.1, pressure: 0.68, complianceRate: 98.8, status: 'normal' },
  ],
}

export const stationTempHistory: Record<string, TempHistoryPoint[]> = {
  s001: genTempHistory(72.5, 48.3),
  s002: genTempHistory(70.2, 46.8),
  s003: genTempHistory(68.5, 45.1),
  s004: genTempHistory(65.1, 42.3),
  s005: genTempHistory(60.2, 38.5),
  s006: genTempHistory(71.8, 47.5),
  s007: genTempHistory(73.1, 49.2),
  s008: genTempHistory(71.5, 47.8),
  s009: genTempHistory(69.8, 46.1),
  s010: genTempHistory(74.2, 50.1),
}

export const roomTempBoxPlot: RoomTempBoxPlotData[] = [
  { districtName: '海淀区', min: 18.2, q1: 20.5, median: 22.1, q3: 23.8, max: 25.5, outliers: [16.5, 27.2] },
  { districtName: '朝阳区', min: 18.8, q1: 21.0, median: 22.5, q3: 24.0, max: 26.0, outliers: [17.2] },
  { districtName: '西城区', min: 19.0, q1: 21.2, median: 22.8, q3: 24.2, max: 25.8, outliers: [] },
  { districtName: '东城区', min: 18.5, q1: 20.8, median: 22.3, q3: 23.9, max: 25.6, outliers: [16.8] },
  { districtName: '丰台区', min: 17.5, q1: 19.8, median: 21.5, q3: 23.2, max: 24.8, outliers: [15.2, 26.5] },
]

export const alertsData: Alert[] = [
  {
    alertId: 'a001', level: 3, type: 'temperature', region: '西宁', cityId: 'xining',
    stationName: '城北区1号站', description: '连续3天室温达标率82.5%，低于90%阈值，2天内未修复，已升级三级预警',
    status: 'approved', createdAt: '2026-06-05 08:30:00', updatedAt: '2026-06-06 14:20:00', assignedTo: '李明',
    approvalChain: [
      { step: 1, role: '运维员', assignee: '李明', status: 'approved', comment: '已确认温度异常，疑似管道堵塞', timestamp: '2026-06-05 09:15:00' },
      { step: 2, role: '区域经理', assignee: '王强', status: 'approved', comment: '同意启动应急抢修', timestamp: '2026-06-05 11:30:00' },
      { step: 3, role: '总部调度', assignee: '张建国', status: 'approved', comment: '批准调峰方案，增加热源出力15%', timestamp: '2026-06-05 14:20:00' },
    ],
  },
  {
    alertId: 'a002', level: 2, type: 'pressure', region: '兰州', cityId: 'lanzhou',
    stationName: '城关区3号站', description: '管网压力连续下降0.12MPa，超过0.1MPa阈值，已升级二级预警',
    status: 'reviewed', createdAt: '2026-06-06 10:00:00', updatedAt: '2026-06-07 09:45:00', assignedTo: '赵亮',
    approvalChain: [
      { step: 1, role: '运维员', assignee: '赵亮', status: 'approved', comment: '发现主管道接口处渗漏', timestamp: '2026-06-06 11:20:00' },
      { step: 2, role: '区域经理', assignee: '陈军', status: 'approved', comment: '复核确认，建议启动应急抢修', timestamp: '2026-06-07 09:45:00' },
      { step: 3, role: '总部调度', assignee: '张建国', status: 'pending', comment: '', timestamp: '' },
    ],
  },
  {
    alertId: 'a003', level: 1, type: 'temperature', region: '包头', cityId: 'baotou',
    stationName: '昆都仑区5号站', description: '连续3天室温达标率87.3%，低于90%阈值',
    status: 'pending', createdAt: '2026-06-07 16:00:00', updatedAt: '2026-06-07 16:00:00', assignedTo: '刘伟',
    approvalChain: [],
  },
  {
    alertId: 'a004', level: 1, type: 'pressure', region: '太原', cityId: 'taiyuan',
    stationName: '小店区2号站', description: '管网压力下降0.08MPa，接近0.1MPa阈值',
    status: 'pending', createdAt: '2026-06-07 14:30:00', updatedAt: '2026-06-07 14:30:00', assignedTo: '孙涛',
    approvalChain: [],
  },
  {
    alertId: 'a005', level: 2, type: 'temperature', region: '齐齐哈尔', cityId: 'qiqihaer',
    stationName: '龙沙区1号站', description: '室温达标率持续偏低85.2%，一级预警2天未修复',
    status: 'confirmed', createdAt: '2026-06-05 06:00:00', updatedAt: '2026-06-07 10:30:00', assignedTo: '马超',
    approvalChain: [
      { step: 1, role: '运维员', assignee: '马超', status: 'approved', comment: '锅炉出力不足，需增加运行台数', timestamp: '2026-06-07 10:30:00' },
      { step: 2, role: '区域经理', assignee: '周磊', status: 'pending', comment: '', timestamp: '' },
      { step: 3, role: '总部调度', assignee: '', status: 'pending', comment: '', timestamp: '' },
    ],
  },
  {
    alertId: 'a006', level: 1, type: 'temperature', region: '银川', cityId: 'yinchuan',
    stationName: '兴庆区4号站', description: '室温达标率88.9%，低于90%阈值',
    status: 'pending', createdAt: '2026-06-07 11:00:00', updatedAt: '2026-06-07 11:00:00', assignedTo: '黄磊',
    approvalChain: [],
  },
]

function generateForecastData(baseTemp?: number, coldSnapHours?: number[], holidayBoost?: number): ForecastDataPoint[] {
  const data: ForecastDataPoint[] = []
  const now = new Date()
  let temp = baseTemp ?? -5
  for (let i = 0; i < 48; i++) {
    const date = new Date(now)
    date.setHours(date.getHours() + i)
    const hourStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`
    temp = temp + (Math.random() - 0.5) * 3
    let load = 14500 + Math.sin(i / 6) * 3000 + Math.random() * 500
    if (coldSnapHours?.includes(i)) {
      load += 2500
      temp -= 5
    }
    if (holidayBoost && (i >= 16 && i <= 24 || i >= 36 && i <= 44)) {
      load += holidayBoost
    }
    data.push({
      timestamp: hourStr,
      predictedLoad: Math.round(load),
      capacity: 16000,
      temperature: +temp.toFixed(1),
    })
  }
  return data
}

export const forecastData = generateForecastData()

export function generateDynamicForecast(weatherTemps?: number[], hasColdSnap?: boolean, holidayBoost?: number): ForecastDataPoint[] {
  const baseTemp = weatherTemps && weatherTemps.length > 0 ? weatherTemps.reduce((a, b) => a + b, 0) / weatherTemps.length : undefined
  const coldSnapHours = hasColdSnap ? [8, 9, 10, 11, 12, 20, 21, 22, 23, 24, 32, 33, 34, 35] : undefined
  return generateForecastData(baseTemp, coldSnapHours, holidayBoost)
}

export function computePeakShavingPlans(maxGap: number): PeakShavingPlan[] {
  const plans: PeakShavingPlan[] = [
    {
      planId: 'ps001', name: '压减公建负荷', priority: 1,
      description: '在预测负荷峰值时段，对政府办公楼、商场等公共建筑实施分时段压减供热量，保障居民供暖优先',
      expectedEffect: `可降低峰值负荷约${Math.min(Math.round(maxGap * 0.7), 1800)}MW`,
      affectedScope: '全国21个城市，约3200座公建用户',
    },
    {
      planId: 'ps002', name: '调整锅炉运行台数', priority: 2,
      description: '在低谷时段增加1台备用锅炉预热，高峰时段投入运行，提升热源总出力',
      expectedEffect: `可增加热源出力约${Math.min(Math.round(maxGap * 0.45), 1200)}MW`,
      affectedScope: '8个热源厂，涉及12台备用锅炉',
    },
    {
      planId: 'ps003', name: '启动应急调峰热源', priority: 3,
      description: '启动分布式调峰锅炉和蓄热罐，在极端低温时段释放蓄热',
      expectedEffect: `可提供额外${Math.min(Math.round(maxGap * 0.3), 800)}MW调峰能力`,
      affectedScope: '5个城市的15个调峰站点',
    },
  ]
  if (maxGap < 800) plans.reverse()
  return plans
}

function parseWeekDates(week: string): { start: string; end: string; num: number } {
  const numMatch = week.match(/第(\d+)周/)
  const num = numMatch ? parseInt(numMatch[1]) : 23
  const dateMatch = week.match(/\((\d+)\.(\d+)-(\d+)\.(\d+)\)/)
  if (dateMatch) {
    const [, sm, sd, em, ed] = dateMatch
    return {
      start: `2026-${sm.padStart(2, '0')}-${sd.padStart(2, '0')}`,
      end: `2026-${em.padStart(2, '0')}-${ed.padStart(2, '0')}`,
      num,
    }
  }
  return { start: '2026-06-01', end: '2026-06-07', num }
}

export function generateReportForRegion(region: string, week?: string): { report: WeeklyReport; heatLoss: HeatLossReason[]; energyCost: EnergyCostItem[]; complianceTrend: ComplianceTrend[] } {
  const { start: weekStart, end: weekEnd, num: weekNum } = parseWeekDates(week || '')
  const regionFactor = region === '全国' ? 1 : 0.3 + Math.random() * 0.5
  const seasonFactor = 1 + (23 - weekNum) * 0.06
  const report: WeeklyReport = {
    reportId: `r_${region}_w${weekNum}`,
    weekStart,
    weekEnd,
    region,
    complianceRate: +Math.max(80, 88 + Math.random() * 10 - (seasonFactor - 1) * 20).toFixed(1),
    complianceYoY: +(Math.random() * 4).toFixed(1),
    complianceMoM: +(-2 + Math.random() * 3).toFixed(1),
    heatLossRate: +Math.min(15, 5 + Math.random() * 5 * seasonFactor).toFixed(1),
    energyCost: Math.round((2000 * regionFactor + Math.random() * 1000) * seasonFactor),
    energyCostYoY: +(-5 + Math.random() * 4).toFixed(1),
    totalComplaints: Math.round((800 * regionFactor + Math.random() * 500) * seasonFactor),
    resolvedComplaints: Math.round((700 * regionFactor + Math.random() * 400) * seasonFactor),
  }
  report.resolvedComplaints = Math.min(report.resolvedComplaints, report.totalComplaints)

  const heatLoss: HeatLossReason[] = [
    { reason: '管网老化失修', percentage: +(28 + Math.random() * 8).toFixed(0) },
    { reason: '管道保温层破损', percentage: +(20 + Math.random() * 10).toFixed(0) },
    { reason: '水力失调', percentage: +(14 + Math.random() * 8).toFixed(0) },
    { reason: '入户装置故障', percentage: +(8 + Math.random() * 8).toFixed(0) },
    { reason: '阀门泄漏', percentage: +(5 + Math.random() * 5).toFixed(0) },
    { reason: '其他原因', percentage: 5 },
  ]

  const base = 2500 * regionFactor * seasonFactor
  const energyCost: EnergyCostItem[] = [
    { month: '1月', cost: Math.round(base * 1.3), unitAreaCost: +(base * 1.3 / 110).toFixed(1) },
    { month: '2月', cost: Math.round(base * 1.2), unitAreaCost: +(base * 1.2 / 110).toFixed(1) },
    { month: '3月', cost: Math.round(base * 1.05), unitAreaCost: +(base * 1.05 / 110).toFixed(1) },
    { month: '4月', cost: Math.round(base * 0.72), unitAreaCost: +(base * 0.72 / 110).toFixed(1) },
    { month: '10月', cost: Math.round(base * 0.75), unitAreaCost: +(base * 0.75 / 110).toFixed(1) },
    { month: '11月', cost: Math.round(base * 1.15), unitAreaCost: +(base * 1.15 / 110).toFixed(1) },
    { month: '12月', cost: Math.round(base * 1.25), unitAreaCost: +(base * 1.25 / 110).toFixed(1) },
  ]

  const sf = seasonFactor
  const complianceTrend: ComplianceTrend[] = [
    { month: '1月', currentYear: +(90 + Math.random() * 5 - (sf - 1) * 10).toFixed(1), lastYear: +(88 + Math.random() * 4).toFixed(1) },
    { month: '2月', currentYear: +(91 + Math.random() * 5 - (sf - 1) * 8).toFixed(1), lastYear: +(89 + Math.random() * 4).toFixed(1) },
    { month: '3月', currentYear: +(92 + Math.random() * 5 - (sf - 1) * 6).toFixed(1), lastYear: +(90 + Math.random() * 4).toFixed(1) },
    { month: '4月', currentYear: +(93 + Math.random() * 4 - (sf - 1) * 4).toFixed(1), lastYear: +(91 + Math.random() * 4).toFixed(1) },
    { month: '10月', currentYear: +(89 + Math.random() * 5 - (sf - 1) * 8).toFixed(1), lastYear: +(87 + Math.random() * 4).toFixed(1) },
    { month: '11月', currentYear: +(90 + Math.random() * 5 - (sf - 1) * 6).toFixed(1), lastYear: +(88 + Math.random() * 4).toFixed(1) },
    { month: '12月', currentYear: +(90 + Math.random() * 5 - (sf - 1) * 10).toFixed(1), lastYear: +(88 + Math.random() * 4).toFixed(1) },
  ]

  return { report, heatLoss, energyCost, complianceTrend }
}

export interface AnomalyStation {
  stationId: string
  stationName: string
  districtName: string
  complianceRate: number
  heatLossRate: number
  status: 'normal' | 'warning' | 'error'
}

export function getAnomalyStationsForRegion(region: string, metric: 'compliance' | 'heatLoss'): AnomalyStation[] {
  const cityId = allRegionsCityMap[region]
  if (!cityId) return []
  const stations = getStationsForCity(cityId)
  if (metric === 'compliance') {
    return stations
      .filter((s) => s.complianceRate < 93)
      .sort((a, b) => a.complianceRate - b.complianceRate)
      .slice(0, 10)
      .map((s) => ({
        stationId: s.stationId,
        stationName: s.stationName,
        districtName: s.districtName,
        complianceRate: s.complianceRate,
        heatLossRate: +(5 + Math.random() * 8).toFixed(1),
        status: s.status,
      }))
  }
  return stations
    .map((s) => ({
      stationId: s.stationId,
      stationName: s.stationName,
      districtName: s.districtName,
      complianceRate: s.complianceRate,
      heatLossRate: +(5 + Math.random() * 10).toFixed(1),
      status: s.status,
    }))
    .sort((a, b) => b.heatLossRate - a.heatLossRate)
    .slice(0, 10)
}

const allRegionsCityMap: Record<string, string> = {
  '全国': 'beijing',
  '北京': 'beijing',
  '天津': 'tianjin',
  '唐山': 'tangshan',
  '石家庄': 'shijiazhuang',
  '太原': 'taiyuan',
  '哈尔滨': 'harbin',
  '长春': 'changchun',
  '沈阳': 'shenyang',
  '呼和浩特': 'huhehaote',
  '乌鲁木齐': 'urumqi',
  '济南': 'jinan',
  '郑州': 'zhengzhou',
  '西安': 'xian',
  '兰州': 'lanzhou',
  '西宁': 'xining',
  '银川': 'yinchuan',
  '大连': 'dalian',
  '齐齐哈尔': 'qiqihaer',
  '吉林': 'jilin',
  '包头': 'baotou',
}

export const weeklyReportData: WeeklyReport = {
  reportId: 'r2026w23',
  weekStart: '2026-06-01',
  weekEnd: '2026-06-07',
  region: '全国',
  complianceRate: 92.3,
  complianceYoY: 2.1,
  complianceMoM: -0.8,
  heatLossRate: 7.5,
  energyCost: 2850,
  energyCostYoY: -3.2,
  totalComplaints: 1247,
  resolvedComplaints: 1103,
}

export const heatLossReasons: HeatLossReason[] = [
  { reason: '管网老化失修', percentage: 32 },
  { reason: '管道保温层破损', percentage: 25 },
  { reason: '水力失调', percentage: 18 },
  { reason: '入户装置故障', percentage: 12 },
  { reason: '阀门泄漏', percentage: 8 },
  { reason: '其他原因', percentage: 5 },
]

export const energyCostData: EnergyCostItem[] = [
  { month: '1月', cost: 3200, unitAreaCost: 28.5 },
  { month: '2月', cost: 3050, unitAreaCost: 27.2 },
  { month: '3月', cost: 2680, unitAreaCost: 23.8 },
  { month: '4月', cost: 1850, unitAreaCost: 16.5 },
  { month: '10月', cost: 1920, unitAreaCost: 17.1 },
  { month: '11月', cost: 2980, unitAreaCost: 26.5 },
  { month: '12月', cost: 3150, unitAreaCost: 28.0 },
]

export const complianceTrendData: ComplianceTrend[] = [
  { month: '1月', currentYear: 93.5, lastYear: 91.2 },
  { month: '2月', currentYear: 94.2, lastYear: 91.8 },
  { month: '3月', currentYear: 95.1, lastYear: 92.5 },
  { month: '4月', currentYear: 96.3, lastYear: 93.8 },
  { month: '10月', currentYear: 91.8, lastYear: 89.5 },
  { month: '11月', currentYear: 92.5, lastYear: 90.1 },
  { month: '12月', currentYear: 92.3, lastYear: 90.3 },
]

export const complaintRanking = cityHeatData
  .map((c) => ({ cityName: c.cityName, complaintRate: c.complaintRate, complaints: Math.round(c.heatLoad * c.complaintRate / 100) }))
  .sort((a, b) => b.complaintRate - a.complaintRate)
  .slice(0, 10)
