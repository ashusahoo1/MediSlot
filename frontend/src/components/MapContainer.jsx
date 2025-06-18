import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import MarkerIcon from './MarkerIcon';
//markerindex->focused marker index
function MapContainer({ markerIndex, locInfo, viewPort, onviewPortChange, focusOnMarker }) {
    const mapStyleUrl = `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`;
    return (
        <Map
            {...viewPort}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyleUrl}
            onMove={(e) => onviewPortChange(e.viewState)}
        >
            {locInfo.length > 0 &&
                locInfo.map((loc, index) => (
                    <Marker
                        key={index}
                        longitude={loc.lon}
                        latitude={loc.lat}
                        onClick={() => focusOnMarker(index)}
                    >
                        <MarkerIcon
                            color={markerIndex === index ? 'yellow' : 'red'}
                            size={markerIndex === index ? '4x' : '2x'}
                            selected={markerIndex === index}
                        />
                    </Marker>
            ))}

            {markerIndex !== -1 && (
                <Popup
                    longitude={locInfo[markerIndex].lon}
                    latitude={locInfo[markerIndex].lat}
                    closeButton={false} 
                    closeOnClick={false}
                    closeOnMove={true}
                    onClose={() => focusOnMarker(-1)}
                    offset={[0, -20]}
                >
                    <div className="bg-white p-4 rounded-xl shadow-lg w-56 border border-gray-300">
                        <h2 className="font-bold text-lg text-gray-900 mb-1">
                            {locInfo[markerIndex].place || "Location"}
                        </h2>
                        <p className="text-gray-700 text-sm">
                            {locInfo[markerIndex].name}
                        </p>
                    </div>
                </Popup>
            )}
        </Map>
    );
}

export default MapContainer;