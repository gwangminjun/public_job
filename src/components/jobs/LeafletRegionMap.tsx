'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import type { RegionBucket } from './JobMapView';

interface LeafletRegionMapProps {
  regionBuckets: RegionBucket[];
  activeRegion: string;
  onSelectRegion: (region: string) => void;
}

type MapContainerProps = {
  center: [number, number];
  zoom: number;
  scrollWheelZoom: boolean;
  className?: string;
  children?: ReactNode;
};

type TileLayerProps = {
  attribution: string;
  url: string;
};

type CircleMarkerProps = {
  center: [number, number];
  radius: number;
  pathOptions: {
    color: string;
    fillColor: string;
    fillOpacity: number;
    weight: number;
  };
  eventHandlers?: {
    click?: () => void;
  };
  children?: ReactNode;
};

type PopupProps = {
  children?: ReactNode;
};

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer as ComponentType<MapContainerProps>),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer as ComponentType<TileLayerProps>),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker as ComponentType<CircleMarkerProps>),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup as ComponentType<PopupProps>),
  { ssr: false }
);

const DEFAULT_CENTER: [number, number] = [36.25, 127.9];
const DEFAULT_ZOOM = 7;

export function LeafletRegionMap({ regionBuckets, activeRegion, onSelectRegion }: LeafletRegionMapProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {regionBuckets.map((bucket) => {
        const isActive = bucket.region === activeRegion;
        const radius = Math.min(26, 10 + bucket.count * 1.5);

        return (
          <CircleMarker
            key={bucket.region}
            center={[bucket.point.lat, bucket.point.lng]}
            radius={radius}
            pathOptions={{
              color: isActive ? '#1d4ed8' : '#3b82f6',
              fillColor: isActive ? '#2563eb' : '#60a5fa',
              fillOpacity: 0.75,
              weight: 2,
            }}
            eventHandlers={{ click: () => onSelectRegion(bucket.region) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{bucket.region}</p>
                <p>{bucket.count}건</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
