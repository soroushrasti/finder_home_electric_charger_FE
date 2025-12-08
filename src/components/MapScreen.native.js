import React, { useEffect, useState, useRef } from 'react';
import showAlert from '../utils/alert';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Switch, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import ChargingLocationMap from './ChargingLocationMap';
import ClusterMarker from './ClusterMarker';
import FarsiText from './FarsiText';
import { useTranslation } from 'react-i18next';
import env from '../config/environment';
import chargingLocationService from '../services/chargingLocationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple geocode using Google if key present; silently fallback
async function geocodeAddress(address) {
  if (!env.googleMapsApiKey) return null;
  try {
    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${env.googleMapsApiKey}`);
    const data = await resp.json();
    if (data.status === 'OK' && data.results[0]) {
      return data.results[0].geometry.location; // { lat, lng }
    }
  } catch (e) {
    console.log('Geocode error', e);
  }
  return null;
}

function fallbackByFormData(formData) {
  const city = formData?.city?.toLowerCase();
  const country = formData?.country?.toLowerCase();
  if (country === 'iran') {
    if (city === 'tehran') return { latitude: 35.6892, longitude: 51.3890 };
    if (city === 'isfahan') return { latitude: 32.6546, longitude: 51.6680 };
    if (city === 'shiraz') return { latitude: 29.5918, longitude: 52.5837 };
    if (city === 'mashhad') return { latitude: 36.2974, longitude: 59.6067 };
    if (city === 'tabriz') return { latitude: 38.0962, longitude: 46.2738 };
    return { latitude: 35.6892, longitude: 51.3890 };
  }
  // Generic defaults
  return { latitude: 52.370216, longitude: 4.895168 }; // Amsterdam
}

function computeDeltas(formData){
  if(!formData) return { latitudeDelta:0.05, longitudeDelta:0.05 };
  const hasStreet = !!formData.street?.trim();
  const hasCity = !!formData.city?.trim();
  if(hasStreet && hasCity) return { latitudeDelta:0.01, longitudeDelta:0.01 };
  if(hasCity) return { latitudeDelta:0.25, longitudeDelta:0.25 };
  // country only (wider but not extreme to reduce flashing)
  return { latitudeDelta:2.5, longitudeDelta:2.5 };
}

// Utility: extract latitude/longitude from location object supporting both flat and coordinate forms
function extractLatLng(loc){
  if(!loc) return { latitude:0, longitude:0 };
  if(loc.coordinate) return { latitude: loc.coordinate.latitude, longitude: loc.coordinate.longitude };
  return { latitude: loc.latitude, longitude: loc.longitude };
}

// Replace original getBoundingRegion with coordinate-aware version
function getBoundingRegionFlexible(locs){
  if(!locs || locs.length===0) return null;
  const first = extractLatLng(locs[0]);
  let minLat = first.latitude, maxLat = first.latitude;
  let minLng = first.longitude, maxLng = first.longitude;
  locs.forEach(l=>{
    const { latitude, longitude } = extractLatLng(l);
    if(latitude < minLat) minLat = latitude;
    if(latitude > maxLat) maxLat = latitude;
    if(longitude < minLng) minLng = longitude;
    if(longitude > maxLng) maxLng = longitude;
  });
  const latitude = (minLat + maxLat)/2;
  const longitude = (minLng + maxLng)/2;
  const latitudeDelta = Math.max(0.01, (maxLat - minLat) * 1.3 || 0.02);
  const longitudeDelta = Math.max(0.01, (maxLng - minLng) * 1.3 || 0.02);
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

export default function MapScreen({
  initialLocation,
  chargingLocations = [],
  onLocationSelect,
  onLocationSelected,
  showLocationSelection = false,
  enableTapToSelect = false,
  formData = null,
  focusArea = null,
  style,
  onMapDataUpdate,
  focusLocation,
  externalSelectedLocationId,   // NEW
  disableAutoFetch = false,      // NEW
  hideTypeToggle = false,         // NEW optional UI flag
  showLegend = false,             // NEW legend overlay
  persistRegionKey                // NEW: string key to persist region
}) {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [region, setRegion] = useState(() => ({
    latitude: initialLocation?.latitude || 52.370216,
    longitude: initialLocation?.longitude || 4.895168,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }));
  const [selectedMarker, setSelectedMarker] = useState(initialLocation || null);
  const [loading, setLoading] = useState(true);
  const [showClustering, setShowClustering] = useState(true);
  const [locations, setLocations] = useState(chargingLocations); // unchanged for now
  const [autoFetched, setAutoFetched] = useState(false);
  const [locationTypeFilter, setLocationTypeFilter] = useState('both'); // 'public', 'user', 'both'
  const [visibleLocations, setVisibleLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  // Sync external selected id
  useEffect(() => {
    if (externalSelectedLocationId && externalSelectedLocationId !== selectedLocationId) {
      setSelectedLocationId(externalSelectedLocationId);
    }
  }, [externalSelectedLocationId]);
  const fetchCenterRef = useRef({ latitude:region.latitude, longitude:region.longitude });
  const regionPersistTimer = useRef(null);

  // Load persisted region if available and no explicit focusArea/initial override
  useEffect(() => {
    if(!persistRegionKey) return;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(`region:${persistRegionKey}`);
        if(saved){
          const r = JSON.parse(saved);
          if(r && r.latitude && r.longitude && mapRef.current){
            setRegion(r);
            mapRef.current.animateToRegion(r, 300);
            setLoading(false);
          }
        }
      } catch(e){ /* ignore */ }
    })();
  }, [persistRegionKey]);

  // Persist region on change (debounced)
  useEffect(() => {
    if(!persistRegionKey) return;
    if(!region || !region.latitude) return;
    if(regionPersistTimer.current) clearTimeout(regionPersistTimer.current);
    regionPersistTimer.current = setTimeout(() => {
      AsyncStorage.setItem(`region:${persistRegionKey}` , JSON.stringify({
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta
      })).catch(()=>{});
    }, 600);
    return () => regionPersistTimer.current && clearTimeout(regionPersistTimer.current);
  }, [region, persistRegionKey]);

  // Derive region from formData (geocode) once on mount / when formData changes substantially
  useEffect(() => {
    let isActive = true;
    async function resolveRegion() {
      // Only set loading on first resolve to avoid flicker
      if(loading === false && !autoFetched) setLoading(true);
      let geo = null;
      if (formData?.street && formData?.city && formData?.country) {
        geo = await geocodeAddress(`${formData.street}, ${formData.city}, ${formData.country}`);
      }
      if (!geo && formData?.city && formData?.country) {
        geo = await geocodeAddress(`${formData.city}, ${formData.country}`);
      }
      if(!geo && formData?.country){
        geo = await geocodeAddress(`${formData.country}`);
      }
      if (!geo && formData) {
        const fb = fallbackByFormData(formData);
        geo = { lat: fb.latitude, lng: fb.longitude };
      }
      if (!geo && initialLocation) {
        geo = { lat: initialLocation.latitude, lng: initialLocation.longitude };
      }
      if (geo && isActive) {
        const base = computeDeltas(formData);
        const nextRegion = {
          latitude: geo.lat !== undefined ? geo.lat : geo.latitude,
          longitude: geo.lng !== undefined ? geo.lng : geo.longitude,
          ...base,
        };
        // Only update / animate if region changed significantly to avoid blinking
        const latDiff = Math.abs(nextRegion.latitude - region.latitude);
        const lngDiff = Math.abs(nextRegion.longitude - region.longitude);
        const deltaChanged = Math.abs(nextRegion.latitudeDelta - region.latitudeDelta) > 0.0001 || Math.abs(nextRegion.longitudeDelta - region.longitudeDelta) > 0.0001;
        if(latDiff > 0.0005 || lngDiff > 0.0005 || deltaChanged){
          setRegion(nextRegion);
          setSelectedMarker({ latitude: nextRegion.latitude, longitude: nextRegion.longitude });
          if (mapRef.current) mapRef.current.animateToRegion(nextRegion, 550);
        }
      }
      if (isActive) setLoading(false);
    }
    resolveRegion();
    return () => { isActive = false; };
  }, [formData?.street, formData?.city, formData?.country]);

  // If focusArea passed (from finder) override region smoothly
  useEffect(() => {
    if (focusArea?.coordinates) {
      const next = {
        latitude: focusArea.coordinates.latitude,
        longitude: focusArea.coordinates.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
      setRegion(next);
      if (mapRef.current) mapRef.current.animateToRegion(next, 800);
      setLoading(false);
    }
  }, [focusArea?.coordinates?.latitude, focusArea?.coordinates?.longitude]);

  const handleTap = (e) => {
    if (!enableTapToSelect) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const next = { latitude, longitude };
    setSelectedMarker(next);
    setRegion(r => ({ ...r, latitude, longitude }));
    if (mapRef.current) {
      mapRef.current.animateToRegion({ ...region, latitude, longitude }, 400);
    }
    if (onLocationSelected) onLocationSelected(next);
  };

  // Automatically fetch combined locations if none supplied
  useEffect(() => {
    let cancelled = false;
    async function fetchIfNeeded(){
      if(disableAutoFetch) return; // NEW guard
      if(enableTapToSelect) return; // skip fetching
      // distance threshold (km) ~ convert deg quick approximation
      const distLat = Math.abs(region.latitude - fetchCenterRef.current.latitude);
      const distLng = Math.abs(region.longitude - fetchCenterRef.current.longitude);
      const movedFar = (distLat + distLng) > 0.2; // ~20km+ depending on latitude
      if((movedFar || !autoFetched) && !cancelled){
        try {
          const res = await chargingLocationService.getCombinedChargingLocations(region.latitude, region.longitude, 10, true, true);
          if(!cancelled){
            setLocations([...res.publicChargers, ...res.userLocations]);
            setAutoFetched(true);
            fetchCenterRef.current = { latitude:region.latitude, longitude:region.longitude };
          }
        } catch(e){
          console.log('Auto fetch chargers failed', e);
        }
      }
    }
    fetchIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region.latitude, region.longitude, disableAutoFetch]);

  // Add effect to fit map to all locations when chargingLocations changes
  useEffect(() => {
    if (chargingLocations && chargingLocations.length > 0) {
      const regionToFit = getBoundingRegionFlexible(chargingLocations);
      if(regionToFit){
        setRegion(regionToFit);
        if (mapRef.current) mapRef.current.animateToRegion(regionToFit, 600);
      }
      setLocations(chargingLocations);
    }
  }, [chargingLocations]);

  // Filter locations by type
  const filteredLocations = locations.filter(loc => {
    if (locationTypeFilter === 'both') return true;
    if (locationTypeFilter === 'public') return loc.is_public || loc.type === 'public';
    if (locationTypeFilter === 'user') return loc.is_user || loc.type === 'user';
    return true;
  });

  // Filter locations by visible region
  const filterByRegion = (region, locs) => {
    if (!region) return locs;
    return locs.filter(loc => {
      const { latitude, longitude } = extractLatLng(loc);
      return (
        latitude >= region.latitude - region.latitudeDelta / 2 &&
        latitude <= region.latitude + region.latitudeDelta / 2 &&
        longitude >= region.longitude - region.longitudeDelta / 2 &&
        longitude <= region.longitude + region.longitudeDelta / 2
      );
    });
  };

  // Update visibleLocations when region or filter changes
  useEffect(() => {
    setVisibleLocations(filterByRegion(region, filteredLocations));
  }, [region, filteredLocations.length, locationTypeFilter]);

  // Focus map when focusLocation prop changes
  useEffect(() => {
    if(focusLocation?.latitude && focusLocation?.longitude && mapRef.current){
      mapRef.current.animateToRegion({
        latitude: focusLocation.latitude,
        longitude: focusLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }, 500);
    }
  }, [focusLocation?.latitude, focusLocation?.longitude]);

  // Update parent via callback whenever visibleLocations or selection changes
  useEffect(() => {
    if(onMapDataUpdate){
      onMapDataUpdate({
        visibleLocations,
        filteredLocations,
        selectedLocationId,
        region
      });
    }
  }, [visibleLocations, filteredLocations.length, selectedLocationId, region?.latitude, region?.longitude, region?.latitudeDelta, region?.longitudeDelta]);

  // If the consumer wants an advanced selection with public/user chargers, delegate to ChargingLocationMap
  if (showLocationSelection && !enableTapToSelect) {
    return (
      <ChargingLocationMap
        style={style}
        initialLocation={region}
        onLocationSelect={onLocationSelect}
        enableLocationSelection={true}
        focusArea={focusArea}
        showPublicChargers={true}
        showUserLocations={true}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4285F4" />
        <FarsiText style={styles.loadingText}>{t('messages.findingLoc')}</FarsiText>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {!hideTypeToggle && (
        <View style={styles.toggleRow}>
          <TouchableOpacity onPress={() => setLocationTypeFilter('both')} style={[styles.toggleBtn, locationTypeFilter==='both' && styles.toggleBtnActive]}><Text style={styles.toggleBtnText}>All</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setLocationTypeFilter('public')} style={[styles.toggleBtn, locationTypeFilter==='public' && styles.toggleBtnActive]}><Text style={styles.toggleBtnText}>Public</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setLocationTypeFilter('user')} style={[styles.toggleBtn, locationTypeFilter==='user' && styles.toggleBtnActive]}><Text style={styles.toggleBtnText}>User</Text></TouchableOpacity>
        </View>
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onPress={handleTap}
        onRegionChangeComplete={(r) => setRegion(r)}
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={baseMapStyle}
      >
        {enableTapToSelect && selectedMarker && (
          <Marker coordinate={selectedMarker}>
            <View style={styles.selectionMarker}>
              <MaterialIcons name="my-location" size={22} color="#fff" />
            </View>
          </Marker>
        )}
        {/* Optional clustering view when not tap-select mode and locations list provided */}
        {!enableTapToSelect && showClustering && locations.length > 0 && (
          <ClusterMarker
            locations={locations}
            onClusterPress={(cluster) => {
              if (cluster.isSingle && onLocationSelect) {
                onLocationSelect(cluster.locations[0]);
              }
            }}
          />
        )}
        {/* Render all filtered locations as markers (if not clustering) */}
        {!enableTapToSelect && !showClustering && filteredLocations.map(loc => {
          const { latitude, longitude } = extractLatLng(loc);
          const key = loc.id || loc.charging_location_id || `${latitude.toFixed(6)}_${longitude.toFixed(6)}`;
          return (
            <Marker
              key={key}
              coordinate={{ latitude, longitude }}
              title={loc.name || loc.title}
              description={loc.address || loc.subtitle}
              onPress={() => {
                const id = loc.id || loc.charging_location_id || key;
                setSelectedLocationId(id);
                if(onLocationSelect) onLocationSelect(loc);
              }}
            >
              <View style={[styles.customMarker, (loc.is_user || loc.type === 'user') ? styles.userMarker : styles.publicMarker, selectedLocationId === (loc.id || loc.charging_location_id) && styles.selectedMarkerBorder]} />
            </Marker>
          );
        })}
      </MapView>
      {!enableTapToSelect && locations.length > 0 && (
        <TouchableOpacity style={styles.clusterToggle} onPress={() => setShowClustering(s => !s)}>
          <MaterialIcons name={showClustering ? 'scatter-plot' : 'place'} size={18} color="\#fff" />
          <FarsiText style={styles.toggleText}>{showClustering ? t('map.showClustered') : t('map.showIndividual')}</FarsiText>
        </TouchableOpacity>
      )}
      {showLegend && (
        <View style={styles.legendContainer} pointerEvents="none">
          <View style={styles.legendRow}>
            <View style={[styles.legendDot,{backgroundColor:'#e53935'}]} />
            <FarsiText style={styles.legendLabel}>{t('map.public')}</FarsiText>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot,{backgroundColor:'#2196f3'}]} />
            <FarsiText style={styles.legendLabel}>{t('map.private')}</FarsiText>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot,{backgroundColor:'#2196f3', borderWidth:2, borderColor:'#FFEB3B'}]} />
            <FarsiText style={styles.legendLabel}>{t('messages.nearby') || 'Nearby'}</FarsiText>
          </View>
        </View>
      )}
      {/* Pass visibleLocations and selectedLocationId to the list below (if present) */}
      {/* Example: <ChargerLocationListScreen visibleLocations={visibleLocations} selectedLocationId={selectedLocationId} ... /> */}
    </View>
  );
}

const baseMapStyle = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  map: { flex: 1 },
  clusterToggle: {
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 20, right: 20,
    backgroundColor: '#667eea', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4
  },
  toggleText: { color: '#fff', fontWeight: '600', marginLeft: 6, fontSize: 12 },
  selectionMarker: {
    backgroundColor: '#4285F4', width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4
  },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 8 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: '#eee', marginHorizontal: 4 },
  toggleBtnActive: { backgroundColor: '#667eea' },
  toggleBtnText: { color: '#333', fontWeight: '600' },
  customMarker: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#fff' },
  publicMarker: { backgroundColor: '#e53935' },
  userMarker: { backgroundColor: '#2196f3' },
  selectedMarkerBorder: { borderColor: '#ffeb3b', borderWidth: 3 },
  legendContainer:{ position:'absolute', bottom:18, left:12, backgroundColor:'rgba(255,255,255,0.92)', padding:10, borderRadius:12, elevation:3, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.2, shadowRadius:2 },
  legendRow:{ flexDirection:'row', alignItems:'center', marginBottom:4 },
  legendDot:{ width:14, height:14, borderRadius:7, marginRight:6 },
  legendLabel:{ fontSize:11, color:'#333' },
  coordOverlay:{ position:'absolute', bottom:90, right:10, backgroundColor:'rgba(0,0,0,0.55)', paddingHorizontal:10, paddingVertical:6, borderRadius:8 },
  coordText:{ color:'#fff', fontSize:12, fontWeight:'600', letterSpacing:0.5 }
});
