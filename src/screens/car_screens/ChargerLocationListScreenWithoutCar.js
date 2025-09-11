import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";
import MapScreen from '../../components/MapScreen';
import env from "../../config/env";
import chargingLocationService from '../../services/chargingLocationService';

export default function ChargerLocationListScreenWithoutCar({ navigation, route }) {
    const { t } = useTranslation();

    const { user, searchResults, searchCriteria } = route.params;
    const [chargingLocations, setChargingLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    // NEW state for primary + dynamic map management
    const [primaryLocations, setPrimaryLocations] = useState([]); // user's own primary location(s)
    const [extraNearby, setExtraNearby] = useState([]);           // fetched after big zoom out (user locations)
    const [publicChargers, setPublicChargers] = useState([]);     // NEW: public chargers fetched by bbox
    const [showingBase, setShowingBase] = useState(true);         // if base chargingLocations list visible in map
    const [mapLocations, setMapLocations] = useState([]);         // what we pass to MapScreen
    const [mapRegion, setMapRegion] = useState(null);             // region emitted from map
    const [hasLoadedPrimary, setHasLoadedPrimary] = useState(false);
    const [hasLoadedExtraNearby, setHasLoadedExtraNearby] = useState(false);
    const [hasLoadedExtendedNearby, setHasLoadedExtendedNearby] = useState(false); // second manual load
    // Debounce timer
    const regionDebounceRef = useRef(null);
    const pendingRegionRef = useRef(null);
    const publicBBoxRef = useRef(null); // {north,south,east,west}
    const lastPublicFetchTimeRef = useRef(0);

    // Compose mapLocations whenever public/user/nearby sets change
    useEffect(() => {
        if(!showingBase && primaryLocations.length){
            setMapLocations(primaryLocations);
            return;
        }
        // Combine public + base + nearby extras
        const combined = [...publicChargers, ...chargingLocations, ...extraNearby];
        const seen = new Set();
        const final = [];
        for(const loc of combined){
            if(!loc) continue;
            const id = loc.id || loc.charging_location_id;
            if(!id) continue;
            if(seen.has(id)) continue;
            seen.add(id);
            final.push(loc);
        }
        setMapLocations(final);
    }, [publicChargers, chargingLocations, extraNearby, primaryLocations, showingBase]);

    // Throttled bbox public refetch
    const maybeRefetchPublic = (r) => {
        const now = Date.now();
        if(now - lastPublicFetchTimeRef.current < 1500) return; // throttle 1.5s
        if(!r || !r.latitudeDelta || !r.longitudeDelta) return;
        const latSpan = r.latitudeDelta;
        const lngSpan = r.longitudeDelta;
        const north = r.latitude + latSpan/2;
        const south = r.latitude - latSpan/2;
        const east = r.longitude + lngSpan/2;
        const west = r.longitude - lngSpan/2;
        const bbox = publicBBoxRef.current;
        // Expand criteria: region outside previous bbox or span grows significantly
        const expanded = !bbox || north > bbox.north || south < bbox.south || east > bbox.east || west < bbox.west || ( (bbox.north - bbox.south) < (latSpan*0.75) );
        if(!expanded) return;
        (async () => {
            try {
                const fetched = await chargingLocationService.findPublicChargersInBounds(north, south, east, west);
                if(fetched && fetched.length){
                    const norm = fetched.map(pc => ({
                        id: pc.id,
                        type: 'public',
                        title: pc.title || pc.name,
                        subtitle: pc.subtitle,
                        address: pc.address,
                        latitude: pc.coordinate?.latitude,
                        longitude: pc.coordinate?.longitude
                    })).filter(l => !isNaN(l.latitude) && !isNaN(l.longitude));
                    setPublicChargers(prev => {
                        const existing = new Set(prev.map(p=>p.id));
                        const merged = [...prev];
                        norm.forEach(n=>{ if(!existing.has(n.id)) merged.push(n); });
                        return merged;
                    });
                    publicBBoxRef.current = { north, south, east, west };
                    lastPublicFetchTimeRef.current = Date.now();
                }
            } catch(e){ console.log('Refetch public bbox failed', e.message); }
        })();
    };

    useEffect(() => {
        if (searchResults) {
            setChargingLocations(searchResults);
            setLoading(false);
        } else {
            // If no search results, fetch all locations
            fetchChargingLocations();
        }
    }, []);

    const fetchChargingLocations = async () => {
        try {
            const response = await fetch('http://192.168.1.100:3000/charging-locations');
            const data = await response.json();
            console.log('Fetched charging locations:', data);
            if (response.ok) {
                setChargingLocations(data);
            } else {
                Alert.alert(t('messages.error'), data.message || t('messages.failFetchCharger'));
            }
        } catch (error) {
            console.error(t('messages.fetchLocError'), error);
            Alert.alert(t('messages.error'), t('messages.tryAgain'));
        } finally {
            setLoading(false);
        }
    };

    // --- Helper: Get fallback region from searchCriteria ---
    const getFallbackRegion = () => {
        const cityCoords = {
            'tehran': { latitude: 35.6892, longitude: 51.3890 },
            'isfahan': { latitude: 32.6546, longitude: 51.6680 },
            'shiraz': { latitude: 29.5918, longitude: 52.5837 },
            'mashhad': { latitude: 36.2974, longitude: 59.6067 },
            'tabriz': { latitude: 38.0962, longitude: 46.2738 }
        };
        const cityKey = searchCriteria?.city?.toLowerCase();
        return cityCoords[cityKey] || { latitude: 35.6892, longitude: 51.3890 };
    };

    // --- Initial Map Setup ---
    useEffect(() => {
        let cancelled = false;
        const initFromResults = async () => {
            if (searchResults && searchResults.length > 0) {
                // Calculate bounding box for all markers
                const lats = searchResults.map(loc => parseFloat(loc.latitude)).filter(v=>!isNaN(v));
                const lngs = searchResults.map(loc => parseFloat(loc.longitude)).filter(v=>!isNaN(v));
                if(lats.length === 0 || lngs.length === 0){
                    return; // nothing valid
                }
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLng = Math.min(...lngs);
                const maxLng = Math.max(...lngs);
                const centerLat = (minLat + maxLat) / 2;
                const centerLng = (minLng + maxLng) / 2;
                const latDelta = Math.max(0.05, (maxLat - minLat) * 1.5);
                const lngDelta = Math.max(0.05, (maxLng - minLng) * 1.5);
                setMapRegion({ latitude: centerLat, longitude: centerLng, latitudeDelta: latDelta, longitudeDelta: lngDelta });
                // Attempt initial public chargers fetch using enlarged bbox
                try {
                    const publicFetched = await chargingLocationService.findPublicChargersInBounds(maxLat, minLat, maxLng, minLng);
                    if(cancelled) return;
                    if(publicFetched && publicFetched.length){
                        const norm = publicFetched.map(pc => ({
                            id: pc.id,
                            type: 'public',
                            title: pc.title || pc.name,
                            subtitle: pc.subtitle,
                            address: pc.address,
                            latitude: pc.coordinate?.latitude,
                            longitude: pc.coordinate?.longitude
                        })).filter(l => !isNaN(l.latitude) && !isNaN(l.longitude));
                        setPublicChargers(norm);
                        publicBBoxRef.current = { north:maxLat, south:minLat, east:maxLng, west:minLng };
                        lastPublicFetchTimeRef.current = Date.now();
                    } else {
                        // fallback to searchResults as pseudo-public entries if empty
                        const pseudo = searchResults.map(loc => ({
                            id: loc.charging_location_id || loc.id,
                            type: 'public',
                            title: loc.name || loc.street_address || `Station ${loc.charging_location_id || loc.id}`,
                            subtitle: `${loc.city || ''}${loc.country ? ', ' + loc.country : ''}`,
                            address: loc.street_address || loc.address,
                            latitude: parseFloat(loc.latitude),
                            longitude: parseFloat(loc.longitude)
                        })).filter(l => !isNaN(l.latitude) && !isNaN(l.longitude));
                        setPublicChargers(pseudo);
                        publicBBoxRef.current = { north:maxLat, south:minLat, east:maxLng, west:minLng };
                        lastPublicFetchTimeRef.current = Date.now();
                    }
                } catch(fetchErr){
                    console.log('Public chargers bbox fetch failed, using searchResults pseudo-public:', fetchErr?.message);
                    const pseudo = searchResults.map(loc => ({
                        id: loc.charging_location_id || loc.id,
                        type: 'public',
                        title: loc.name || loc.street_address || `Station ${loc.charging_location_id || loc.id}`,
                        subtitle: `${loc.city || ''}${loc.country ? ', ' + loc.country : ''}`,
                        address: loc.street_address || loc.address,
                        latitude: parseFloat(loc.latitude),
                        longitude: parseFloat(loc.longitude)
                    })).filter(l => !isNaN(l.latitude) && !isNaN(l.longitude));
                    setPublicChargers(pseudo);
                    publicBBoxRef.current = { north:maxLat, south:minLat, east:maxLng, west:minLng };
                    lastPublicFetchTimeRef.current = Date.now();
                }
            } else {
                const fallback = getFallbackRegion();
                setMapRegion({ latitude: fallback.latitude, longitude: fallback.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
            }
        };
        initFromResults();
        return () => { cancelled = true; };
    }, [searchResults, searchCriteria]);

    // --- Fetch Primary User Location ---
    useEffect(() => {
        let mounted = true;
        (async () => {
            const primary = await chargingLocationService.getUserPrimaryChargingLocation(searchCriteria);
            console.log('Fetched primary user locations:', primary);
            if(!mounted) return;
            if(primary.length > 0){
                // Mark them as user type explicitly
                const norm = primary.map(p=>({
                    id: p.id,
                    type: 'user',
                    title: p.title,
                    subtitle: p.subtitle,
                    address: p.address,
                    latitude: p.coordinate.latitude,
                    longitude: p.coordinate.longitude
                }));
                setPrimaryLocations(norm);
                setMapLocations(norm); // start focused only on primary
                setHasLoadedPrimary(true);
                setShowingBase(false); // base list hidden until zoom out or selection
            } else {
                // No primary; fall back to base list below once loaded
                setHasLoadedPrimary(true);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // --- Update Map Locations when Charging Locations or Primary User Location changes ---
    useEffect(() => {
        if(!hasLoadedPrimary) return; // wait for primary attempt
        if(chargingLocations.length > 0 && (showingBase || mapLocations.length === 0)){
            const base = chargingLocations.map(loc => ({
                id: loc.charging_location_id || loc.id,
                type: loc.type || 'public',
                title: loc.name || loc.street_address || `Station ${loc.charging_location_id || loc.id}`,
                subtitle: `${loc.city || ''}${loc.country ? ', ' + loc.country : ''}`,
                address: loc.street_address || loc.address,
                latitude: parseFloat(loc.latitude),
                longitude: parseFloat(loc.longitude)
            })).filter(l=>!isNaN(l.latitude)&&!isNaN(l.longitude));
            if(primaryLocations.length > 0 && !showingBase){
                // Keep only primary until user action
            } else {
                setMapLocations(base);
                setShowingBase(true);
            }
        }
    }, [chargingLocations, hasLoadedPrimary]);

    // --- Compose Full List when Extra Nearby Locations are Added ---
    useEffect(() => {
        if(!showingBase && primaryLocations.length>0 && extraNearby.length===0) return; // still primary only
        if(showingBase || extraNearby.length>0){
            const base = showingBase ? mapLocations.filter(m=>m.type!=='extra') : primaryLocations;
            const combined = [...base, ...extraNearby];
            // de-dupe by id
            const seen = new Set();
            const final = [];
            combined.forEach(l=>{ if(!seen.has(l.id)){ seen.add(l.id); final.push(l);} });
            setMapLocations(final);
        }
    }, [extraNearby, showingBase]);

    // --- Ensure Base List is Visible ---
    const ensureBaseVisible = () => {
        if(!showingBase){
            setShowingBase(true);
        }
    };

    // --- Handle Map Data Update ---
    const handleMapDataUpdate = ({ region }) => {
        if(!region) return;
        pendingRegionRef.current = region;
        if(regionDebounceRef.current) clearTimeout(regionDebounceRef.current);
        regionDebounceRef.current = setTimeout(() => {
            const r = pendingRegionRef.current;
            if(!r) return;
            setMapRegion(r);
            if(!showingBase && r.latitudeDelta > 0.05){
                ensureBaseVisible();
            }
            if(showingBase){
                maybeRefetchPublic(r);
            }
            if(showingBase && !hasLoadedExtraNearby && r.latitudeDelta > 0.25){
                (async () => {
                    try {
                        const nearby = await chargingLocationService.findNearbyUserLocations(r.latitude, r.longitude, 15);
                        const norm = nearby.map(n => ({
                            id: n.id,
                            type: 'user',
                            title: n.title || n.name,
                            subtitle: n.subtitle,
                            address: n.address,
                            latitude: n.coordinate.latitude,
                            longitude: n.coordinate.longitude,
                            _extra: true
                        }));
                        setExtraNearby(norm);
                        setHasLoadedExtraNearby(true);
                    } catch(e) { /* ignore */ }
                })();
            }
        }, 400);
    };

    // --- Load Extended Nearby Locations Manually ---
    const loadExtendedNearby = async () => {
        if(hasLoadedExtendedNearby || !mapRegion) return;
        try {
            const more = await chargingLocationService.findNearbyUserLocations(mapRegion.latitude, mapRegion.longitude, 30);
            const norm = more.map(n => ({
                id: n.id,
                type: 'user',
                title: n.title || n.name,
                subtitle: n.subtitle,
                address: n.address,
                latitude: n.coordinate.latitude,
                longitude: n.coordinate.longitude,
                _extra: true,
                _extra2: true
            }));
            setExtraNearby(prev => {
                const ids = new Set(prev.map(p=>p.id));
                return [...prev, ...norm.filter(n=>!ids.has(n.id))];
            });
            setHasLoadedExtendedNearby(true);
        } catch(e){ /* ignore */ }
    };

    // --- Render Location Card ---
    const renderLocationCard = (location) => {
        const isSelected = selectedLocationId === location.charging_location_id || selectedLocationId === location.id || location._isSelected;
        const isAvailable = location.is_available !== false; // treat undefined as available
        const type = location.type || 'public';
        const borderLeftColor = type === 'user' ? '#2196f3' : '#e53935';
        return (
            <TouchableOpacity
                key={location.charging_location_id || location.id}
                style={[styles.locationCard, {borderLeftWidth:6, borderLeftColor}, !isAvailable && styles.unavailableCard, isSelected && styles.selectedCard]}
                activeOpacity={0.85}
                onPress={() => {
                    if (isAvailable) {
                        ensureBaseVisible();
                        setSelectedLocationId(location.charging_location_id || location.id);
                        setSelectedLocation({
                            latitude: parseFloat(location.latitude),
                            longitude: parseFloat(location.longitude),
                            title: location.name || location.title,
                            description: `${location.city || ''}${location.street ? ', '+location.street:''}`,
                            id: location.charging_location_id || location.id
                        });
                    }
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle}>{location.name || location.title || `#${location.charging_location_id || location.id}`}</Text>
                        {location.street_address || location.address ? (
                            <Text style={styles.locationAddress}>{location.street_address || location.address}</Text>
                        ) : null}
                        {(location.city || location.country) && (
                            <Text style={styles.locationPostcode}>{location.city}{location.country? ', '+location.country:''}</Text>
                        )}
                        {(location._extra || location._extra2) && (
                          <View style={styles.badgeRow}>
                            <Text style={[styles.nearBadge, location._extra2 && styles.moreBadge]}>{location._extra2 ? (t('messages.more') || 'MORE') : (t('messages.nearby') || 'NEARBY')}</Text>
                          </View>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isAvailable ? '#4CAF50' : '#f44336' }]}>
                        <Text style={styles.statusText}>{isAvailable ? t('messages.avail') : t('messages.occupied')}</Text>
                    </View>
                </View>
                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <MaterialIcons name="electric-bolt" size={18} color="#667eea" />
                        <Text style={styles.detailText}>{(location.power_output||location.powerKw||'N/A') + ' kW'}</Text>
                    </View>
                    {location.description && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionText}>{location.description}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.cardFooter}>
                    <Text style={isAvailable ? styles.selectText : styles.unavailableText}>
                        {isAvailable ? t('messages.selectStation') : t('messages.unavailable')}
                    </Text>
                    <MaterialIcons name="chevron-right" size={20} color="#999" />
                </View>
            </TouchableOpacity>
        );
    };

    // --- Adjust focusLocation with new mapLocations ---
    const focusLocation = useMemo(() => {
        if(!selectedLocationId) return null;
        const found = mapLocations.find(l => l.id === selectedLocationId);
        return found ? { latitude: found.latitude, longitude: found.longitude } : null;
    }, [selectedLocationId, mapLocations]);

    // Reintroduce helper to render search criteria summary
    const renderSearchCriteria = () => {
        if (!searchCriteria) return null;
        return (
            <View style={styles.searchCriteriaContainer}>
                <FarsiText style={styles.searchCriteriaTitle}>{t('messages.searchResult')}</FarsiText>
                <View style={styles.criteriaRow}>
                    {searchCriteria.city && (
                        <Text style={styles.criteriaItem}>📍 {searchCriteria.city}</Text>
                    )}
                    {searchCriteria.street && (
                        <Text style={styles.criteriaItem}>🛣️ {searchCriteria.street}</Text>
                    )}
                    {searchCriteria.fast_charging && (
                        <FarsiText style={styles.criteriaItem}>⚡ {t('messages.fastCharging')}</FarsiText>
                    )}
                </View>
            </View>
        );
    };

    // Provide missing proceed handler
    const handleProceed = () => {
        if (!selectedLocation) return;
        navigation.navigate('CarSelectionScreen', {
            user,
            chargingLocation: {
                id: selectedLocation.id,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                name: selectedLocation.title,
                address: selectedLocation.description
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <FarsiText style={styles.loadingText}>{t('messages.loadingLocation')}</FarsiText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map showing all charging locations */}
            <View style={{ height: 300 }}>
                <MapScreen
                    chargingLocations={mapLocations}
                    externalSelectedLocationId={selectedLocationId}
                    focusLocation={focusLocation}
                    disableAutoFetch={true}
                    hideTypeToggle={true}
                    showLegend={true}
                    persistRegionKey="noCarListMap"
                    onMapDataUpdate={handleMapDataUpdate}
                />
            </View>
            <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <MaterialIcons name="ev-station" size={40} color="#fff" />
                    <FarsiText style={styles.headerTitle}>{t('messages.availableChargingStation')}</FarsiText>
                    {(() => {
                        console.log('primary locations', primaryLocations);
                        console.log('charging locations', chargingLocations);
                        console.log('public chargers', publicChargers);
                        console.log('showingBase', showingBase);
                        const displayListCount = primaryLocations.length+ publicChargers.length + extraNearby.length;
                        return (
                      <FarsiText style={styles.headerSubtitle}>
                        {displayListCount} {t('messages.loc')}{displayListCount !== 1 ? t('messages.s') : ''} {t('messages.found')}
                      </FarsiText>); })()}
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderSearchCriteria()}

                <View style={styles.locationsContainer}>
                    {(() => {
                        const displayList = [...primaryLocations , ...publicChargers, ...chargingLocations] ;
                        if (displayList.length === 0) {
                            return (
                                <View style={styles.noResultsContainer}>
                                    <MaterialIcons name="search-off" size={80} color="#ccc" />
                                    <FarsiText style={styles.noResultsText}>{t('messages.noChargingLoc')}</FarsiText>
                                    <FarsiText style={styles.noResultsSubtext}>
                                        {t('messages.tryAdjust')}
                                    </FarsiText>
                                    <TouchableOpacity
                                        style={styles.searchAgainButton}
                                        onPress={() => navigation.goBack()}
                                    >
                                        <FarsiText style={styles.searchAgainButtonText}>{t('messages.searchAgain')}</FarsiText>
                                    </TouchableOpacity>
                                </View>
                            );
                        }
                        return displayList.map(loc => {
                            const locId = loc.charging_location_id || loc.id;
                            const isSelected = selectedLocationId === locId;
                            return renderLocationCard({ ...loc, id: locId, _isSelected: isSelected });
                        });
                    })()}
                </View>

                {/* Proceed Button & Manual Nearby Button */}
                {hasLoadedExtraNearby && !hasLoadedExtendedNearby && (
                  <TouchableOpacity style={styles.loadMoreBtn} onPress={loadExtendedNearby}>
                    <Text style={styles.loadMoreText}>{t('messages.loadMore') || 'Load more nearby'}</Text>
                  </TouchableOpacity>
                )}
                {selectedLocation && (
                    <TouchableOpacity style={{margin: 16, padding: 16, backgroundColor: '#4CAF50', borderRadius: 8}} onPress={handleProceed}>
                        <FarsiText style={{color: '#fff', fontWeight: 'bold', textAlign: 'center'}}>{t('messages.proceedWithSelectedLocation')}</FarsiText>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1,
        padding: 8,
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    searchCriteriaContainer: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchCriteriaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    criteriaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    criteriaItem: {
        fontSize: 14,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    locationsContainer: {
        padding: 16,
        paddingTop: 0,
    },
    locationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unavailableCard: {
        backgroundColor: '#f8f8f8',
        opacity: 0.7,
    },
    selectedCard: {
        borderColor: '#4CAF50',
        borderWidth: 2,
        backgroundColor: '#e8f5e9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    locationInfo: {
        flex: 1,
        marginRight: 12,
    },
    locationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    locationAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    locationPostcode: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    descriptionContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    selectText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
    },
    unavailableText: {
        fontSize: 14,
        color: '#f44336',
        fontWeight: '600',
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noResultsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    noResultsSubtext: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    searchAgainButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    searchAgainButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadMoreBtn:{ marginHorizontal:16, marginTop:12, backgroundColor:'#667eea', paddingVertical:12, borderRadius:8, alignItems:'center' },
    loadMoreText:{ color:'#fff', fontWeight:'600' },
    badgeRow:{ marginTop:6, flexDirection:'row', flexWrap:'wrap' },
    nearBadge:{ backgroundColor:'#2196f3', color:'#fff', fontSize:10, paddingHorizontal:6, paddingVertical:2, borderRadius:10, overflow:'hidden', marginRight:6 },
    moreBadge:{ backgroundColor:'#ff9800' },
});
