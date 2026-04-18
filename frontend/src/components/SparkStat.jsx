import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function SparkStat({ title, value, data = [], loading }) {
  const chartData = data.length ? data : Array.from({ length: 7 }, () => ({ v: 0 }));

  return (
    <div className="panel p-4 flex flex-col gap-1">
      <span className="text-label uppercase tracking-widest font-medium text-ink-mute">
        {title}
      </span>
      <span className="font-semibold text-ink text-display-md leading-none">
        {loading ? '—' : value ?? '—'}
      </span>
      <div className="mt-2 h-[32px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#1A3A5C"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
