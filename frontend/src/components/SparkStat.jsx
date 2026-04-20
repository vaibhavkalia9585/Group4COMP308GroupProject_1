import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function SparkStat({ title, value, data = [], loading }) {
  const chartData = data.length ? data : Array.from({ length: 7 }, () => ({ v: 0 }));

  return (
    <div className="panel flex flex-col gap-1 p-4">
      <span className="text-label font-medium uppercase tracking-widest text-text-secondary">
        {title}
      </span>
      <span className="text-display-md font-semibold leading-none text-brand-primary">
        {loading ? '—' : value ?? '—'}
      </span>
      <div className="mt-2 h-[32px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#1E3A8A"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
