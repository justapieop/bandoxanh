'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Station, WasteType, RecyclingEvent, BikeRental, VegetarianRestaurant, DonationPoint } from '@/types';
import { MapPinIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, CalendarIcon, HeartIcon } from '@/components/Icons';
import { useMapStore } from '@/store/mapStore';
import { Clock, Info, Recycle, Bike, Salad, Gift, LayoutGrid } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Type Guards using explicit 'type' field ---
const isStation = (item: any): item is Station => item.type === 'station';
const isEvent = (item: any): item is RecyclingEvent => item.type === 'event';
const isBike = (item: any): item is BikeRental => item.type === 'bike';
const isRestaurant = (item: any): item is VegetarianRestaurant => item.type === 'restaurant';
const isDonation = (item: any): item is DonationPoint => item.type === 'donation';

type AnyLocation = Station | RecyclingEvent | BikeRental | VegetarianRestaurant | DonationPoint;
type ItemWithDistance = AnyLocation & { distance: number | null };

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
};

// --- Icons (matching filter icons) ---
const CrownIcon = `<div class="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm z-50"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-yellow-900"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" /></svg></div>`;

// --- Icons (matching filter icons) ---
const getStationIcon = (station: Station, isHovered: boolean = false) => {
    const recycleSvg = `<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888L16.89 9.5"/><path d="m14.5 9.5 2.5-4.5"/><path d="m7 19 4-7"/><path d="M18.123 9.5H21l-1.939 3.401"/>`;
    const colorClasses = 'text-green-600 bg-green-100';
    const size = isHovered ? 48 : 40;
    const iconSize = isHovered ? 24 : 20;
    const isSponsored = station.isSponsored;
    const html = `<div class="${colorClasses} ${isSponsored ? 'ring-4 ring-yellow-400 ring-offset-2' : ''} rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-200 relative" style="width: ${size}px; height: ${size}px; transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: ${iconSize}px; height: ${iconSize}px;">${recycleSvg}</svg>
        ${isSponsored ? CrownIcon : ''}
    </div>`;
    return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size] });
};

const getEventIcon = (event: RecyclingEvent, isHovered: boolean = false) => {
    const calendarSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />`;
    const colorClasses = 'text-purple-600 bg-purple-100';
    const size = isHovered ? 48 : 40;
    const iconSize = isHovered ? 24 : 20;
    const isSponsored = event.isSponsored;
    const html = `<div class="${colorClasses} ${isSponsored ? 'ring-4 ring-yellow-400 ring-offset-2' : ''} rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-200 relative" style="width: ${size}px; height: ${size}px; transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: ${iconSize}px; height: ${iconSize}px;">${calendarSvg}</svg>
        ${isSponsored ? CrownIcon : ''}
    </div>`;
    return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size] });
};

const getBikeIcon = (bike: BikeRental, isHovered: boolean = false) => {
    const bikeSvg = `<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>`;
    const colorClasses = 'text-cyan-600 bg-cyan-100';
    const size = isHovered ? 48 : 40;
    const iconSize = isHovered ? 24 : 20;
    const isSponsored = bike.isSponsored;
    const html = `<div class="${colorClasses} ${isSponsored ? 'ring-4 ring-yellow-400 ring-offset-2' : ''} rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-200 relative" style="width: ${size}px; height: ${size}px; transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: ${iconSize}px; height: ${iconSize}px;">${bikeSvg}</svg>
        ${isSponsored ? CrownIcon : ''}
    </div>`;
    return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size] });
};

const getRestaurantIcon = (rest: VegetarianRestaurant, isHovered: boolean = false) => {
    const saladSvg = `<path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/>`;
    const colorClasses = 'text-orange-600 bg-orange-100';
    const size = isHovered ? 48 : 40;
    const iconSize = isHovered ? 24 : 20;
    const isSponsored = rest.isSponsored;
    const html = `<div class="${colorClasses} ${isSponsored ? 'ring-4 ring-yellow-400 ring-offset-2' : ''} rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-200 relative" style="width: ${size}px; height: ${size}px; transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: ${iconSize}px; height: ${iconSize}px;">${saladSvg}</svg>
        ${isSponsored ? CrownIcon : ''}
    </div>`;
    return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size] });
};

const getDonationIcon = (point: DonationPoint, isHovered: boolean = false) => {
    const giftSvg = `<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>`;
    const colorClasses = 'text-pink-600 bg-pink-100';
    const size = isHovered ? 48 : 40;
    const iconSize = isHovered ? 24 : 20;
    const isSponsored = point.isSponsored;
    const html = `<div class="${colorClasses} ${isSponsored ? 'ring-4 ring-yellow-400 ring-offset-2' : ''} rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-200 relative" style="width: ${size}px; height: ${size}px; transform: ${isHovered ? 'scale(1.2)' : 'scale(1)'};">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: ${iconSize}px; height: ${iconSize}px;">${giftSvg}</svg>
        ${isSponsored ? CrownIcon : ''}
    </div>`;
    return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size] });
};


// --- Map Component ---
const MapComponent: React.FC<{
    items: ItemWithDistance[];
    hoveredItemId: string | null;
    userLocation: { lat: number; lng: number } | null;
    focusedItem: ItemWithDistance | null;
}> = ({ items, hoveredItemId, userLocation, focusedItem }) => {
    const mapRef = useRef<any>(null);
    const itemMarkersRef = useRef<any>({});
    const userMarkerRef = useRef<any>(null);

    useEffect(() => {
        if (mapRef.current) return;
        const map = L.map('map-container').setView([21.0227, 105.8521], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            className: 'green-map-tiles'
        }).addTo(map);
        mapRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
    }, []);

    useEffect(() => {
        const handleResize = () => mapRef.current?.invalidateSize();
        window.addEventListener('resize', handleResize);
        setTimeout(() => mapRef.current?.invalidateSize(), 250);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const itemIds = items.map(i => `${i.type}-${i.id}`).join(',');

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        Object.values(itemMarkersRef.current).forEach((marker: any) => marker.remove());
        itemMarkersRef.current = {};

        items.forEach(item => {
            let icon;
            let popupContent = '';
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}`;
            const directionsButton = `<div class="mt-3 pt-2 border-t border-gray-200"><a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M21.71 11.29l-9-9a1 1 0 0 0-1.42 0l-9 9a1 1 0 0 0 0 1.42l9 9a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42zM14 14.5V12h-4v3H8v-4c0-.6.4-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/></svg>Chỉ đường</a></div>`;

            if (isStation(item)) {
                icon = getStationIcon(item, false);
                popupContent = `
          <div class="w-64 bg-white rounded-xl shadow-md overflow-hidden font-sans">
             <img src="${item.image || 'https://placehold.co/600x400/22c55e/white?text=Trạm+thu+gom'}" class="w-full h-32 object-cover" />
             <div class="p-3 space-y-2 relative">
               ${(item as any).isSponsored ? '<span class="absolute top-0 right-3 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">Tài trợ</span>' : ''}
              <h3 class="font-bold text-sm text-green-700">${item.name}</h3>
              <p class="text-xs text-gray-600">${item.address}</p>
              <div class="flex flex-wrap gap-1">${item.wasteTypes.map(t => `<span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full">${t}</span>`).join('')}</div>
              ${directionsButton}
            </div>
          </div>`;
            } else if (isEvent(item)) {
                icon = getEventIcon(item, false);
                popupContent = `
          <div class="w-64 bg-white rounded-xl shadow-md overflow-hidden font-sans">
            <img src="${item.image || 'https://placehold.co/600x400/a855f7/white?text=Sự+kiện'}" class="w-full h-32 object-cover" />
            <div class="p-3 space-y-2 relative">
               ${(item as any).isSponsored ? '<span class="absolute top-0 right-3 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">Tài trợ</span>' : ''}
               <h3 class="font-bold text-sm text-purple-700">${item.name}</h3>
              <p class="text-xs text-gray-600">${item.address}</p>
              <div class="text-xs text-gray-500"><p><strong>Thời gian:</strong> ${item.date} - ${item.time}</p></div>
              ${directionsButton}
            </div>
          </div>`;
            } else if (isBike(item)) {
                icon = getBikeIcon(item, false);
                popupContent = `
          <div class="w-64 bg-white rounded-xl shadow-md overflow-hidden font-sans">
             <img src="${item.image}" class="w-full h-32 object-cover" onError="this.src='https://placehold.co/600x400/06b6d4/white?text=Xe+đạp'" />
             <div class="p-3 space-y-2 relative">
               ${(item as any).isSponsored ? '<span class="absolute top-0 right-3 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">Tài trợ</span>' : ''}
               <h3 class="font-bold text-sm text-cyan-700">${item.name}</h3>
              <p class="text-xs text-gray-600">${item.address}</p>
              <p class="text-xs font-bold text-cyan-600">${item.price}</p>
              <p class="text-[10px] text-gray-500 line-clamp-2">${item.instructions}</p>
              ${directionsButton}
            </div>
          </div>`;
            } else if (isRestaurant(item)) {
                icon = getRestaurantIcon(item, false);
                popupContent = `
          <div class="w-64 bg-white rounded-xl shadow-md overflow-hidden font-sans">
            <img src="${item.image}" class="w-full h-32 object-cover" onError="this.src='https://placehold.co/600x400/ea580c/white?text=Nhà+hàng'" />
            <div class="p-3 space-y-2 relative">
               ${(item as any).isSponsored ? '<span class="absolute top-0 right-3 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">Tài trợ</span>' : ''}
              <h3 class="font-bold text-sm text-orange-700">${item.name}</h3>
              <p class="text-xs text-gray-600">${item.address}</p>
              <p class="text-xs font-bold text-orange-600">${item.priceRange}</p>
              <p class="text-[10px] text-gray-500 line-clamp-2">${item.menu}</p>
              ${directionsButton}
            </div>
          </div>`;
            } else if (isDonation(item)) {
                icon = getDonationIcon(item, false);
                popupContent = `
          <div class="w-64 bg-white rounded-xl shadow-md overflow-hidden font-sans">
             <img src="${item.image}" class="w-full h-32 object-cover" onError="this.src='https://placehold.co/600x400/db2777/white?text=Từ+thiện'" />
             <div class="p-3 space-y-2 relative">
               ${(item as any).isSponsored ? '<span class="absolute top-0 right-3 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">Tài trợ</span>' : ''}
               <h3 class="font-bold text-sm text-pink-700">${item.name}</h3>
              <p class="text-xs text-gray-600">${item.address}</p>
              <p class="text-xs text-gray-500"><strong>Nhận:</strong> ${item.acceptedItems}</p>
              <p class="text-xs text-gray-500"><strong>Cho:</strong> ${item.beneficiary}</p>
              ${item.beneficiaryImage ? `<img src="${item.beneficiaryImage}" class="w-8 h-8 rounded-full float-right border border-gray-200" title="Người nhận" />` : ''}
              ${directionsButton}
            </div>
          </div>`;
            }

            const markerKey = `${item.type}-${item.id}`;
            const marker = L.marker([item.lat, item.lng], { icon }).addTo(map);
            marker.bindPopup(popupContent);
            itemMarkersRef.current[markerKey] = marker;
        });
    }, [itemIds]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !userLocation) return;
        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        } else {
            const userIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map).bindPopup('Vị trí của bạn');
            map.panTo([userLocation.lat, userLocation.lng]);
        }
    }, [userLocation]);

    useEffect(() => {
        Object.entries(itemMarkersRef.current).forEach(([markerKey, marker]: [string, any]) => {
            const isHovered = markerKey === hoveredItemId;
            const [type, idStr] = markerKey.split('-');
            const itemId = parseInt(idStr, 10);
            const item = items.find(s => s.id === itemId && s.type === type);
            if (item) {
                if (isStation(item)) marker.setIcon(getStationIcon(item, isHovered));
                else if (isEvent(item)) marker.setIcon(getEventIcon(item, isHovered));
                else if (isBike(item)) marker.setIcon(getBikeIcon(item, isHovered));
                else if (isRestaurant(item)) marker.setIcon(getRestaurantIcon(item, isHovered));
                else if (isDonation(item)) marker.setIcon(getDonationIcon(item, isHovered));

                marker.setZIndexOffset(isHovered ? 1000 : 0);
            }
        });
    }, [hoveredItemId, items]);

    useEffect(() => {
        const markerKey = focusedItem ? `${focusedItem.type}-${focusedItem.id}` : null;
        if (focusedItem && mapRef.current && markerKey && itemMarkersRef.current[markerKey]) {
            const marker = itemMarkersRef.current[markerKey];
            mapRef.current.flyTo([focusedItem.lat, focusedItem.lng], 15, { animate: true, duration: 1 });
            marker.openPopup();
        }
    }, [focusedItem]);

    return <div id="map-container" className="w-full h-full" />;
};

// --- Info Card ---
const InfoCard = ({ item, onClick }: { item: ItemWithDistance, onClick: () => void }) => {
    let colorClass, Icon, details;

    if (isStation(item)) { colorClass = 'text-green-700 bg-green-50 border-green-200'; Icon = Recycle; details = item.wasteTypes.join(', '); }
    else if (isEvent(item)) { colorClass = 'text-purple-700 bg-purple-50 border-purple-200'; Icon = CalendarIcon; details = item.date; }
    else if (isBike(item)) { colorClass = 'text-cyan-700 bg-cyan-50 border-cyan-200'; Icon = Bike; details = item.price; }
    else if (isRestaurant(item)) { colorClass = 'text-orange-700 bg-orange-50 border-orange-200'; Icon = Salad; details = item.priceRange; }
    else if (isDonation(item)) { colorClass = 'text-pink-700 bg-pink-50 border-pink-200'; Icon = Gift; details = 'Từ thiện'; }
    else { colorClass = 'text-gray-700'; Icon = MapPinIcon; details = ''; }

    const isSponsored = (item as any).isSponsored;
    const containerClasses = isSponsored
        ? `group relative p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 border-yellow-400 bg-yellow-50/50 hover:bg-yellow-50 shadow-md hover:shadow-xl cursor-pointer transition-all mb-2 md:mb-4 transform hover:scale-[1.02] ring-1 ring-yellow-200`
        : `group relative p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 ${colorClass} hover:shadow-lg cursor-pointer transition-all bg-white dark:bg-gray-800 dark:border-gray-700 mb-2 md:mb-4 transform hover:scale-[1.02]`;

    return (
        <div onClick={onClick} className={containerClasses}>
            <div className="flex justify-between items-start mb-1 md:mb-2">
                <h4 className="font-extrabold text-base md:text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-brand-green transition-colors flex-1">{item.name}</h4>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {(item as any).isSponsored && (
                        <div className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] md:text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse"></span>
                            Tài trợ
                        </div>
                    )}
                    {item.distance && <span className="text-[10px] md:text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full whitespace-nowrap">{item.distance.toFixed(1)} km</span>}
                </div>
            </div>

            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-3 line-clamp-1 flex items-center gap-1 md:gap-1.5 font-medium">
                <MapPinIcon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" /> {item.address}
            </p>

            {details && (
                <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-white/50 dark:bg-black/20 text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90">
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" /> {details}
                </div>
            )}
        </div>
    )
}

// --- Main Map Content ---
const MapMain = () => {
    const searchParams = useSearchParams();
    const MAX_DISTANCE = 20;
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [focusedItem, setFocusedItem] = useState<ItemWithDistance | null>(null);

    const [viewMode, setViewMode] = useState<'all' | 'stations' | 'events' | 'bikes' | 'food' | 'donation'>('all');
    const [distanceFilter, setDistanceFilter] = useState<number>(MAX_DISTANCE);

    const { stations, events, bikes, restaurants, donationPoints, loading, fetchStations, fetchEvents, fetchBikes, fetchRestaurants, fetchDonationPoints } = useMapStore();

    useEffect(() => {
        fetchStations();
        fetchEvents();
        fetchBikes();
        fetchRestaurants();
        fetchDonationPoints();
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error(err)
        );
    }, []);

    const itemsWithDistance = useMemo(() => {
        let all: AnyLocation[] = [];
        if (viewMode === 'all') all = [...stations, ...events, ...bikes, ...restaurants, ...donationPoints];
        else if (viewMode === 'stations') all = stations;
        else if (viewMode === 'events') all = events;
        else if (viewMode === 'bikes') all = bikes;
        else if (viewMode === 'food') all = restaurants;
        else if (viewMode === 'donation') all = donationPoints;

        return all.map(item => ({
            ...item,
            distance: userLocation ? getDistance(userLocation.lat, userLocation.lng, item.lat, item.lng) : null,
        }));
    }, [viewMode, userLocation, stations, events, bikes, restaurants, donationPoints]);

    const filteredItems = useMemo(() => {
        return itemsWithDistance
            .filter((item) => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.address.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesDistance = item.distance === null || item.distance <= distanceFilter;
                return matchesSearch && matchesDistance;
            })
            .sort((a, b) => {
                // Priority to sponsored items
                if ((a as any).isSponsored && !(b as any).isSponsored) return -1;
                if (!(a as any).isSponsored && (b as any).isSponsored) return 1;
                // Then by distance
                return (a.distance || 999) - (b.distance || 999);
            });
    }, [itemsWithDistance, searchTerm, distanceFilter]);

    const categories = [
        { id: 'all', label: 'Tất cả', icon: <LayoutGrid className="w-6 h-6" />, activeClass: 'bg-gray-800 text-white', inactiveClass: 'bg-gray-100 text-gray-400' },
        { id: 'stations', label: 'Trạm rác', icon: <Recycle className="w-6 h-6" />, activeClass: 'bg-green-600 text-white', inactiveClass: 'bg-green-50 text-green-600' },
        { id: 'events', label: 'Sự kiện', icon: <CalendarIcon className="w-6 h-6" />, activeClass: 'bg-purple-600 text-white', inactiveClass: 'bg-purple-50 text-purple-600' },
        { id: 'bikes', label: 'Xe đạp', icon: <Bike className="w-6 h-6" />, activeClass: 'bg-cyan-600 text-white', inactiveClass: 'bg-cyan-50 text-cyan-600' },
        { id: 'food', label: 'Ăn chay', icon: <Salad className="w-6 h-6" />, activeClass: 'bg-orange-600 text-white', inactiveClass: 'bg-orange-50 text-orange-600' },
        { id: 'donation', label: 'Từ thiện', icon: <Gift className="w-6 h-6" />, activeClass: 'bg-pink-600 text-white', inactiveClass: 'bg-pink-50 text-pink-600' },
    ] as const;

    return (
        <div className="flex flex-col md:flex-row h-full w-full relative overflow-hidden">
            <div className={`
          absolute inset-x-0 bottom-0 top-auto h-[90vh] md:h-full md:static md:w-[400px] 
          bg-white border-t md:border-t-0 md:border-r border-gray-200 
          z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
          rounded-t-3xl md:rounded-none flex-shrink-0
          ${isPanelOpen ? 'translate-y-0 md:ml-0' : 'translate-y-[calc(100%-200px)] md:-ml-[400px] md:translate-y-0'}
      `}>

                <div
                    className="md:hidden w-full flex justify-center pt-3 pb-1 cursor-pointer"
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                <div className="p-3 md:p-5 border-b border-gray-100 bg-white md:bg-gray-50/50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm địa điểm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl md:rounded-2xl border-none bg-gray-100 focus:bg-white focus:ring-4 focus:ring-brand-green/20 outline-none transition-all shadow-sm text-base md:text-lg font-medium"
                        />
                        <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <MapPinIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                    </div>

                    <div className="grid grid-cols-6 md:grid-cols-3 gap-1.5 md:gap-2 mt-4 md:mt-6">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setViewMode(cat.id as any)}
                                className={`
                    flex flex-col items-center justify-center p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all touch-manipulation
                    ${viewMode === cat.id ? cat.activeClass + ' shadow-lg scale-105' : cat.inactiveClass + ' hover:bg-gray-200'}
                `}
                            >
                                <div className="mb-0 md:mb-0.5 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6">{cat.icon}</div>
                                <span className="text-[8px] md:text-[10px] font-bold hidden md:block">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {userLocation && (
                        <div className="mt-4 md:mt-6">
                            <div className="flex justify-between text-xs md:text-sm font-bold text-gray-500 mb-1.5 md:mb-2">
                                <span>Bán kính</span>
                                <span className="text-brand-green">{distanceFilter} km</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={distanceFilter}
                                onChange={(e) => setDistanceFilter(Number(e.target.value))}
                                className="w-full h-1.5 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50/30">
                    {loading ? (
                        <div className="space-y-2 md:space-y-4">
                            <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 md:mb-4 px-1 md:px-2 flex items-center gap-2">
                                <span className="w-3 h-3 md:w-4 md:h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin"></span>
                                Đang tải...
                            </p>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 border-gray-100 bg-white animate-pulse">
                                    <div className="h-4 md:h-5 bg-gray-200 rounded w-3/4 mb-2 md:mb-3"></div>
                                    <div className="h-3 md:h-4 bg-gray-100 rounded w-full mb-1.5 md:mb-2"></div>
                                    <div className="h-2.5 md:h-3 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 md:mb-4 px-1 md:px-2">
                                {filteredItems.length} địa điểm
                            </p>
                            <div className="space-y-2 md:space-y-4 pb-20 md:pb-0">
                                {filteredItems.map(item => (
                                    <div key={`${item.type}-${item.id}`} onMouseEnter={() => setHoveredItemId(`${item.type}-${item.id}`)} onMouseLeave={() => setHoveredItemId(null)}>
                                        <InfoCard item={item} onClick={() => {
                                            setFocusedItem(item);
                                            if (window.innerWidth < 768) setIsPanelOpen(false);
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-r-2xl shadow-xl border border-gray-100 text-gray-500 hover:text-brand-green hover:pl-4 transition-all duration-300 ease-in-out ${isPanelOpen ? 'left-[400px]' : 'left-0'}`}
            >
                {isPanelOpen ? <ChevronDoubleLeftIcon className="w-6 h-6" /> : <ChevronDoubleRightIcon className="w-6 h-6" />}
            </button>

            <div className="flex-grow h-full relative z-10 w-full transition-all duration-300 ease-in-out">
                <MapComponent
                    items={filteredItems}
                    hoveredItemId={hoveredItemId}
                    userLocation={userLocation}
                    focusedItem={focusedItem}
                />
            </div>
        </div>
    );
};

export default MapMain;
