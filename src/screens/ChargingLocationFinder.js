import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ChargingLocationMap from '../components/ChargingLocationMap';
import FarsiText from '../components/FarsiText';
import FarsiTextInput from '../components/FarsiTextInput';
import chargingLocationService from '../services/chargingLocationService';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ChargingLocationFinder = ({ navigation, route }) => {
    const { t } = useTranslation();
    const [searchForm, setSearchForm] = useState({
        city: '',
        country: '',
        address: '',
        radius: 10
    });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mapFocusArea, setMapFocusArea] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);

    // Map filters & data
    const [showPublic, setShowPublic] = useState(true);
    const [showUser, setShowUser] = useState(true);
    const [showAccommodationOnly, setShowAccommodationOnly] = useState(false);
    const [visiblePublic, setVisiblePublic] = useState([]); // from map callback
    const [visibleUser, setVisibleUser] = useState([]);
    const [mapRegion, setMapRegion] = useState(null);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [focusLocation, setFocusLocation] = useState(null);

    useEffect(() => {
        // Auto-focus map when form has sufficient data
        if (searchForm.city && searchForm.country) {
            handleFormSubmit();
        }
    }, [searchForm.city, searchForm.country]);

    const handleFormSubmit = async () => {
        if (!searchForm.city || !searchForm.country) {
            Alert.alert(t('messages.error'), t('messages.pleaseEnterCityCountry'));
            return;
        }

        setLoading(true);
        try {
            // Geocode the address to get coordinates
            const coordinates = await chargingLocationService.geocodeAddress(
                searchForm.address,
                searchForm.city,
                searchForm.country
            );

            if (coordinates) {
                setMapFocusArea({
                    city: searchForm.city,
                    country: searchForm.country,
                    coordinates: coordinates
                });
                setShowMap(true);
            } else {
                Alert.alert(t('messages.error'), t('messages.locationNotFound'));
            }
        } catch (error) {
            console.error('Error geocoding location:', error);
            Alert.alert(t('messages.error'), t('messages.failedToFindLocation'));
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        // Automatically proceed without confirmation
        handleConfirmSelection(location);
    };

    const handleConfirmSelection = (location) => {
        // Navigate back with selected location or perform action
        if (route.params?.onLocationSelect) {
            route.params.onLocationSelect(location);
            navigation.goBack();
        } else {
            // Default action - navigate to location details
            navigation.navigate('LocationDetails', { location });
        }
    };

    const resetSearch = () => {
        setSearchForm({
            city: '',
            country: '',
            address: '',
            radius: 10
        });
        setSelectedLocation(null);
        setMapFocusArea(null);
        setShowMap(false);
    };

    const handleLocationsUpdate = ({ public: pub, user, region }) => {
        setVisiblePublic(pub);
        setVisibleUser(user);
        setMapRegion(region);
    };

    const handleListSelect = (loc) => {
        setSelectedLocationId(loc.id);
        setFocusLocation({ latitude: loc.coordinate.latitude, longitude: loc.coordinate.longitude });
        // auto proceed if selecting location is the action
        handleLocationSelect(loc);
    };

    const computeDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2-lat1)*Math.PI/180;
        const dLon = (lon2-lon1)*Math.PI/180;
        const a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
        return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    const combinedVisible = () => {
        const all = [
            ...visiblePublic.map(p=>({...p, _type:'public'})),
            ...visibleUser.map(u=>({...u, _type:'user'}))
        ];
        if(!mapRegion) return all;
        return all
            .map(l=>({
                ...l,
                _distance: computeDistance(mapRegion.latitude, mapRegion.longitude, l.coordinate.latitude, l.coordinate.longitude)
            }))
            .sort((a,b)=>a._distance - b._distance)
            .slice(0,50); // Limit list
    };

    const renderSearchForm = () => (
        <View style={styles.formContainer}>
            <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.formHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <MaterialIcons name="search" size={24} color="#FFFFFF" />
                <FarsiText style={styles.formTitle}>
                    {t('chargingFinder.findChargingStations')}
                </FarsiText>
            </LinearGradient>

            <View style={styles.formContent}>
                <View style={styles.inputRow}>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="location-city" size={20} color="#666" style={styles.inputIcon} />
                        <FarsiTextInput
                            style={styles.input}
                            placeholder={t('chargingFinder.enterCity')}
                            value={searchForm.city}
                            onChangeText={(value) => setSearchForm({...searchForm, city: value})}
                            placeholderTextColor="#999"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="public" size={20} color="#666" style={styles.inputIcon} />
                        <FarsiTextInput
                            style={styles.input}
                            placeholder={t('chargingFinder.enterCountry')}
                            value={searchForm.country}
                            onChangeText={(value) => setSearchForm({...searchForm, country: value})}
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <MaterialIcons name="location-on" size={20} color="#666" style={styles.inputIcon} />
                    <FarsiTextInput
                        style={styles.input}
                        placeholder={t('chargingFinder.specificAddress')}
                        value={searchForm.address}
                        onChangeText={(value) => setSearchForm({...searchForm, address: value})}
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.radiusContainer}>
                    <FarsiText style={styles.radiusLabel}>
                        {t('chargingFinder.searchRadius')}: {searchForm.radius}km
                    </FarsiText>
                    <View style={styles.radiusButtons}>
                        {[5, 10, 20, 50].map(radius => (
                            <TouchableOpacity
                                key={radius}
                                style={[
                                    styles.radiusButton,
                                    searchForm.radius === radius && styles.radiusButtonActive
                                ]}
                                onPress={() => setSearchForm({...searchForm, radius})}
                            >
                                <FarsiText style={[
                                    styles.radiusButtonText,
                                    searchForm.radius === radius && styles.radiusButtonTextActive
                                ]}>
                                    {radius}km
                                </FarsiText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleFormSubmit}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={loading ? ['#ccc', '#999'] : ['#4ECDC4', '#44A08D']}
                        style={styles.searchButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <MaterialIcons
                            name={loading ? "hourglass-empty" : "search"}
                            size={20}
                            color="#FFFFFF"
                        />
                        <FarsiText style={styles.searchButtonText}>
                            {loading ? t('chargingFinder.searching') : t('chargingFinder.searchLocations')}
                        </FarsiText>
                    </LinearGradient>
                </TouchableOpacity>

                {showMap && (
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetSearch}
                    >
                        <MaterialIcons name="refresh" size={20} color="#4ECDC4" />
                        <FarsiText style={styles.resetButtonText}>
                            {t('chargingFinder.newSearch')}
                        </FarsiText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={40}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
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
                    <FarsiText style={styles.headerTitle}>
                        {t('chargingFinder.title')}
                    </FarsiText>
                    <FarsiText style={styles.headerSubtitle}>
                        {t('chargingFinder.subtitle')}
                    </FarsiText>
                </View>
            </LinearGradient>

            {/* Search Form */}
            {renderSearchForm()}

            {/* Map Section */}
            {showMap && mapFocusArea && (
                <View style={styles.mapSection}>
                    <View style={styles.mapHeader}>
                        <MaterialIcons name="map" size={24} color="#4ECDC4" />
                        <FarsiText style={styles.mapHeaderText}>
                            {t('chargingFinder.availableStations')} - {mapFocusArea.city}, {mapFocusArea.country}
                        </FarsiText>
                        <TouchableOpacity
                            style={styles.fullMapBtn}
                            onPress={() => navigation.navigate('ChargingMapListWrapper', { focusArea: mapFocusArea, radius: searchForm.radius })}
                        >
                            <MaterialIcons name="open-in-full" size={18} color="#fff" />
                            <FarsiText style={styles.fullMapBtnText}>{t('messages.findCharger')}</FarsiText>
                        </TouchableOpacity>
                    </View>

                    {/* Filter Chips */}
                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={[styles.filterChip, showPublic ? styles.filterChipActive : null]}
                            onPress={() => setShowPublic(s=>!s)}
                        >
                            <MaterialIcons name="ev-station" size={16} color={showPublic? '#fff':'#4ECDC4'} />
                            <FarsiText style={[styles.filterChipText, showPublic && styles.filterChipTextActive]}>{t('map.public')}</FarsiText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterChip, showUser ? styles.filterChipActive : null]}
                            onPress={() => setShowUser(s=>!s)}
                        >
                            <MaterialIcons name="home" size={16} color={showUser? '#fff':'#4ECDC4'} />
                            <FarsiText style={[styles.filterChipText, showUser && styles.filterChipTextActive]}>{t('map.private')}</FarsiText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterChip, showAccommodationOnly ? styles.filterChipActive : null]}
                            onPress={() => setShowAccommodationOnly(s=>!s)}
                        >
                            <MaterialIcons name="hotel" size={16} color={showAccommodationOnly? '#fff':'#4ECDC4'} />
                            <FarsiText style={[styles.filterChipText, showAccommodationOnly && styles.filterChipTextActive]}>{t('map.accommodation')}</FarsiText>
                        </TouchableOpacity>
                    </View>

                    <ChargingLocationMap
                        style={styles.map}
                        focusArea={mapFocusArea}
                        searchRadius={searchForm.radius}
                        enableLocationSelection={true}
                        onLocationSelect={handleLocationSelect}
                        showPublicChargers={showPublic}
                        showUserLocations={showUser}
                        showAccommodationOnly={showAccommodationOnly}
                        onLocationsUpdate={handleLocationsUpdate}
                        selectedLocationId={selectedLocationId}
                        focusLocation={focusLocation}
                    />

                    {/* Dynamic List */}
                    <View style={styles.listContainer}>
                        <FarsiText style={styles.listHeader}>{combinedVisible().length} {t('chargingFinder.availableStations')}</FarsiText>
                        {combinedVisible().map(item => (
                            <TouchableOpacity
                                key={`${item._type}-${item.id}`}
                                style={[styles.listItem, item._type==='public'? styles.publicBorder: styles.userBorder, item.id===selectedLocationId && styles.listItemSelected]}
                                onPress={() => handleListSelect(item)}
                            >
                                <View style={styles.listIconWrap}>
                                    <MaterialIcons name={item._type==='public'? 'ev-station':'home'} size={20} color={item._type==='public'? '#FF6B6B':'#4ECDC4'} />
                                </View>
                                <View style={styles.listTextWrap}>
                                    <FarsiText style={styles.listTitle}>{item.title}</FarsiText>
                                    <FarsiText style={styles.listSubtitle}>{item.subtitle}</FarsiText>
                                    <FarsiText style={styles.listMeta}>{item._distance? item._distance.toFixed(2)+' km • ':''}{item.hasAccommodation? t('messages.hasAccommodation'): ''}</FarsiText>
                                </View>
                                <MaterialIcons name="chevron-right" size={20} color="#999" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Quick Info */}
            {!showMap && (
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <MaterialIcons name="info" size={24} color="#4ECDC4" />
                        <FarsiText style={styles.infoTitle}>
                            {t('chargingFinder.howItWorks')}
                        </FarsiText>
                        <FarsiText style={styles.infoText}>
                            {t('chargingFinder.howItWorksDescription')}
                        </FarsiText>
                    </View>

                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="location-on" size={20} color="#FF6B6B" />
                            <FarsiText style={styles.featureText}>
                                {t('chargingFinder.publicStations')}
                            </FarsiText>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="home" size={20} color="#4ECDC4" />
                            <FarsiText style={styles.featureText}>
                                {t('chargingFinder.privateLocations')}
                            </FarsiText>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="speed" size={20} color="#FFD93D" />
                            <FarsiText style={styles.featureText}>
                                {t('chargingFinder.fastCharging')}
                            </FarsiText>
                        </View>
                    </View>
                </View>
            )}
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        zIndex: 1,
        padding: 8,
        borderRadius: 20,
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
        textAlign: 'center',
        marginTop: 5,
    },
    formContainer: {
        margin: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    formContent: {
        padding: 20,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    radiusContainer: {
        marginBottom: 20,
    },
    radiusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    radiusButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    radiusButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4ECDC4',
        alignItems: 'center',
    },
    radiusButtonActive: {
        backgroundColor: '#4ECDC4',
    },
    radiusButtonText: {
        fontSize: 14,
        color: '#4ECDC4',
        fontWeight: '500',
    },
    radiusButtonTextActive: {
        color: '#FFFFFF',
    },
    searchButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
    },
    searchButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    searchButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4ECDC4',
    },
    resetButtonText: {
        fontSize: 16,
        color: '#4ECDC4',
        fontWeight: '500',
        marginLeft: 10,
    },
    mapSection: {
        margin: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    mapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    mapHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 10,
        flex: 1,
    },
    fullMapBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#667eea', paddingHorizontal:12, paddingVertical:8, borderRadius:20 },
    fullMapBtnText:{ color:'#fff', fontSize:12, marginLeft:6, fontWeight:'600' },
    map: {
        height: screenHeight * 0.5,
    },
    infoSection: {
        margin: 20,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    featuresContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    featureText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
        flex: 1,
    },
    filterRow:{
        flexDirection:'row',
        paddingHorizontal:10,
        paddingTop:10,
        gap:8,
        flexWrap:'wrap'
    },
    filterChip:{
        flexDirection:'row',
        alignItems:'center',
        borderWidth:1,
        borderColor:'#4ECDC4',
        paddingHorizontal:10,
        paddingVertical:6,
        borderRadius:20,
        backgroundColor:'#fff'
    },
    filterChipActive:{
        backgroundColor:'#4ECDC4'
    },
    filterChipText:{
        marginLeft:6,
        fontSize:12,
        color:'#4ECDC4',
        fontWeight:'600'
    },
    filterChipTextActive:{
        color:'#fff'
    },
    listContainer:{
        maxHeight:300,
        paddingHorizontal:10,
        paddingBottom:10,
        backgroundColor:'#fff'
    },
    listHeader:{
        fontSize:14,
        fontWeight:'700',
        marginVertical:6,
        color:'#333'
    },
    listItem:{
        flexDirection:'row',
        alignItems:'center',
        padding:10,
        marginBottom:8,
        borderRadius:12,
        backgroundColor:'#fafafa',
        borderWidth:1,
        borderColor:'#eee'
    },
    listItemSelected:{
        backgroundColor:'#e8fdf9'
    },
    publicBorder:{ borderColor:'#FF6B6B66'},
    userBorder:{ borderColor:'#4ECDC466'},
    listIconWrap:{
        width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center',backgroundColor:'#fff',marginRight:10
    },
    listTextWrap:{ flex:1 },
    listTitle:{ fontSize:14,fontWeight:'700',color:'#333' },
    listSubtitle:{ fontSize:12,color:'#666',marginTop:2 },
    listMeta:{ fontSize:11,color:'#999',marginTop:2 }
});

export default ChargingLocationFinder;
