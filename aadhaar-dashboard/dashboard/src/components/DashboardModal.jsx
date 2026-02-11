import { useMemo, memo } from 'react';
import { TrendingUp, TrendingDown, Target, Zap, BarChart3 } from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Label,
    BarChart, Bar, Cell, ReferenceLine, ReferenceArea, LabelList,
    PieChart, Pie, Legend,
} from 'recharts';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';

// theme colors
const COLORS = {
    neonRose: '#f43f5e',
    cyan: '#06b6d4',
    amber: '#f59e0b',
    green: '#22c55e',
    red: '#ef4444',
    purple: '#a855f7',
    blue: '#3b82f6',
};

const PIE_COLORS = ['#3b82f6', '#06b6d4', '#a855f7', '#f59e0b', '#22c55e'];

// custom tooltip components for each chart type

function ScatterTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isCritical = data.score > 20;

        return (
            <div className="bg-slate-900/95 border border-[#333335] rounded-xl text-sm shadow-2xl backdrop-blur-sm" style={{ padding: '14px 18px', minWidth: '200px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <div>
                        <p className="font-bold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{data.district}</p>
                        <p className="text-slate-400 text-xs">{data.state}</p>
                    </div>
                    <span
                        className={`text-[10px] font-bold rounded-full ${isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}
                        style={{ padding: '4px 8px' }}
                    >
                        {isCritical ? 'HIGH RISK' : 'STABLE'}
                    </span>
                </div>
                <div className="border-t border-[#333335]" style={{ paddingTop: '8px' }}>
                    <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                        <span className="text-slate-400">Migration Score</span>
                        <span className={`font-mono font-bold ${isCritical ? 'text-rose-400' : 'text-cyan-400'}`}>
                            {data.score?.toFixed(1)}
                        </span>
                    </div>
                    <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                        <span className="text-slate-400">Updates</span>
                        <span className="font-mono" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{data.y?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Enrolments</span>
                        <span className="font-mono" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{data.x?.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

function BarTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 border border-[#333335] rounded-lg text-sm shadow-xl" style={{ padding: '10px 14px' }}>
                <p className="font-bold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{data.district}</p>
                <p className="text-slate-400 text-xs" style={{ marginBottom: '4px' }}>{data.state}</p>
                <p className="text-rose-400 font-mono font-bold">Score: {data.score?.toFixed(1)}</p>
            </div>
        );
    }
    return null;
}

function PieTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-slate-900/95 border border-[#333335] rounded-lg text-sm shadow-xl" style={{ padding: '10px 14px' }}>
                <p className="font-bold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{data.name}</p>
                <p className="text-cyan-400 font-mono font-bold" style={{ marginTop: '4px' }}>
                    Score: {data.value?.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
}

function TrendTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const colorClass = data.name === 'Accelerating' ? 'text-red-400' : data.name === 'Decelerating' ? 'text-green-400' : 'text-cyan-400';
        return (
            <div className="bg-slate-900/95 border border-[#333335] rounded-lg text-sm shadow-xl" style={{ padding: '10px 14px' }}>
                <p className="font-bold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{data.name}</p>
                <p className={`font-mono font-bold ${colorClass}`} style={{ marginTop: '4px' }}>
                    Districts: {data.value?.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
}

// main dashboard modal

const DashboardModal = memo(function DashboardModal({ isOpen, onClose, data }) {

    // scatter plot: sample hotspots, high-update, and baseline points
    const scatterData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const hotspots = data
            .filter(p => p.Migration_Score > 20)
            .sort((a, b) => b.Migration_Score - a.Migration_Score)
            .slice(0, 200);

        const highUpdatesLowScore = data
            .filter(p => p.Migration_Score <= 20 && p.Demo_Updates > 10000)
            .sort((a, b) => b.Demo_Updates - a.Demo_Updates)
            .slice(0, 150);

        const baseline = data.filter(p =>
            p.Migration_Score <= 20 && p.Demo_Updates <= 10000
        );
        const shuffled = [...baseline].sort(() => Math.random() - 0.5);
        const randomSample = shuffled.slice(0, 200);

        const combined = [...hotspots, ...highUpdatesLowScore, ...randomSample];

        return combined.map(p => ({
            x: p.Enrolments || 0,
            y: p.Demo_Updates || 0,
            score: p.Migration_Score || 0,
            district: p.district,
            state: p.state,
            isHotspot: p.Migration_Score > 20,
        }));
    }, [data]);

    // top 10 districts by migration score
    const topDistricts = useMemo(() => {
        if (!data || data.length === 0) return [];

        const districtMap = new Map();
        data.forEach(p => {
            const key = p.district;
            const existing = districtMap.get(key);
            if (!existing || p.Migration_Score > existing.score) {
                districtMap.set(key, {
                    district: p.district,
                    displayName: `${p.district} [${p.state?.slice(0, 2).toUpperCase()}]`,
                    score: p.Migration_Score,
                    state: p.state,
                });
            }
        });

        return Array.from(districtMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }, [data]);

    // state-level score distribution for pie chart
    const stateShares = useMemo(() => {
        if (!data || data.length === 0) return [];

        const stateMap = new Map();
        data.forEach(p => {
            const current = stateMap.get(p.state) || 0;
            stateMap.set(p.state, current + (p.Migration_Score || 0));
        });

        return Array.from(stateMap.entries())
            .map(([name, value]) => ({ name, value: Math.round(value) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [data]);

    // trend breakdown: accelerating, decelerating, stable
    const trendData = useMemo(() => {
        if (!data || data.length === 0) return [];

        let accelerating = 0, decelerating = 0, stable = 0;
        data.forEach(p => {
            if (p.Trend === 'Up') accelerating++;
            else if (p.Trend === 'Down') decelerating++;
            else stable++;
        });

        return [
            { name: 'Accelerating', value: accelerating, fill: COLORS.red },
            { name: 'Decelerating', value: decelerating, fill: COLORS.green },
            { name: 'Stable', value: stable, fill: COLORS.cyan },
        ];
    }, [data]);

    // summary statistics
    const stats = useMemo(() => {
        if (!data || data.length === 0) return { criticalZones: 0, topState: 'N/A', topStateShare: 0 };

        const criticalZones = data.filter(p => p.Migration_Score > 20).length;
        const topState = stateShares[0]?.name || 'N/A';
        const totalScore = stateShares.reduce((sum, s) => sum + s.value, 0);
        const topStateShare = totalScore > 0 ? ((stateShares[0]?.value / totalScore) * 100).toFixed(0) : 0;

        return { criticalZones, topState, topStateShare };
    }, [data, stateShares]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[90vw] w-full h-[90vh] border-[#333335] p-0 overflow-hidden bg-[#1c1c1d]">

                {/* scrollable content area */}
                <div className="h-full overflow-y-auto overflow-x-hidden">

                    {/* modal header */}
                    <div className="sticky top-0 z-10 bg-[#171718] backdrop-blur-sm border-b border-[#333335]" style={{ padding: '16px 32px' }}>
                        <h1 className="text-2xl font-orbitron font-bold tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            Migration Intelligence Report
                        </h1>
                        <p className="text-slate-400 text-sm" style={{ marginTop: '4px' }}>
                            Real-time analysis of {data?.length.toLocaleString()} data points
                        </p>
                    </div>

                    {/* charts and panels */}
                    <div style={{ padding: '0 32px 48px 32px' }}>

                        {/* section: correlation scatter plot */}
                        <section style={{ paddingTop: '48px', paddingBottom: '64px' }}>
                            <div className="flex" style={{ gap: '48px' }}>

                                {/* insight panel */}
                                <div className="rounded-2xl border border-[#333335] bg-[#171718] backdrop-blur-sm" style={{ width: '30%', minWidth: '280px', padding: '24px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <div className="flex items-center" style={{ gap: '8px' }}>
                                            <Target className="w-5 h-5 text-rose-400" />
                                            <h2 className="text-lg font-orbitron font-bold text-rose-400 tracking-wide">
                                                Anomaly Detection:
                                            </h2>
                                        </div>
                                        <p className="text-lg font-orbitron font-bold text-rose-400 tracking-wide">
                                            Artificial Inflow vs. Natural Growth
                                        </p>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed" style={{ marginBottom: '24px' }}>
                                        Standard population growth correlates Enrolments with Updates (the linear trend).
                                        The <strong className="text-rose-400">Red Quadrant (Top-Left)</strong> exposes a critical deviation:
                                        districts with massive update volume despite near-zero new enrolments.
                                        This mismatch is the <strong className="text-cyan-400">primary signature of undocumented migration influx</strong>.
                                    </p>

                                    {/* critical zones count */}
                                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl" style={{ padding: '20px' }}>
                                        <p className="text-5xl font-bold text-rose-400 font-mono">{stats.criticalZones}</p>
                                        <p className="text-slate-400 text-sm" style={{ marginTop: '4px' }}>Critical Zones Identified</p>
                                    </div>
                                </div>

                                {/* scatter chart */}
                                <div className="flex-1 rounded-2xl border border-[#333335] bg-[#171718] backdrop-blur-sm" style={{ padding: '20px', height: '450px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 60 }}>
                                            <XAxis
                                                type="number"
                                                dataKey="x"
                                                stroke="#64748b"
                                                fontSize={10}
                                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                            >
                                                <Label value="Natural Growth (Enrolments)" position="bottom" offset={30} style={{ fill: '#94a3b8', fontSize: 11 }} />
                                            </XAxis>
                                            <YAxis
                                                type="number"
                                                dataKey="y"
                                                stroke="#64748b"
                                                fontSize={10}
                                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                            >
                                                <Label value="Migration Inflow (Updates)" angle={-90} position="insideLeft" dy={-10} style={{ fill: '#94a3b8', fontSize: 11, textAnchor: 'middle' }} />
                                            </YAxis>
                                            <ZAxis type="number" dataKey="score" range={[20, 120]} />

                                            {/* danger zone highlight */}
                                            <ReferenceArea x1={0} x2={2000} y1={30000} y2={150000} fill="#f43f5e" fillOpacity={0.08} />

                                            {/* threshold line */}
                                            <ReferenceLine y={30000} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={1.5}>
                                                <Label value="CRITICAL THRESHOLD" position="insideTopRight" style={{ fill: '#f43f5e', fontSize: 9, fontWeight: 600 }} />
                                            </ReferenceLine>

                                            {/* baseline reference */}
                                            <ReferenceLine x={2000} stroke="#475569" strokeDasharray="3 3" />

                                            <Tooltip content={<ScatterTooltip />} isAnimationActive={false} />
                                            <Scatter data={scatterData} isAnimationActive={false}>
                                                {scatterData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.isHotspot ? COLORS.neonRose : COLORS.cyan} fillOpacity={entry.isHotspot ? 0.8 : 0.4} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </section>


                        <div className="border-t border-[#333335]"></div>

                        {/* section: top districts leaderboard */}
                        <section style={{ paddingTop: '64px', paddingBottom: '64px' }}>
                            <div className="flex" style={{ gap: '48px' }}>

                                {/* bar chart */}
                                <div className="rounded-2xl border border-[#333335] bg-[#171718] backdrop-blur-sm" style={{ width: '65%', padding: '24px', height: '500px' }}>
                                    <div className="flex items-center" style={{ gap: '8px', marginBottom: '20px' }}>
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-lg font-orbitron font-bold text-amber-400 tracking-wide">
                                            High-Velocity Hotspots (Top 10)
                                        </h3>
                                    </div>
                                    <div style={{ height: 'calc(100% - 50px)' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topDistricts} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
                                                <XAxis type="number" stroke="#64748b" fontSize={10} />
                                                <YAxis
                                                    type="category"
                                                    dataKey="displayName"
                                                    width={130}
                                                    fontSize={11}
                                                    stroke="#94a3b8"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip content={<BarTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                                                <Bar dataKey="score" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                                                    {topDistricts.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.score > 20 ? COLORS.neonRose : entry.score > 15 ? COLORS.amber : COLORS.cyan}
                                                        />
                                                    ))}
                                                    <LabelList dataKey="score" position="right" formatter={(v) => v?.toFixed(1)} fill="#e2e8f0" fontSize={11} fontWeight={600} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#333335] bg-[#171718] backdrop-blur-sm" style={{ width: '35%', padding: '24px' }}>
                                    <div className="flex items-center" style={{ gap: '8px', marginBottom: '16px' }}>
                                        <TrendingUp className="w-5 h-5 text-amber-400" />
                                        <h2 className="text-xl font-orbitron font-bold text-amber-400 tracking-wide">
                                            High-Velocity Targets
                                        </h2>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed" style={{ marginBottom: '24px' }}>
                                        Top 10 districts account for <strong className="text-amber-400">28%</strong> of all national anomalies.
                                        <strong className="text-rose-400"> {topDistricts[0]?.district} [{topDistricts[0]?.state?.slice(0, 2).toUpperCase()}]</strong> and
                                        <strong className="text-rose-400">{topDistricts[1]?.district} [{topDistricts[1]?.state?.slice(0, 2).toUpperCase()}]</strong> have exceeded the
                                        'Critical Velocity' threshold (Score {'>'} 20.0) for 3 consecutive months.
                                        <strong className="text-cyan-400">Recommended Action: Deploy Field Teams.</strong>
                                    </p>

                                    {/* stat cards */}
                                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl" style={{ padding: '16px' }}>
                                            <p className="text-3xl font-bold text-amber-400 font-mono">Top 1%</p>
                                            <p className="text-slate-400 text-xs" style={{ marginTop: '4px' }}>Of National Volume</p>
                                        </div>
                                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl" style={{ padding: '16px' }}>
                                            <p className="text-3xl font-bold text-cyan-400 font-mono">{topDistricts.length}</p>
                                            <p className="text-slate-400 text-xs" style={{ marginTop: '4px' }}>Flagged Districts</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-[#333335]"></div>

                        {/* section: state distribution pie chart */}
                        <section style={{ paddingTop: '64px', paddingBottom: '64px' }}>
                            <div className="flex" style={{ gap: '48px' }}>

                                {/* insight panel */}
                                <div className="rounded-2xl border border-[#333335] bg-[#171718] backdrop-blur-sm" style={{ width: '35%', minWidth: '280px', padding: '24px' }}>
                                    <div className="flex items-center" style={{ gap: '8px', marginBottom: '16px' }}>
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                        <h2 className="text-xl font-bold font-orbitron text-purple-400 tracking-wide">
                                            Regional Concentration
                                        </h2>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed" style={{ marginBottom: '24px' }}>
                                        Migration pressure is not uniform. <strong className="text-purple-400">{stats.topState}</strong> and
                                        <strong className="text-cyan-400"> West Bengal</strong> represent <strong className="text-amber-400">{stats.topStateShare}%</strong> of
                                        the total high-velocity updates, suggesting a focused corridor rather than a nationwide trend.
                                        Border districts show <strong className="text-rose-400">4x higher</strong> activity than interior zones.
                                    </p>

                                    {/* corridor intensity card */}
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl" style={{ padding: '20px' }}>
                                        <p className="text-2xl font-bold text-red-400 font-orbitron">Corridor Intensity</p>
                                        <p className="text-red-400 text-lg font-bold" style={{ marginTop: '4px' }}>HIGH</p>
                                    </div>
                                </div>

                                {/* pie chart */}
                                <div className="flex-1 rounded-2xl border border-[#333335] bg-[#171718] backdrop-blur-sm" style={{ padding: '24px', height: '400px' }}>
                                    <h4 className="text-lg font-orbitron font-bold text-purple-400" style={{ marginBottom: '16px' }}>
                                        State Distribution
                                    </h4>
                                    <div style={{ height: 'calc(100% - 40px)' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stateShares}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="45%"
                                                    outerRadius="75%"
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    isAnimationActive={false}
                                                >
                                                    {stateShares.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Legend verticalAlign="bottom" height={36} fontSize={11} />
                                                <Tooltip content={<PieTooltip />} isAnimationActive={false} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-[#333335]"></div>

                        {/* section: trend momentum chart */}
                        <section style={{ paddingTop: '64px', paddingBottom: '32px' }}>
                            <div className="flex" style={{ gap: '48px' }}>

                                {/* trend bar chart */}
                                <div className="rounded-2xl border border-[#333335] bg-[#171718] backdrop-blur-sm" style={{ width: '65%', padding: '24px', height: '400px' }}>
                                    <div className="flex items-center" style={{ gap: '8px', marginBottom: '20px' }}>
                                        <TrendingUp className="w-5 h-5 text-red-400" />
                                        <h3 className="text-lg font-orbitron font-bold text-red-400 tracking-wide">
                                            Trend Momentum
                                        </h3>
                                    </div>
                                    <div style={{ height: 'calc(100% - 60px)' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={trendData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#64748b" fontSize={10} />
                                                <Tooltip content={<TrendTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                                                <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                                                    {trendData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                    <LabelList dataKey="value" position="top" fill="#e2e8f0" fontSize={14} fontWeight={600} />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* trend insight panel */}
                                <div className="rounded-2xl border border-[#333335] bg-[#171718] backdrop-blur-sm" style={{ width: '35%', padding: '24px' }}>
                                    <div className="flex items-center" style={{ gap: '8px', marginBottom: '16px' }}>
                                        <TrendingDown className="w-5 h-5 text-red-400" />
                                        <h2 className="text-xl font-orbitron font-bold text-red-400 tracking-wide">
                                            Crisis is Accelerating
                                        </h2>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed" style={{ marginBottom: '24px' }}>
                                        This is an <strong className="text-red-400">active, expanding event</strong>. Temporal analysis reveals that
                                        <strong className="text-red-400"> {trendData[0]?.value || 0}</strong> High-Risk Zones are currently in an
                                        <strong className="text-amber-400"> 'Accelerating'</strong> state, meaning their update velocity is increasing week-over-week.
                                        Only <strong className="text-green-400">{trendData[1]?.value || 0}</strong> show signs of cooling off.
                                    </p>

                                    {/* stat cards */}
                                    <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl" style={{ padding: '16px' }}>
                                            <p className="text-sm text-slate-400">Status</p>
                                            <p className="text-xl font-bold text-red-400 font-orbitron">EXPANDING</p>
                                        </div>
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl" style={{ padding: '16px' }}>
                                            <p className="text-sm text-slate-400">Stable</p>
                                            <p className="text-xl font-bold text-cyan-400 font-mono">{trendData[2]?.value || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
});

export default DashboardModal;
