'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface Props {
  chapterPerformance: { chapter: number; correct: number; total: number; percentage: number }[];
  mockScores: { date: string; score: number; total: number; percentage: number }[];
  chapterNames?: Record<number, string>;
}

export default function ProgressCharts({ chapterPerformance, mockScores, chapterNames }: Props) {
  const names = chapterNames ?? {};
  const chartData = (chapterPerformance ?? []).map(cp => ({
    name: `Ch ${cp?.chapter ?? 0}`,
    fullName: names[cp?.chapter ?? 0] ?? `Chapter ${cp?.chapter ?? 0}`,
    percentage: cp?.percentage ?? 0,
    total: cp?.total ?? 0,
  }));

  const hasData = chartData.some(d => (d?.total ?? 0) > 0);

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        Complete some quizzes to see your chapter performance chart
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tickLine={false}
            tick={{ fontSize: 10 }}
            domain={[0, 100]}
            label={{ value: 'Score %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
          />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(value: number) => [`${value}%`, 'Score']}
          />
          <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '65% Pass', position: 'right', fill: '#ef4444', fontSize: 10 }} />
          <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
