'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Station, WasteType, RecyclingEvent, BikeRental, VegetarianRestaurant, DonationPoint } from '@/types';
import { MapPinIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, CalendarIcon, HeartIcon } from '@/components/Icons';
import { useMapStore } from '@/store/mapStore';
import { Clock, Info, Recycle, Bike, Salad, Gift, LayoutGrid, Locate } from 'lucide-react';
import '@vietmap/vietmap-gl-js/dist/vietmap-gl.css';
// @ts-ignore
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';

console.log('MapMain.tsx chunk loaded');

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

// --- Constants ---
const VIETMAP_API_KEY = 'd4f68feb171aa341c2c451b4719c8e0f215c4f0876a5b849';
const CROWN_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-yellow-900"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" /></svg>`;

// --- helper functions moved or removed ---


interface MapComponentProps {
    items: ItemWithDistance[];
    hoveredItemId: string | null;
    userLocation: { lat: number; lng: number } | null;
    focusedItem: ItemWithDistance | null;
}

const MapComponent = React.memo((props: MapComponentProps) => {
    const { items, hoveredItemId, userLocation, focusedItem } = props;
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<{ [key: string]: any }>({});
    const [isStyleReady, setIsStyleReady] = useState(false);
    const sourceId = 'locations';

    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        console.log('Initializing VietMap GL JS...');
        // @ts-ignore
        vietmapgl.accessToken = VIETMAP_API_KEY;

        const map = new vietmapgl.Map({
            container: mapContainerRef.current,
            style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${VIETMAP_API_KEY}`,
            center: [105.8521, 21.0227],
            zoom: 13,
            maxBounds: [[102.14441, 6.5], [118.0, 23.5]],
            minZoom: 5
        });

        map.on('load', () => {
            console.log('VietMap style loaded');

            // Minimalist style: hide POIs, buildings, etc.
            const layers = map.getStyle().layers;
            if (layers) {
                layers.forEach((layer: any) => {
                    const id = layer.id.toLowerCase();
                    const isRoad = id.includes('road') || id.includes('motorway') || id.includes('highway') || id.includes('trunk') || id.includes('primary') || id.includes('secondary') || id.includes('tertiary') || id.includes('bridge') || id.includes('tunnel');
                    const isAdmin = id.includes('boundary') || id.includes('admin') || id.includes('country') || id.includes('province');
                    const isBasemap = id.includes('water') || id.includes('land') || id.includes('background') || id === 'osm-liberty';

                    // Neutralize road colors
                    if (isRoad) {
                        try {
                            if (id.includes('casing')) {
                                map.setPaintProperty(layer.id, 'line-color', '#dddddd');
                            } else {
                                map.setPaintProperty(layer.id, 'line-color', '#ffffff');
                            }
                        } catch (e) { }
                    }

                    if (!isRoad && !isAdmin && !isBasemap) {
                        try {
                            map.setLayoutProperty(layer.id, 'visibility', 'none');
                        } catch (e) { }
                    }
                });
            }

            // Add source for data (clustering disabled)
            map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                },
                cluster: false
            });

            setIsStyleReady(true);
        });

        mapRef.current = map;
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update data when items change OR style becomes ready
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isStyleReady) return;

        console.log(`Updating map with ${items.length} items. Style ready: ${isStyleReady}`);

        const geojson: any = {
            type: 'FeatureCollection',
            features: items.map(item => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [item.lng, item.lat]
                },
                properties: {
                    id: item.id,
                    type: item.type,
                    name: item.name,
                    address: item.address,
                    isSponsored: (item as any).isSponsored
                }
            }))
        };

        const source = map.getSource(sourceId) as any;
        if (source) source.setData(geojson);

        // --- Stable Marker Management ---
        const newItemIds = new Set(items.map(item => `${item.type}-${item.id}`));
        const currentMarkerIds = Object.keys(markersRef.current);

        // 1. Remove markers no longer in list
        currentMarkerIds.forEach(id => {
            if (!newItemIds.has(id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // 2. Add or Update markers
        items.forEach(item => {
            const id = `${item.type}-${item.id}`;
            const isSponsored = (item as any).isSponsored;

            if (!markersRef.current[id]) {
                // Create new marker
                const el = document.createElement('div');
                let colorClasses = 'text-green-600 bg-green-100';
                let svg = `<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888L16.89 9.5"/><path d="m14.5 9.5 2.5-4.5"/><path d="m7 19 4-7"/><path d="M18.123 9.5H21l-1.939 3.401"/>`;

                if (item.type === 'event') {
                    colorClasses = 'text-purple-600 bg-purple-100';
                    svg = `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />`;
                } else if (item.type === 'bike') {
                    colorClasses = 'text-cyan-600 bg-cyan-100';
                    svg = `<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>`;
                } else if (item.type === 'restaurant') {
                    colorClasses = 'text-orange-600 bg-orange-100';
                    svg = `<path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/>`;
                } else if (item.type === 'donation') {
                    colorClasses = 'text-pink-600 bg-pink-100';
                    svg = `<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>`;
                }

                el.className = `marker-item marker-${item.type}-${item.id}`;
                el.innerHTML = `<div class="${colorClasses} ${isSponsored ? 'ring-4 ring-yellow-400 ring-offset-2' : ''} rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-200 relative" style="width: 40px; height: 40px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">${svg}</svg>
                    ${isSponsored ? `<div class="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm z-10">${CROWN_ICON_SVG}</div>` : ''}
                </div>`;

                const popup = new vietmapgl.Popup({ offset: 25, maxWidth: '320px' }).setHTML(`
                    <div class="w-full bg-white rounded-xl overflow-hidden font-sans border-0">
                        <img src="${item.image || 'https://placehold.co/600x400/gray/white?text=' + encodeURIComponent(item.type || 'station')}" class="w-full h-40 object-cover rounded-t-xl" />
                        <div class="p-4 space-y-2">
                            <h3 class="font-bold text-base text-brand-green leading-tight">${item.name}</h3>
                            <p class="text-sm text-gray-600 line-clamp-2">${item.address}</p>
                            <hr class="border-gray-100 my-2" />
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address)}" target="_blank" class="text-sm text-blue-600 font-bold flex items-center gap-1 hover:underline">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                Chỉ đường
                            </a>
                        </div>
                    </div>
                `);

                const marker = new vietmapgl.Marker({ element: el })
                    .setLngLat([item.lng, item.lat])
                    .setPopup(popup)
                    .addTo(map);

                markersRef.current[id] = marker;
            }
        });
    }, [items, isStyleReady]);

    useEffect(() => {
        Object.keys(markersRef.current).forEach(key => {
            const marker = markersRef.current[key];
            const el = marker.getElement();
            const inner = el.firstChild as HTMLElement;

            if (inner) {
                if (key === hoveredItemId) {
                    inner.style.transform = 'scale(1.2) translateY(-10px)';
                    el.style.zIndex = '1000';
                } else {
                    inner.style.transform = '';
                    el.style.zIndex = '';
                }
            }
        });
    }, [hoveredItemId]);

    // Update markers based on hover/focus
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (focusedItem) {
            map.flyTo({
                center: [focusedItem.lng, focusedItem.lat],
                zoom: 16,
                essential: true
            });
            const marker = markersRef.current[`${focusedItem.type}-${focusedItem.id}`];
            if (marker) marker.togglePopup();
        }
    }, [focusedItem]);

    const userMarkerRef = useRef<any>(null);

    useEffect(() => {
        if (userLocation && mapRef.current) {
            if (!userMarkerRef.current) {
                const el = document.createElement('div');
                el.innerHTML = `<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`;
                userMarkerRef.current = new vietmapgl.Marker(el)
                    .setLngLat([userLocation.lng, userLocation.lat])
                    .setPopup(new vietmapgl.Popup().setHTML('Vị trí của bạn'))
                    .addTo(mapRef.current);
            } else {
                userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
            }
            mapRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 });
        }
    }, [userLocation]);

    const handleLocateUser = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 16 });
        } else {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    if (mapRef.current) mapRef.current.flyTo({ center: [longitude, latitude], zoom: 16 });
                },
                (err) => alert('Không thể lấy vị trí của bạn.')
            );
        }
    };

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainerRef} className="w-full h-full" />
            <button
                onClick={handleLocateUser}
                className="absolute bottom-6 right-6 z-20 bg-white p-3 rounded-full shadow-lg border-2 border-gray-100 text-gray-600 hover:text-brand-green transition-all"
                title="Vị trí của tôi"
            >
                <Locate className="w-6 h-6" />
            </button>
        </div>
    );
});

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
                    {item.distance !== null && <span className="text-[10px] md:text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full whitespace-nowrap">{item.distance.toFixed(1)} km</span>}
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

// --- Debounce Hook implementation ---
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// --- Main Map Content ---
const MapMain = () => {
    console.log('MapMain mounting...');
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [focusedItem, setFocusedItem] = useState<ItemWithDistance | null>(null);
    const [viewMode, setViewMode] = useState<'all' | 'stations' | 'events' | 'bikes' | 'food' | 'donation'>('all');

    const { stations, events, bikes, restaurants, donationPoints, loading, fetchStations, fetchEvents, fetchBikes, fetchRestaurants, fetchDonationPoints } = useMapStore();

    useEffect(() => {
        console.log('Fetching map data...');
        fetchStations();
        fetchEvents();
        fetchBikes();
        fetchRestaurants();
        fetchDonationPoints();
    }, []);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error('Geolocation error:', err)
            );
        }
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

    const sidebarItems = useMemo(() => {
        return itemsWithDistance
            .filter((item) => {
                const searchStr = (item.name + ' ' + item.address).toLowerCase();
                return searchStr.includes(debouncedSearchTerm.toLowerCase());
            })
            .sort((a, b) => {
                const as = (a as any).isSponsored ? 1 : 0;
                const bs = (b as any).isSponsored ? 1 : 0;
                if (as !== bs) return bs - as;
                return (a.distance || 999) - (b.distance || 999);
            });
    }, [itemsWithDistance, debouncedSearchTerm]);

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
                <div className="md:hidden w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setIsPanelOpen(!isPanelOpen)}>
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
                                className={`flex flex-col items-center justify-center p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all touch-manipulation ${viewMode === cat.id ? cat.activeClass + ' shadow-lg scale-105' : cat.inactiveClass + ' hover:bg-gray-200'}`}
                            >
                                <div className="mb-0 md:mb-0.5 [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6">{cat.icon}</div>
                                <span className="text-[8px] md:text-[10px] font-bold hidden md:block">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50/30">
                    {loading ? (
                        <div className="space-y-4 p-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 md:mb-4 px-2">
                                {sidebarItems.length} địa điểm
                            </p>
                            <div className="space-y-2 md:space-y-4 pb-20 md:pb-0">
                                {sidebarItems.map(item => (
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
                className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-r-2xl shadow-xl border border-gray-100 text-gray-500 hover:text-brand-green transition-all duration-300 ${isPanelOpen ? 'left-[400px]' : 'left-0'}`}
            >
                {isPanelOpen ? <ChevronDoubleLeftIcon className="w-6 h-6" /> : <ChevronDoubleRightIcon className="w-6 h-6" />}
            </button>

            <div className="flex-grow h-full relative z-10 w-full transition-all duration-300 ease-in-out">
                <MapComponent
                    items={sidebarItems}
                    hoveredItemId={hoveredItemId}
                    userLocation={userLocation}
                    focusedItem={focusedItem}
                />
            </div>
        </div>
    );
};

export default MapMain;
