import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const PRIORITY_COLOR = {
  URGENT: '#A3352D',
  HIGH:   '#B8860B',
  MEDIUM: '#1A3A5C',
  LOW:    '#9CA3AF',
};

export default function IssueMap({ issues = [] }) {
  const mapped = issues.filter((i) => i.location?.lat && i.location?.lng);

  if (mapped.length === 0) {
    return (
      <div className="panel p-5 flex items-center justify-center h-48 text-body-sm text-ink-mute">
        No issues with location data to display.
      </div>
    );
  }

  const center = [
    mapped.reduce((s, i) => s + i.location.lat, 0) / mapped.length,
    mapped.reduce((s, i) => s + i.location.lng, 0) / mapped.length,
  ];

  return (
    <div className="panel overflow-hidden" style={{ height: '360px' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapped.map((issue) => (
          <CircleMarker
            key={issue.id}
            center={[issue.location.lat, issue.location.lng]}
            radius={issue.priority === 'URGENT' ? 10 : 7}
            pathOptions={{
              color: PRIORITY_COLOR[issue.priority] ?? '#1A3A5C',
              fillColor: PRIORITY_COLOR[issue.priority] ?? '#1A3A5C',
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: '160px' }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{issue.title}</p>
                <p style={{ fontSize: 12, color: '#4B5563' }}>{issue.category} · {issue.priority}</p>
                <p style={{ fontSize: 12, color: '#4B5563' }}>{issue.location.address}</p>
                <a
                  href={`/issues/${issue.id}`}
                  style={{ fontSize: 12, color: '#1A3A5C', textDecoration: 'underline', display: 'block', marginTop: 6 }}
                >
                  View issue →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
