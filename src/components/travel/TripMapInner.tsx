'use client';

import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTravelStore } from '@/store/travelStore';
import { Trip, PLACE_CATEGORIES } from '@/lib/travel/types';

const DEFAULT_CENTER: [number, number] = [36.25, 127.9];
const DEFAULT_ZOOM = 7;

function createPlaceIcon(emoji: string, active: boolean): L.DivIcon {
  return L.divIcon({
    html: `<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:${active ? '#0284c7' : '#ffffff'};border:2px solid #0284c7;box-shadow:0 1px 4px rgba(0,0,0,.25);font-size:17px;">${emoji}</span>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export function TripMapInner({ trip }: { trip: Trip }) {
  const setPlaceLocation = useTravelStore((s) => s.setPlaceLocation);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');

  const placedMarkers = trip.places.filter((p) => p.lat != null && p.lng != null);
  const unplaced = trip.places.filter((p) => p.lat == null || p.lng == null);

  const center = useMemo<[number, number]>(() => {
    if (placedMarkers.length === 0) return DEFAULT_CENTER;
    const lat = placedMarkers.reduce((sum, p) => sum + (p.lat as number), 0) / placedMarkers.length;
    const lng = placedMarkers.reduce((sum, p) => sum + (p.lng as number), 0) / placedMarkers.length;
    return [lat, lng];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  const handleMapClick = (lat: number, lng: number) => {
    if (!selectedPlaceId) return;
    setPlaceLocation(trip.id, selectedPlaceId, lat, lng);
    setSelectedPlaceId('');
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm">
        {trip.places.length === 0 ? (
          <p className="text-sm text-slate-400">
            일정 탭에서 장소를 먼저 추가하면 지도에 표시할 수 있어요.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-300 shrink-0" htmlFor="place-select">
              위치 지정할 장소:
            </label>
            <select
              id="place-select"
              value={selectedPlaceId}
              onChange={(e) => setSelectedPlaceId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            >
              <option value="">장소를 선택하세요</option>
              {trip.places.map((p) => (
                <option key={p.id} value={p.id}>
                  {PLACE_CATEGORIES[p.category].emoji} {p.name}
                  {p.lat != null ? ' (지정됨)' : ''}
                </option>
              ))}
            </select>
            {selectedPlaceId && (
              <span className="text-xs font-medium text-sky-600 animate-pulse shrink-0">
                👆 지도를 클릭해 위치를 지정하세요
              </span>
            )}
          </div>
        )}
        {unplaced.length > 0 && (
          <p className="mt-2 text-xs text-slate-400">위치 미지정 {unplaced.length}곳</p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <MapContainer
          center={center}
          zoom={placedMarkers.length > 0 ? 11 : DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-[420px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handleMapClick} />
          {placedMarkers.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat as number, place.lng as number]}
              icon={createPlaceIcon(
                PLACE_CATEGORIES[place.category].emoji,
                place.id === selectedPlaceId
              )}
            >
              <Popup>
                <b>{place.name}</b>
                <br />
                {format(parseISO(place.date), 'M월 d일 (EEE)', { locale: ko })} ·{' '}
                {PLACE_CATEGORIES[place.category].label}
                {place.memo ? (
                  <>
                    <br />
                    {place.memo}
                  </>
                ) : null}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
