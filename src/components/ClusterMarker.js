import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const MapCluster = ({ coordinate, pointCount, onPress, clusterId }) => {
    const getClusterSize = () => {
        if (pointCount < 10) return 40;
        if (pointCount < 50) return 50;
        if (pointCount < 100) return 60;
        return 70;
    };

    const getClusterColor = () => {
        if (pointCount < 10) return '#4ECDC4';
        if (pointCount < 50) return '#FFD93D';
        if (pointCount < 100) return '#FF6B6B';
        return '#8E44AD';
    };

    const size = getClusterSize();
    const color = getClusterColor();

    return (
        <Marker
            coordinate={coordinate}
            onPress={onPress}
            tracksViewChanges={false}
        >
            <View style={[
                styles.clusterContainer,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                }
            ]}>
                <View style={[styles.clusterInner, { backgroundColor: color }]}>
                    <Text style={styles.clusterText}>{pointCount}</Text>
                </View>
                <View style={[styles.clusterPulse, {
                    width: size * 1.5,
                    height: size * 1.5,
                    borderRadius: (size * 1.5) / 2,
                    backgroundColor: color,
                }]} />
            </View>
        </Marker>
    );
};

const ClusterMarker = ({
    locations,
    coordinate,
    onClusterPress,
    clusterId,
    zoom = 10
}) => {
    if(!Array.isArray(locations) || locations.length===0) return null;

    // Normalize locations so each has a coordinate object and internal id
    const normalized = locations
        .map((l, idx) => {
            if(!l) return null;
            let lat = l.latitude; let lng = l.longitude;
            if(l.coordinate){
              if(typeof l.coordinate.latitude === 'number') lat = l.coordinate.latitude;
              if(typeof l.coordinate.longitude === 'number') lng = l.coordinate.longitude;
            }
            if(typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return null;
            const coordinateObj = { latitude: lat, longitude: lng };
            const id = l.id || l.charging_location_id || `${lat.toFixed(6)}_${lng.toFixed(6)}`;
            return { ...l, id, coordinate: coordinateObj, _internalIdx: idx };
        })
        .filter(Boolean);
    if(normalized.length===0) return null;

    // Simple clustering algorithm based on proximity
    const clusterLocations = (locs, zoomLevel) => {
        const clusters = [];
        const processed = new Set();
        const clusterRadius = getClusterRadius(zoomLevel);

        locs.forEach((location, index) => {
            if (!location || !location.coordinate) return;
            if (processed.has(index)) return;

            const cluster = {
                id: `cluster_${clusters.length}`,
                coordinate: location.coordinate,
                locations: [location],
                bounds: {
                    minLat: location.coordinate.latitude,
                    maxLat: location.coordinate.latitude,
                    minLng: location.coordinate.longitude,
                    maxLng: location.coordinate.longitude,
                }
            };

            processed.add(index);

            // Find nearby locations to cluster
            locs.forEach((otherLocation, otherIndex) => {
                if (!otherLocation || !otherLocation.coordinate) return;
                if (processed.has(otherIndex) || index === otherIndex) return;

                const distance = calculateDistance(
                    location.coordinate.latitude,
                    location.coordinate.longitude,
                    otherLocation.coordinate.latitude,
                    otherLocation.coordinate.longitude
                );

                if (distance <= clusterRadius) {
                    cluster.locations.push(otherLocation);
                    processed.add(otherIndex);

                    // Update cluster bounds
                    cluster.bounds.minLat = Math.min(cluster.bounds.minLat, otherLocation.coordinate.latitude);
                    cluster.bounds.maxLat = Math.max(cluster.bounds.maxLat, otherLocation.coordinate.latitude);
                    cluster.bounds.minLng = Math.min(cluster.bounds.minLng, otherLocation.coordinate.longitude);
                    cluster.bounds.maxLng = Math.max(cluster.bounds.maxLng, otherLocation.coordinate.longitude);

                    // Update cluster center
                    const totalLat = cluster.locations.reduce((sum, loc) => sum + loc.coordinate.latitude, 0);
                    const totalLng = cluster.locations.reduce((sum, loc) => sum + loc.coordinate.longitude, 0);
                    cluster.coordinate = {
                        latitude: totalLat / cluster.locations.length,
                        longitude: totalLng / cluster.locations.length,
                    };
                }
            });

            clusters.push(cluster);
        });

        return clusters;
    };

    const getClusterRadius = (zoom) => {
        // Adjust clustering radius based on zoom level
        if (zoom < 8) return 50; // km
        if (zoom < 12) return 10; // km
        if (zoom < 15) return 2; // km
        return 0.5; // km
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const deg2rad = (deg) => deg * (Math.PI / 180);

    const clusters = clusterLocations(normalized, zoom);

    return (
        <>
            {clusters.map((cluster, clusterIndex) => (
                cluster.locations.length > 1 ? (
                    <MapCluster
                        key={cluster.id || `cluster_${clusterIndex}`}
                        coordinate={cluster.coordinate}
                        pointCount={cluster.locations.length}
                        clusterId={cluster.id || `cluster_${clusterIndex}`}
                        onPress={() => onClusterPress && onClusterPress(cluster)}
                    />
                ) : (
                    (() => {
                        const loc = cluster.locations[0];
                        const fallbackId = loc.id || `${loc.coordinate.latitude.toFixed(6)}_${loc.coordinate.longitude.toFixed(6)}` || `idx_${clusterIndex}`;
                        return (
                          <Marker
                            key={`single_${fallbackId}`}
                            coordinate={loc.coordinate}
                            title={loc.title || loc.name || fallbackId}
                            description={loc.subtitle || loc.address || ''}
                            onPress={() => onClusterPress && onClusterPress({ ...cluster, isSingle: true })}
                          >
                            <View style={[
                                styles.singleMarkerContainer,
                                loc.type === 'public' ? styles.publicMarker : styles.userMarker,
                                loc._extra && styles.extraUserMarker
                            ]}>
                              <MaterialIcons
                                name={loc.markerIcon || 'ev-station'}
                                size={20}
                                color="#FFFFFF"
                              />
                              <View style={[
                                styles.markerPulse,
                                { backgroundColor: loc.markerColor || (loc.type==='public' ? '#FF6B6B':'#4ECDC4') }
                              ]} />
                            </View>
                          </Marker>
                        );
                    })()
                )
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    clusterContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    clusterInner: {
        width: '100%',
        height: '100%',
        borderRadius: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    clusterText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    clusterPulse: {
        position: 'absolute',
        opacity: 0.3,
        zIndex: -1,
    },
    singleMarkerContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    publicMarker: {
        backgroundColor: '#FF6B6B',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userMarker: {
        backgroundColor: '#4ECDC4',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    extraUserMarker: { borderColor: '#FFEB3B', borderWidth: 3 },
});

export default ClusterMarker;
