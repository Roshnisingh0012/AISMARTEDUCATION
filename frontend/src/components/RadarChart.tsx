import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { DomainRatings } from '@/lib/types';
import { DOMAINS } from '@/lib/domains';

interface Props {
  self: DomainRatings;
  target: DomainRatings;
  height?: number;
}

export default function CompetencyRadar({ self, target, height = 340 }: Props) {
  const data = DOMAINS.map((d) => ({
    domain: d.short,
    Self: self[d.key],
    Target: target[d.key],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReRadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Target"
          dataKey="Target"
          stroke="#4f46e5"
          fill="#4f46e5"
          fillOpacity={0.08}
          strokeDasharray="5 4"
          strokeWidth={2}
        />
        <Radar
          name="Your level"
          dataKey="Self"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="circle"
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 12,
          }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
