import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import FarsiText from '../../components/FarsiText';
import MapScreen from '../../components/MapScreen.native';
import ChargerLocationListScreen from './ChargerLocationListScreen';
import chargingLocationService from '../../services/chargingLocationService';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * ChargingMapListWrapperScreen
 * Responsibilities:
 *  - Accept form / focus area (via route.params: { focusArea, radius })
 *  - Fetch combined charging locations once (public + user) centered on focusArea
 *  - Pass locations to MapScreen (disable internal auto fetching)
 *  - Sync visible map subset + selection with list
 *  - Allow selecting in list to focus map + keep selection highlighted
 */
export default function ChargingMapListWrapperScreen({ navigation, route }) {
  const { t } = useTranslation();
  const focusArea = route?.params?.focusArea || null; // { coordinates: {latitude, longitude}, city, country }
  const radius = route?.params?.radius || 10;

  const [loading, setLoading] = useState(true);
  const [allLocations, setAllLocations] = useState([]); // unified array
  const [visibleLocations, setVisibleLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [focusLocation, setFocusLocation] = useState(null);
  const [lastRegion, setLastRegion] = useState(null);
  const [error, setError] = useState(null);

  // Fetch combined locations once we have a focus center
  const loadLocations = useCallback(async () => {
    if(!focusArea?.coordinates) return;
    setLoading(true);
    setError(null);
    try {
      const { publicChargers, userLocations } = await chargingLocationService.getCombinedChargingLocations(
        focusArea.coordinates.latitude,
        focusArea.coordinates.longitude,
        radius,
        true,
        true
      );
      // Normalize shape: ensure latitude/longitude flat props for MapScreen filtering logic
      const normalized = [...publicChargers, ...userLocations].map(l => ({
        ...l,
        latitude: l.coordinate?.latitude ?? l.latitude,
        longitude: l.coordinate?.longitude ?? l.longitude,
        name: l.title || l.name,
      }));
      setAllLocations(normalized);
    } catch(e){
      console.log('Failed loading combined chargers', e);
      setError(e.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [focusArea?.coordinates?.latitude, focusArea?.coordinates?.longitude, radius]);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  // Callback from MapScreen for dynamic viewport updates
  const handleMapDataUpdate = ({ visibleLocations: vis, region, selectedLocationId: selId }) => {
    if(vis) setVisibleLocations(vis.map(l => ({
      ...l,
      latitude: l.coordinate?.latitude ?? l.latitude,
      longitude: l.coordinate?.longitude ?? l.longitude,
      name: l.title || l.name,
    })));
    if(region) setLastRegion(region);
    if(selId) setSelectedLocationId(selId);
  };

  // When list item selected
  const handleListSelect = (loc) => {
    setSelectedLocationId(loc.id);
    setFocusLocation({ latitude: loc.latitude || loc.coordinate?.latitude, longitude: loc.longitude || loc.coordinate?.longitude });
  };

  const retry = () => loadLocations();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <FarsiText style={styles.headerTitle}>{t('messages.findCharger')}</FarsiText>
        <FarsiText style={styles.headerSubtitle}>{focusArea?.city ? `${focusArea.city}, ${focusArea.country}` : ''}</FarsiText>
      </View>
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#667eea" />
          <FarsiText style={styles.loadingText}>{t('messages.loadingLocation')}</FarsiText>
        </View>
      )}
      {!loading && error && (
        <View style={styles.errorBox}>
          <FarsiText style={styles.errorTitle}>{t('messages.error')}</FarsiText>
          <FarsiText style={styles.errorMsg}>{error}</FarsiText>
          <TouchableOpacity onPress={retry} style={styles.retryBtn}>
            <FarsiText style={styles.retryText}>{t('messages.retry')}</FarsiText>
          </TouchableOpacity>
        </View>
      )}
      {!loading && !error && (
        <>
          <View style={styles.mapWrapper}>
            <MapScreen
              style={styles.map}
              chargingLocations={allLocations}
              focusArea={focusArea}
              disableAutoFetch={true}
              onMapDataUpdate={handleMapDataUpdate}
              externalSelectedLocationId={selectedLocationId}
              focusLocation={focusLocation}
            />
          </View>
          <View style={styles.listWrapper}>
            <ChargerLocationListScreen
              navigation={navigation}
              route={{ params: {} }}
              visibleLocations={visibleLocations}
              selectedLocationId={selectedLocationId}
              onLocationSelectFromList={handleListSelect}
              disableNavigation={true}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingTop: 50, paddingBottom: 12, backgroundColor: '#667eea', alignItems: 'center', position: 'relative' },
  backBtn: { position: 'absolute', top: 52, left: 16, padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  headerSubtitle: { color: '#e0e7ff', fontSize: 12, marginTop: 2 },
  loadingBox: { flex: 1, justifyContent:'center', alignItems:'center', padding:24 },
  loadingText: { marginTop: 12, color:'#555' },
  errorBox: { flex:1, justifyContent:'center', alignItems:'center', padding:32 },
  errorTitle: { fontSize:18, fontWeight:'700', color:'#e53935' },
  errorMsg: { marginTop:8, color:'#444', textAlign:'center' },
  retryBtn: { marginTop:16, backgroundColor:'#667eea', paddingHorizontal:20, paddingVertical:10, borderRadius:8 },
  retryText: { color:'#fff', fontWeight:'600' },
  mapWrapper: { flex: 1.2 },
  map: { flex: 1 },
  listWrapper: { flex: 1, backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#e2e8f0' }
});

