import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (target == null) return;
    const start = prev.current;
    const end   = Number(target);
    if (start === end) return;
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(start + (end - start) * ease));
      if (t < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

export default function SparkStat({ title, value, data = [], loading }) {
  const chartData = data.length ? data : Array.from({ length: 7 }, () => ({ v: 0 }));
  const animated  = useCountUp(loading ? null : value);

  return (
    <motion.div
      className="panel flex flex-col gap-1 p-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <span className="text-label font-medium uppercase tracking-widest text-text-secondary">
        {title}
      </span>
      <span className="text-display-md font-semibold leading-none text-brand-primary">
        {loading ? '—' : animated}
      </span>
      <div className="mt-2 h-[32px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="v" stroke="#1E3A8A" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
