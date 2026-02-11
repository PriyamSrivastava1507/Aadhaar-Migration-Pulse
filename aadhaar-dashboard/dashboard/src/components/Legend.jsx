import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Legend() {
    return (
        <Card className="fixed bottom-4 left-4 z-[1000] border-white/15 bg-[#171718] backdrop-blur-xl">
            <CardHeader style={{ padding: '16px 20px 8px 20px', marginBottom: '8px' }}>
                <CardTitle className="text-sm font-semibold tracking-wide">
                    Migration Intensity
                </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 16px 20px' }}>
                {/* gradient bar */}
                <div className="h-3 rounded-full overflow-hidden shadow-inner min-w-[250px]"
                    style={{
                        background: 'linear-gradient(to right, #1976d2 12.5%, #42a5f5 25%, #90caf9 37.5%, #ffed49 50%, #fd7045 67.5%, #e62c29 75%, #971414 87.5%, #640909 100%)'
                    }}>
                </div>

                {/* labels */}
                <div className="flex justify-around text-[10px] text-white/60 uppercase tracking-wider" style={{ marginTop: '8px' }}>
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>Critical</span>
                </div>
            </CardContent>
        </Card>
    );
}
