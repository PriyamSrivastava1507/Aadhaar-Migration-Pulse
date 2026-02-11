import { TrendingUp, AlertTriangle, Map } from 'lucide-react';

export default function StatsWidget({ totalHotspots, topDistrict, flaggedStatesCount, anomalyRate }) {
    return (
        <div className="fixed bottom-4 right-4 z-[1000] flex flex-col bg-[#171718] rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl" style={{ width: '280px', padding: '20px 24px', gap: '20px' }}>

            {/* hotspots and anomaly rate */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Active Hotspots</p>
                    <p className="text-3xl font-bold tabular-nums font-orbitron" style={{ color: 'rgba(255, 255, 255, 0.95)', marginTop: '4px' }}>
                        {totalHotspots?.toLocaleString() || '—'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Anomaly Rate</p>
                    <p className="text-lg font-bold text-accent-red font-mono" style={{ marginTop: '2px' }}>
                        {anomalyRate}%
                    </p>
                </div>
            </div>

            {/* divider */}
            <div className="w-full h-px bg-white/10"></div>

            {/* velocity and flagged states */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Highest Velocity</p>
                        <p className="text-lg font-bold truncate max-w-[180px] font-orbitron" style={{ color: 'rgba(255, 255, 255, 0.95)', marginTop: '4px' }}>
                            {topDistrict || '—'}
                        </p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                        <Map className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-400 font-medium">Flagged States</span>
                    </div>
                    <span className="text-lg font-bold text-white/90 font-mono">{flaggedStatesCount}</span>
                </div>
            </div>

        </div>
    );
}
