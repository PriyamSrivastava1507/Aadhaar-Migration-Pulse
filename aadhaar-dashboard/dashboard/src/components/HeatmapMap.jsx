import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Pane } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// fix missing default marker icons in vite builds
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// renders the leaflet heatmap overlay
function HeatmapLayer({ data }) {
    const map = useMap();
    const heatLayerRef = useRef(null);

    useEffect(() => {
        if (!map || !data || data.length === 0) return;

        // remove previous layer before re-adding
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        // keep only points above the visibility threshold
        const filteredData = data.filter(point => point.Intensity >= 0.15);

        // build [lat, lng, weight] array with power curve for emphasis
        const heatData = filteredData.map(point => [
            point.lat,
            point.lng,
            Math.pow(point.Intensity, 1.5)
        ]);

        // heat layer config: blue base with red/orange hotspots
        const heatLayer = L.heatLayer(heatData, {
            radius: 12,
            blur: 10,
            maxZoom: 10,
            max: 0.7,
            minOpacity: 0.275,
            gradient: {
                0.0: 'transparent',
                0.15: '#1976d2',
                0.35: '#42a5f5',
                0.55: '#90caf9',
                0.72: '#ffed49',
                0.80: '#fd7045',
                0.88: '#e62c29',
                0.95: '#971414',
                1.0: '#640909'
            }
        });

        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;

        // cleanup
        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [map, data]);

    return null;
}

// map container with heatmap and label layers
export default function HeatmapMap({ data, isLoading }) {
    // default map center (India)
    const indiaCenter = [22.5, 82.5];
    const defaultZoom = 5;

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-dark-bg">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" style={{ marginBottom: '16px' }}></div>
                    <p className="text-gray-400 text-lg">Initializing Satellite Link...</p>
                    <p className="text-gray-500 text-sm" style={{ marginTop: '8px' }}>Loading migration data</p>
                </div>
            </div>
        );
    }

    return (
        <MapContainer
            center={indiaCenter}
            zoom={defaultZoom}
            className="w-full h-full"
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
        >
            {/* base tile layer (dark, no labels) */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                subdomains="abcd"
                maxZoom={19}
            />

            {/* heatmap overlay */}
            <HeatmapLayer data={data} />

            {/* labels on top of heatmap */}
            <Pane name="labels" style={{ zIndex: 650 }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={19}
                    pane="labels"
                />
            </Pane>
        </MapContainer>
    );
}
