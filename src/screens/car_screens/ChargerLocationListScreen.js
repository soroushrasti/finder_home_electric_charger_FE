import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";


export default function ChargerLocationListScreen({ navigation, route, visibleLocations = [], selectedLocationId = null, onLocationSelectFromList, disableNavigation = false }) {
    const { t } = useTranslation();

    // Use visibleLocations if provided, else fallback to route.params
    const { car, user, chargingLocations, searchCriteria } = route?.params || {};
    const locations = visibleLocations.length > 0 ? visibleLocations : (chargingLocations || []);

    const formatPrice = (price) => {
        return price ? `${parseFloat(price).toFixed(2)}` : 'N/A';
    };

    const badge = (txt, style) => (
      <View style={[styles.badge, style]}><FarsiText style={styles.badgeText}>{txt}</FarsiText></View>
    );

    const handleLocationSelect = (selectedLocation) => {
        if (onLocationSelectFromList) onLocationSelectFromList(selectedLocation);
        if(disableNavigation) return;
        navigation.navigate('BookingConfirmationScreen', {
            car,
            user,
            chargingLocation: selectedLocation
        });
    };

    const renderLocation = ({ item }) => {
        const isUser = item.is_user || item.type === 'user';
        const isSelected = selectedLocationId === item.id;
        const displayName = item.name || item.title || `Station ${item.id}`;
        const coordLat = item.latitude || item.coordinate?.latitude;
        const coordLng = item.longitude || item.coordinate?.longitude;
        return (
        <TouchableOpacity
            style={[
                styles.locationCard,
                isSelected && styles.selectedCard,
                isUser ? styles.userCard : styles.publicCard,
                item._extra && styles.extraNearbyCard,
                item._extra2 && styles.extraNearbyCard2
            ]}
            onPress={() => handleLocationSelect(item)}
            activeOpacity={0.8}
        >
            <View style={styles.locationHeader}>
                <View style={[styles.locationIconContainer, isUser && {backgroundColor:'#e3f2fd'}]}>
                    <MaterialIcons name={isUser? 'home':'ev-station'} size={24} color={isUser ? '#2196f3' : '#e53935'} />
                </View>
                <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{displayName}</Text>
                    {item.address && <Text style={styles.locationAddress}>{item.address}</Text>}
                    {(item.city || item.post_code || item.country) && (
                      <Text style={styles.locationCity}>{item.city || ''}{item.post_code? ', '+item.post_code:''}{item.country? ', '+item.country:''}</Text>
                    )}
                    <View style={styles.badgeRow}>
                      {badge(isUser ? 'USER' : 'PUBLIC', isUser ? styles.userTypeBadge : styles.publicTypeBadge)}
                      {item._extra && badge('NEARBY', styles.nearbyBadge)}
                      {item._extra2 && badge('MORE', styles.nearbyMoreBadge)}
                      {item.hasAccommodation && badge('ACCOM', styles.accommodationBadge)}
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.is_available === false ? '#ff6b6b' : '#4CAF50' }]}>
                    <MaterialIcons
                        name={item.is_available === false ? 'cancel' : 'check-circle'}
                        size={16}
                        color="#fff"
                    />
                    <FarsiText style={styles.statusText}>{item.is_available === false ? t('messages.occupied') : t('messages.avail')}</FarsiText>
                </View>
            </View>
            <View style={styles.locationDetails}>
                <View style={styles.detailRow}>
                    <MaterialIcons name="electric-bolt" size={18} color="#667eea" />
                    <FarsiText style={styles.detailLabel}>{t('messages.pw')}</FarsiText>
                    <FarsiText style={styles.detailValue}>{item.power_output || item.powerKw || 'N/A'} {t('messages.kw')}</FarsiText>
                </View>
                {item.price_per_hour && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={18} color="#667eea" />
                    <FarsiText style={styles.detailLabel}>{t('messages.rat')}</FarsiText>
                    <Text style={styles.detailValue}>{formatPrice(item.price_per_hour)}/hour</Text>
                  </View>
                )}
                {(coordLat && coordLng) && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={18} color="#667eea" />
                    <FarsiText style={styles.detailLabel}>Lat/Lng</FarsiText>
                    <FarsiText style={styles.detailValue}>{coordLat.toFixed ? coordLat.toFixed(4): coordLat}, {coordLng.toFixed ? coordLng.toFixed(4): coordLng}</FarsiText>
                  </View>
                )}
            </View>
        </TouchableOpacity>
    )};

    return (
        <FlatList
            data={locations}
            renderItem={renderLocation}
            keyExtractor={item => (item.id ? item.id.toString() : `${item.latitude || item.coordinate?.latitude}_${item.longitude || item.coordinate?.longitude}`)}
            contentContainerStyle={{ padding: 12 }}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    searchSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
        fontWeight: '600',
    },
    listContainer: {
        padding: 20,
        paddingTop: 0,
    },
    locationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedCard: { borderWidth: 2, borderColor: '#ffeb3b', backgroundColor: '#fffde7' },
    extraNearbyCard: { borderRightWidth:4, borderRightColor:'#2196f3' },
    extraNearbyCard2: { borderRightWidth:4, borderRightColor:'#ff9800' },
    badgeRow:{ flexDirection:'row', flexWrap:'wrap', marginTop:6 },
    badge:{ paddingHorizontal:6, paddingVertical:2, borderRadius:10, marginRight:6, marginBottom:4, backgroundColor:'#eee' },
    badgeText:{ fontSize:9, fontWeight:'600', color:'#333' },
    publicTypeBadge:{ backgroundColor:'#e53935' },
    userTypeBadge:{ backgroundColor:'#2196f3' },
    nearbyBadge:{ backgroundColor:'#2196f3' },
    nearbyMoreBadge:{ backgroundColor:'#ff9800' },
    accommodationBadge:{ backgroundColor:'#8e44ad' },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    locationIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    locationAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    locationCity: {
        fontSize: 12,
        color: '#999',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        height: 24,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 4,
    },
    locationDetails: {
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        minWidth: 60,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        flex: 1,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#f0f4ff',
        borderRadius: 8,
    },
    selectText: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#f0f4ff',
        borderRadius: 8,
    },
    backText: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
