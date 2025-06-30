import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChargerLocationListScreen({ navigation, route }) {
    const { car, user, chargingLocations, searchCriteria } = route.params;

    const formatPrice = (price) => {
        return price ? `€${parseFloat(price).toFixed(2)}` : 'N/A';
    };

    const handleLocationSelect = (selectedLocation) => {
        navigation.navigate('BookingConfirmationScreen', {
            car,
            user,
            chargingLocation: selectedLocation
        });
    };

    const renderLocation = ({ item }) => (
        <TouchableOpacity
            style={styles.locationCard}
            onPress={() => handleLocationSelect(item)}
            activeOpacity={0.8}
        >
            <View style={styles.locationHeader}>
                <View style={styles.locationIconContainer}>
                    <MaterialIcons name="ev-station" size={24} color="#667eea" />
                </View>
                <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{item.name || `Station ${item.id}`}</Text>
                    <Text style={styles.locationAddress}>{item.address}</Text>
                    <Text style={styles.locationCity}>{item.city}, {item.post_code}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.is_available ? '#4CAF50' : '#ff6b6b' }]}>
                    <MaterialIcons
                        name={item.is_available ? "check-circle" : "cancel"}
                        size={16}
                        color="#fff"
                    />
                    <Text style={styles.statusText}>{item.is_available ? 'Available' : 'Occupied'}</Text>
                </View>
            </View>

            <View style={styles.locationDetails}>
                <View style={styles.detailRow}>
                    <MaterialIcons name="electric-bolt" size={18} color="#667eea" />
                    <Text style={styles.detailLabel}>Power:</Text>
                    <Text style={styles.detailValue}>{item.power_output || 'N/A'} kW</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={18} color="#667eea" />
                    <Text style={styles.detailLabel}>Rate:</Text>
                    <Text style={styles.detailValue}>{formatPrice(item.price_per_hour)}/hour</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialIcons name="speed" size={18} color="#667eea" />
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>
                        {item.fast_charging ? 'Fast Charging' : 'Standard'}
                    </Text>
                </View>
            </View>

            <View style={styles.selectButton}>
                <MaterialIcons name="arrow-forward" size={20} color="#667eea" />
                <Text style={styles.selectText}>Select This Station</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons name="list" size={60} color="#fff" />
                </View>
                <Text style={styles.title}>Available Stations</Text>
                <Text style={styles.subtitle}>
                    {chargingLocations.length} charging station{chargingLocations.length !== 1 ? 's' : ''} found
                </Text>
            </LinearGradient>

            <View style={styles.searchSummary}>
                <MaterialIcons name="search" size={20} color="#667eea" />
                <Text style={styles.searchText}>
                    {searchCriteria?.city}, {searchCriteria?.post_code}
                    {searchCriteria?.fast_charging && ' • Fast Charging'}
                </Text>
            </View>

            {chargingLocations.length === 0 ? (
                <ScrollView contentContainerStyle={styles.emptyContainer}>
                    <MaterialIcons name="ev-station" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>No charging stations found</Text>
                    <Text style={styles.emptySubtext}>
                        Try adjusting your search criteria or search in a different area
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="arrow-back" size={20} color="#667eea" />
                        <Text style={styles.backText}>Back to Search</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <FlatList
                    data={chargingLocations}
                    renderItem={renderLocation}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
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
