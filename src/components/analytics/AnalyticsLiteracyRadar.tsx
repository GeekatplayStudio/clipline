import React, { useMemo } from 'react';
import { Compass } from 'lucide-react';

export const AnalyticsLiteracyRadar: React.FC = () => {
  // 5. 5-Axis Literacy Radar Coordinates (Acima, Rent-A-Center, Brigit, Corporate, Mexico)
  const radarData = useMemo(() => {
    const lobs = [
      { name: 'Acima', current: 72, target: 80, angle: 0 },
      { name: 'Rent-A-Center', current: 85, target: 80, angle: 72 },
      { name: 'Brigit', current: 65, target: 80, angle: 144 },
      { name: 'Corporate', current: 91, target: 80, angle: 216 },
      { name: 'Mexico', current: 78, target: 80, angle: 288 },
    ];

    const cx = 150;
    const cy = 150;
    const maxRadius = 100;

    // Helper to polar coordinates
    const toCoords = (percent: number, angleDeg: number) => {
      const angleRad = ((angleDeg - 90) * Math.PI) / 180;
      const r = (percent / 100) * maxRadius;
      return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
      };
    };

    const currentPoints = lobs
      .map((l) => {
        const pt = toCoords(l.current, l.angle);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');

    const targetPoints = lobs
      .map((l) => {
        const pt = toCoords(l.target, l.angle);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');

    return { lobs, currentPoints, targetPoints, cx, cy, maxRadius };
  }, []);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>AI Literacy 5-Axis Polar Radar against 80% Benchmark</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Measures current employee workforce training completion rates across all 5 Upbound operating
            divisions against the 80% enterprise standard.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-blue-600">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span> Current Completion
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500"></span> 80% Target Line
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Polar Radar */}
        <div className="md:col-span-6 flex justify-center py-4">
          <svg viewBox="0 0 300 300" className="w-72 h-72">
            {/* Concentric Rings (20%, 40%, 60%, 80%, 100%) */}
            {[20, 40, 60, 80, 100].map((ring) => (
              <circle
                key={ring}
                cx={radarData.cx}
                cy={radarData.cy}
                r={(ring / 100) * radarData.maxRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth={ring === 80 ? '2' : '1'}
                strokeDasharray={ring === 80 ? '4 2' : undefined}
                className={
                  ring === 80 ? 'text-rose-400 dark:text-rose-500' : 'text-slate-200 dark:text-slate-800'
                }
              />
            ))}

            {/* 5 Radial Axes */}
            {radarData.lobs.map((lob, i) => {
              const rad = ((lob.angle - 90) * Math.PI) / 180;
              const ex = radarData.cx + radarData.maxRadius * Math.cos(rad);
              const ey = radarData.cy + radarData.maxRadius * Math.sin(rad);
              return (
                <g key={i}>
                  <line
                    x1={radarData.cx}
                    y1={radarData.cy}
                    x2={ex}
                    y2={ey}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="1"
                  />
                  <text
                    x={radarData.cx + (radarData.maxRadius + 18) * Math.cos(rad)}
                    y={radarData.cy + (radarData.maxRadius + 18) * Math.sin(rad)}
                    fontSize="10"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="fill-slate-700 dark:fill-slate-300 font-bold"
                  >
                    {lob.name}
                  </text>
                </g>
              );
            })}

            {/* Target Polygon (80% Benchmark) */}
            <polygon
              points={radarData.targetPoints}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Current Completion Polygon */}
            <polygon
              points={radarData.currentPoints}
              fill="rgba(59, 130, 246, 0.25)"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />

            {/* Data Points */}
            {radarData.lobs.map((lob, i) => {
              const rad = ((lob.angle - 90) * Math.PI) / 180;
              const r = (lob.current / 100) * radarData.maxRadius;
              const px = radarData.cx + r * Math.cos(rad);
              const py = radarData.cy + r * Math.sin(rad);
              return <circle key={i} cx={px} cy={py} r="4" className="fill-blue-600 stroke-white stroke-2" />;
            })}
          </svg>
        </div>

        {/* Division Comparison Breakdown */}
        <div className="md:col-span-6 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1">
            LOB Training Completion vs. 80% Benchmark
          </span>

          {radarData.lobs.map((l) => {
            const meets = l.current >= l.target;
            return (
              <div key={l.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{l.name}</span>
                  <span className={`font-mono font-bold ${meets ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {l.current}% / {l.target}% target
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <div
                    style={{ width: `${l.current}%` }}
                    className={`h-full rounded-full ${meets ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                  <div
                    style={{ left: '80%' }}
                    className="absolute top-0 bottom-0 w-0.5 border-r border-dashed border-rose-600 z-10"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
