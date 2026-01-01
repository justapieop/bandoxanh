'use client';

import { create } from 'zustand';
import { Station, RecyclingEvent, BikeRental, VegetarianRestaurant, DonationPoint } from "@/types";

interface MapState {
  // Data
  // Data
  stations: Station[];
  events: RecyclingEvent[];
  bikes: BikeRental[];
  restaurants: VegetarianRestaurant[];
  donationPoints: DonationPoint[];

  // UI State
  loading: boolean;
  selectedStation: Station | null;
  selectedEvent: RecyclingEvent | null;

  // Cache State
  stationsLastFetched: number | null;
  eventsLastFetched: number | null;
  // Others reuse validity strategy for now, or add specific ones if needed.
  // For simplicity, we'll fetch them on demand or with simple validity check.

  cacheValidDuration: number; // 5 minutes in milliseconds

  // Actions
  setStations: (stations: Station[]) => void;
  setEvents: (events: RecyclingEvent[]) => void;
  setBikes: (bikes: BikeRental[]) => void;
  setRestaurants: (restaurants: VegetarianRestaurant[]) => void;
  setDonationPoints: (points: DonationPoint[]) => void;

  setLoading: (loading: boolean) => void;
  setSelectedStation: (station: Station | null) => void;
  setSelectedEvent: (event: RecyclingEvent | null) => void;

  fetchStations: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchBikes: () => Promise<void>;
  fetchRestaurants: () => Promise<void>;
  fetchDonationPoints: () => Promise<void>;

  invalidateCache: () => void;

  // Cache helpers
  isStationsCacheValid: () => boolean;
  isEventsCacheValid: () => boolean;
}

export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  stations: [],
  events: [],
  bikes: [],
  restaurants: [],
  donationPoints: [],
  loading: false,
  selectedStation: null,
  selectedEvent: null,
  stationsLastFetched: null,
  eventsLastFetched: null,
  cacheValidDuration: 5 * 60 * 1000,

  // Setters
  setStations: (stations) => set({ stations, stationsLastFetched: Date.now() }),
  setEvents: (events) => set({ events, eventsLastFetched: Date.now() }),
  setBikes: (bikes) => set({ bikes }),
  setRestaurants: (restaurants) => set({ restaurants }),
  setDonationPoints: (donationPoints) => set({ donationPoints }),

  setLoading: (loading) => set({ loading }),
  setSelectedStation: (station) => set({ selectedStation: station }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),

  // Cache validators
  isStationsCacheValid: () => {
    const { stationsLastFetched, cacheValidDuration } = get();
    if (!stationsLastFetched) return false;
    return Date.now() - stationsLastFetched < cacheValidDuration;
  },

  isEventsCacheValid: () => {
    const { eventsLastFetched, cacheValidDuration } = get();
    if (!eventsLastFetched) return false;
    return Date.now() - eventsLastFetched < cacheValidDuration;
  },

  // Fetch stations with cache
  fetchStations: async () => {
    const { isStationsCacheValid, setStations, setLoading } = get();
    if (isStationsCacheValid()) { return; }

    setLoading(true);
    try {
      const res = await fetch('/api/stations');
      if (res.ok) {
        const data = await res.json();
        const transformedStations = data.map((s: any) => ({
          id: s.id,
          type: 'station' as const,
          name: s.name,
          address: s.address,
          lat: s.latitude,
          lng: s.longitude,
          hours: s.hours,
          wasteTypes: typeof s.wasteTypes === 'string'
            ? s.wasteTypes.split(/,|;|"|\[|\]/).map((t: string) => t.trim().replace(/['"]/g, '')).filter((t: string) => t.length > 0)
            : s.wasteTypes || [],
          image: s.image,
          isSponsored: s.isSponsored,
        }));
        setStations(transformedStations);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  },

  // Fetch events with cache
  fetchEvents: async () => {
    const { isEventsCacheValid, setEvents, setLoading } = get();
    if (isEventsCacheValid()) { return; }

    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        const transformedEvents = data.map((e: any) => ({
          id: e.id,
          type: 'event' as const,
          name: e.name,
          address: e.address,
          lat: e.latitude,
          lng: e.longitude,
          date: e.date,
          time: e.time,
          organizer: e.organizer,
          description: e.description,
          image: e.imageUrl || e.image || '',
          isSponsored: e.isSponsored,
        }));
        setEvents(transformedEvents);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  },

  fetchBikes: async () => {
    const { setBikes } = get();
    try {
      const res = await fetch('/api/bikes');
      if (res.ok) {
        const data = await res.json();
        setBikes(data.map((i: any) => ({
          id: i.id,
          type: 'bike' as const,
          name: i.name,
          address: i.address,
          lat: i.latitude,
          lng: i.longitude,
          hours: i.hours,
          price: i.price,
          available: i.available,
          instructions: i.instructions,
          image: i.image,
        })));
      }
    } catch (e) { console.error(e); }
  },

  fetchRestaurants: async () => {
    const { setRestaurants } = get();
    try {
      const res = await fetch('/api/restaurants');
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data.map((i: any) => ({
          id: i.id,
          type: 'restaurant' as const,
          name: i.name,
          address: i.address,
          lat: i.latitude,
          lng: i.longitude,
          hours: i.hours,
          menu: i.menu,
          priceRange: i.priceRange,
          rating: i.rating,
          image: i.image,
          isSponsored: i.isSponsored,
        })));
      }
    } catch (e) { console.error(e); }
  },

  fetchDonationPoints: async () => {
    const { setDonationPoints } = get();
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        setDonationPoints(data.map((i: any) => ({
          id: i.id,
          type: 'donation' as const,
          name: i.name,
          address: i.address,
          lat: i.latitude,
          lng: i.longitude,
          hours: i.hours,
          acceptedItems: i.acceptedItems,
          beneficiary: i.beneficiary,
          image: i.image,
        })));
      }
    } catch (e) { console.error(e); }
  },

  // Invalidate cache
  invalidateCache: () => {
    set({
      stationsLastFetched: null,
      eventsLastFetched: null,
    });
  },
}));
