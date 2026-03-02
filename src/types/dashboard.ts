export interface Dashboard {
  id: number
  name: string
  code: string
  description?: string
  layout: WidgetPosition[]
  widgets: Widget[]
  isDefault: boolean
  createdBy: string
  createdAt: string
  updatedAt?: string
}

export interface WidgetPosition {
  widgetId: number
  x: number
  y: number
  w: number
  h: number
}

export interface Widget {
  id: number
  type: WidgetType
  title: string
  config: WidgetConfig
  dataSource: DataSourceConfig
}

export type WidgetType = 'statistic' | 'line' | 'bar' | 'pie' | 'table' | 'gauge' | 'radar'

export interface WidgetConfig {
  refreshInterval?: number
  colors?: string[]
  showTitle?: boolean
  showLegend?: boolean
  xAxisConfig?: AxisConfig
  yAxisConfig?: AxisConfig
  seriesConfig?: SeriesConfig[]
}

export interface AxisConfig {
  name?: string
  show?: boolean
  type?: 'category' | 'value'
}

export interface SeriesConfig {
  name: string
  type?: 'line' | 'bar'
  field: string
}

export interface DataSourceConfig {
  type: 'api' | 'static' | 'sql'
  apiPath?: string
  staticData?: any
  queryParams?: Record<string, any>
}

export interface DashboardStatistics {
  totalAssets: number
  totalOrders: number
  totalUsers: number
  pendingApprovals: number
  assetTrend: { date: string; count: number }[]
  orderTrend: { date: string; count: number }[]
  assetDistribution: { name: string; value: number }[]
  orderStatusDistribution: { name: string; value: number }[]
}

export const WIDGET_TYPES = [
  { label: '统计卡片', value: 'statistic', icon: 'DataLine' },
  { label: '折线图', value: 'line', icon: 'TrendCharts' },
  { label: '柱状图', value: 'bar', icon: 'Histogram' },
  { label: '饼图', value: 'pie', icon: 'PieChart' },
  { label: '表格', value: 'table', icon: 'Grid' },
  { label: '仪表盘', value: 'gauge', icon: 'Dashboard' },
  { label: '雷达图', value: 'radar', icon: 'DataBoard' }
]

export const CHART_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
]
