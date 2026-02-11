import { useState, useEffect, useMemo, useTransition } from 'react';
import HeatmapMap from './components/HeatmapMap';
import Navbar from './components/Navbar';
import Legend from './components/Legend';
import DashboardModal from './components/DashboardModal';
import StatsWidget from './components/StatsWidget';
import dashboardData from './assets/dashboard_data.json';

export default function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // load data on mount
  useEffect(() => {
    // brief delay for loading animation
    const timer = setTimeout(() => {
      setData(dashboardData);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // derived stats from loaded data
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalHotspots: 0, topDistrict: null };
    }

    // hotspots with meaningful intensity
    const hotspots = data.filter(point => point.Intensity >= 0.1);
    const totalHotspots = hotspots.length;

    // highest migration score district
    let topPoint = data[0];
    for (const point of data) {
      if (point.Migration_Score > (topPoint?.Migration_Score || 0)) {
        topPoint = point;
      }
    }
    const topDistrict = topPoint?.district || null;

    // unique states containing at least one hotspot
    const flaggedStates = new Set(hotspots.map(p => p.state));
    const flaggedStatesCount = flaggedStates.size;

    // hotspot ratio
    const anomalyRate = ((hotspots.length / data.length) * 100).toFixed(1);

    return { totalHotspots, topDistrict, flaggedStatesCount, anomalyRate };
  }, [data]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-dark-bg relative">
      {/* navbar */}
      <Navbar
        totalHotspots={stats.totalHotspots}
        topDistrict={stats.topDistrict}
        onOpenModal={() => startTransition(() => setIsModalOpen(true))}
        isPending={isPending}
      />

      {/* full screen map */}
      <div className="absolute inset-0">
        <HeatmapMap data={data} isLoading={isLoading} />
      </div>

      {/* legend */}
      <Legend />

      {/* stats widget */}
      <StatsWidget
        totalHotspots={stats.totalHotspots}
        topDistrict={stats.topDistrict}
        flaggedStatesCount={stats.flaggedStatesCount}
        anomalyRate={stats.anomalyRate}
      />

      {/* analytics modal */}
      <DashboardModal
        isOpen={isModalOpen}
        onClose={() => startTransition(() => setIsModalOpen(false))}
        data={data}
      />
    </div>
  );
}
