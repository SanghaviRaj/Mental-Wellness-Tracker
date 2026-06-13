import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { MoodLog } from '../types'
import { format } from 'date-fns'
 
interface MoodChartProps {
  moods: MoodLog[]
}
 
interface ChartPoint {
  date: string
  mood: number
  stress: number
}
 
export default function MoodChart({ moods }: MoodChartProps) {
  // Show empty state if < 2 data points
  if (moods.length < 2) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-[220px] text-center p-4 rounded-2xl"
        style={{ 
          background: 'rgba(99,119,255,0.02)', 
          border: '1px dashed rgba(99,119,255,0.15)' 
        }}
        role="region"
        aria-label="Mood and stress trend chart (Empty state)"
      >
        <span className="text-3xl mb-2 select-none">📊</span>
        <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: 'Outfit,sans-serif' }}>Not enough data yet</h4>
        <p className="text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
          Please log your mood at least twice to visualize your weekly stress and wellbeing trend.
        </p>
      </div>
    )
  }
 
  // 7-day mood + stress dual axis
  const data: ChartPoint[] = moods
    .slice(-7)
    .map(m => ({
      date: format(new Date(m.timestamp), 'MMM d'),
      mood: m.mood,
      stress: m.stressLevel,
    }))
 
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: { color: string; name: string; value: number }[]
    label?: string
  }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="px-3 py-2 rounded-xl text-sm"
        style={{
          background: 'rgba(10,14,26,0.95)',
          border: '1px solid rgba(99,119,255,0.2)',
          backdropFilter: 'blur(10px)',
        }}>
        <p className="font-semibold mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
 
  return (
    <div 
      aria-label="7-day mood and stress level trend chart" 
      style={{ width: '100%', height: 220 }}
      role="region"
    >
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: -5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#8892b0', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(99,119,255,0.1)' }}
            tickLine={false}
          />
          
          {/* Dual Axis: Left Y-Axis for Mood (1-5) */}
          <YAxis 
            yAxisId="left"
            domain={[1, 5]} 
            tickCount={5}
            tick={{ fill: '#6377ff', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(99,119,255,0.15)' }}
            tickLine={false}
          />
 
          {/* Dual Axis: Right Y-Axis for Stress (1-10) */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[1, 10]} 
            tickCount={5}
            tick={{ fill: '#fb7185', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(251,113,133,0.15)' }}
            tickLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
          
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="mood"   
            stroke="#6377ff" 
            strokeWidth={2.5} 
            dot={{ r: 4, stroke: '#6377ff', strokeWidth: 1, fill: '#0a0e1a' }} 
            activeDot={{ r: 6 }}
            name="Mood (1-5)" 
          />
          
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="stress" 
            stroke="#fb7185" 
            strokeWidth={2.5} 
            dot={{ r: 4, stroke: '#fb7185', strokeWidth: 1, fill: '#0a0e1a' }} 
            activeDot={{ r: 6 }}
            name="Stress (1-10)" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
