import { Activity, TrendingUp, BarChart3, Loader2, Backpack } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar({ totalHotspots, topDistrict, onOpenModal, isPending }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[1000]" style={{ padding: '0px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="glass flex items-center justify-between" style={{ padding: '8px 24px' }}>
                    {/* logo */}
                    <div className="flex items-center" style={{ gap: '12px' }}>
                        <div className="relative">
                            <Activity className="w-8 h-8 text-accent-red" />
                            <div className="absolute inset-0 bg-accent-red/20 blur-lg rounded-full"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight font-orbitron" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                AADHAAR MIGRATION PULSE
                            </h1>
                            <p className="text-xs text-gray-500 opacity-70">
                                Real-time Societal Trend Monitor
                            </p>
                        </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center" style={{ gap: '12px' }}>


                        {/* open dashboard button */}
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onOpenModal}
                            disabled={isPending}
                            style={{ width: '200px', padding: '4px 8px', marginLeft: '16px', backgroundColor: '#171718', color: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <BarChart3 className="w-4 h-4" />
                            )}
                            {isPending ? 'Loading...' : 'Analytics Dashboard'}
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
