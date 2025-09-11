import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FarsiText from  "../../components/FarsiText";
import FarsiTextInput from  "../../components/FarsiTextInput";
import {useTranslation} from "react-i18next";
import { useLanguage } from '../../context/LanguageContext';
import faCountries from '../../localization/faCountryCodes.json';
import enCountries from '../../localization/enCountryCodes.json';

export default function ChargerLocationFormScreen({ navigation, route }) {
    const { t } = useTranslation();

    const { language } = useLanguage();
    const countriesSource = language === 'fa' ? faCountries : enCountries;
    const extractFlag = (label='') => {
        if(!label || typeof label !== 'string') return '';
        const trimmed = label.trim();
        const all = trimmed.match(/(\uD83C[\uDDE6-\uDDFF]\uD83C[\uDDE6-\uDDFF])/g);
        if(all && all.length) return all[all.length-1];
        // Fallback scan by code units
        for(let i=0;i<trimmed.length-1;i++){
          const hi = trimmed.charCodeAt(i);
          const lo = trimmed.charCodeAt(i+1);
          if(hi >= 0xD83C && hi <= 0xD83C && lo >= 0xDDE6 && lo <= 0xDDFF){
            // Try pair i & i+2 (two surrogate pairs)
          }
        }
        return '';
    };
    const enrich = (arr) => arr.map(c=>({ ...c, flag: extractFlag(c.label), pureLabel: c.label.replace(c.value,'').replace(extractFlag(c.label),'').trim() }));
    const [countries, setCountries] = useState(enrich(countriesSource));
    const [selectedCountry, setSelectedCountry] = useState(enrich(countriesSource)[0]);
    const [phoneLocalNumber, setPhoneLocalNumber] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false); // NEW
    const currentFlag = selectedCountry?.flag; // NEW
    const normalizeLocalDigits = (v='') => v.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^0-9]/g,''); // NEW helper
    // keep legacy selectedCode for backward compatibility (can be removed later)
    const [selectedCode, setSelectedCode] = useState(countries[0].value);

    // Update selectedCountry when language changes preserving previous dial code if possible
    React.useEffect(()=>{
        const enriched = enrich(countriesSource);
        // preserve selection by value
        const current = enriched.find(c=>c.value === selectedCountry?.value) || enriched[0];
        setCountries(enriched);
        setSelectedCountry(current);
    }, [language]);

    // Sync combined phone number into formData whenever pieces change
    React.useEffect(()=>{
        setFormData(prev=>({ ...prev, phone_number: `${selectedCountry?.value || ''}${phoneLocalNumber}` }));
    }, [selectedCountry?.value, phoneLocalNumber]);

    const user = route.params?.user;
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        country: t('messages.iran'), // Default country
        postcode: '',
        street: '',
        alley: '',
        phone_number: '',
        power_output: '7.4', // Default 7.4 kW (typical home charger)
        price_per_hour: '50000', // Default price in Iranian Rials
        description: '',
        fast_charging: false,
        has_accommodation: false, // NEW FLAG
        user_id: user?.user_id || null
    });
    const [loading, setLoading] = useState(false);
    const handleNext = () => {
        if (!validateForm()) return;
        navigation.navigate('FinalizeAddLocationScreen', {
            formData,
            onLocationAdded // Pass this callback
        });
    };

    const onLocationAdded = route.params?.onLocationAdded;

    const handleInputChange = (field, value) => {
        // Skip phone_number here (handled separately)
        if(field === 'phone_number') return;
        setFormData(prev => {
            let updated = { ...prev, [field]: value };
            if (field === 'country') {
                if (value.toLowerCase() === 'iran') {
                    updated.price_per_hour = '50000';
                } else {
                    updated.price_per_hour = '5';
                }
            }
            return updated;
        });
    };

    const validateForm = () => {
        const { name, country, city, postcode, street, power_output, price_per_hour } = formData;
        const fullPhone = `${selectedCountry?.value || ''}${phoneLocalNumber}`;
        if (!name.trim()) { Alert.alert(t('messages.validationError'), t('messages.stationName')); return false; }
        if (!country.trim()) { Alert.alert(t('messages.validationError'), t('messages.countryRequire')); return false; }
        if (!city.trim()) { Alert.alert(t('messages.validationError'), t('messages.cityRequire')); return false; }
        if (!postcode.trim()) { Alert.alert(t('messages.validationError'), t('messages.postcodeRequire')); return false; }
        if (!street.trim()) { Alert.alert(t('messages.validationError'), t('messages.streetAddressRequire')); return false; }
        if (!phoneLocalNumber.trim()) { Alert.alert(t('messages.validationError'), t('messages.phoneNumberRequire')); return false; }
        if (!power_output.trim()) { Alert.alert(t('messages.validationError'), t('messages.powerRequire')); return false; }
        if (!price_per_hour.trim()) { Alert.alert(t('messages.validationError'), t('messages.priceRequire')); return false; }
        const phoneRegex = /^\+[0-9]{1,4}[0-9]{6,}$/; // basic intl pattern
        if(!phoneRegex.test(fullPhone)) { Alert.alert(t('messages.validationError'), t('messages.validPhone')); return false; }
        const englishPower = power_output.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace('٫', '.');
        if (isNaN(parseFloat(englishPower))) { Alert.alert(t('messages.validationError'), t('messages.validPower')); return false; }
        const englishPrice = price_per_hour.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace('٫', '.');
        if (isNaN(parseFloat(englishPrice))) { Alert.alert(t('messages.validationError'), t('messages.validPrice')); return false; }
        return true; };



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="ev-station" size={50} color="#4285F4" />
                    </View>
                    <Text style={styles.title}>{t('messages.selectChargingStation')}</Text>
                    <Text style={styles.subtitle}>{t('messages.shareCharger')}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="business" size={20} color="#4285F4" />
                        <Text style={styles.sectionTitle}>{t('messages.stationInfo')}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="location-on" size={20} color="#4285F4" style={styles.inputIcon} />
                        <FarsiTextInput
                            style={styles.input}
                            placeholder= {t('messages.stationName')}
                            value={formData.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="place" size={20} color="#4285F4" />
                        <Text style={styles.sectionTitle}>{t('messages.locationDetail')}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="public" size={20} color="#4285F4" style={styles.inputIcon} />
                        <FarsiTextInput
                            style={styles.input}
                            placeholder={t('messages.country') || 'Country'}
                            value={formData.country}
                            onChangeText={(value) => handleInputChange('country', value)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <View style={[styles.inputContainer, styles.flexInput]}>
                            <MaterialIcons name="location-city" size={20} color="#4285F4" style={styles.inputIcon} />
                            <FarsiTextInput
                                style={styles.input}
                                placeholder= {t('messages.city')}
                                value={formData.city}
                                onChangeText={(value) => handleInputChange('city', value)}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputContainer, styles.smallInput]}>
                            <MaterialIcons name="markunread-mailbox" size={20} color="#4285F4" style={styles.inputIcon} />
                            <FarsiTextInput
                                style={styles.input}
                                placeholder= {t('messages.postcode')}
                                value={formData.postcode}
                                onChangeText={(value) => handleInputChange('postcode', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>



                    <View style={styles.inputContainer}>
                        <MaterialIcons name="home" size={20} color="#4285F4" style={styles.inputIcon} />
                        <FarsiTextInput
                            style={styles.input}
                            placeholder={t('messages.streetAdd')}
                            value={formData.street}
                            onChangeText={(value) => handleInputChange('street', value)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="place" size={20} color="#4285F4" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('messages.alley')}
                            value={formData.alley}
                            onChangeText={(value) => handleInputChange('alley', value)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={[styles.inputContainer, showCountryDropdown && styles.phoneContainerRaised]}>
                        <MaterialIcons name="phone" size={20} color="#4285F4" style={styles.inputIcon} />
                        <View style={styles.phoneRow}>
                          <TouchableOpacity style={styles.dialCodeBtn} onPress={()=>setShowCountryDropdown(s=>!s)} activeOpacity={0.7}>
                            <FarsiText style={styles.dialCodeText}>{selectedCountry?.value}</FarsiText>
                            <FarsiText style={styles.flagText}>{currentFlag || '🏳️'}</FarsiText>
                            <MaterialIcons name={showCountryDropdown? 'arrow-drop-up':'arrow-drop-down'} size={20} color="#555" />
                          </TouchableOpacity>
                          <FarsiTextInput
                              style={[styles.input, styles.phoneInput]}
                              placeholder={t('messages.phoneNum')}
                              value={phoneLocalNumber}
                              onChangeText={(v)=>setPhoneLocalNumber(normalizeLocalDigits(v))}
                              keyboardType="phone-pad"
                              placeholderTextColor="#999"
                          />
                          {showCountryDropdown && (
                            <>
                              <TouchableOpacity style={styles.fullscreenBackdrop} activeOpacity={1} onPress={()=>setShowCountryDropdown(false)} />
                              <View style={styles.countryDropdown}>
                                <ScrollView style={{maxHeight:300}}>
                                  {countries.map(item => (
                                      <TouchableOpacity
                                        key={item.value}
                                        style={styles.countryItem}
                                        onPress={()=>{ setSelectedCountry(item); setSelectedCode(item.value); setShowCountryDropdown(false); }}
                                      >
                                        <FarsiText style={styles.countryFlag}>{item.flag || '🏳️'}</FarsiText>
                                        <View style={{flex:1}}>
                                          <FarsiText style={styles.countryName}>{item.pureLabel}</FarsiText>
                                          <FarsiText style={styles.countryDial}>{item.value}</FarsiText>
                                        </View>
                                        {item.value === selectedCountry?.value && <MaterialIcons name="check" size={18} color="#34A853" />}
                                      </TouchableOpacity>
                                  ))}
                                </ScrollView>
                              </View>
                            </>
                          )}
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="flash-on" size={20} color="#4285F4" />
                        <Text style={styles.sectionTitle}>{t('messages.technical')}</Text>
                    </View>

                    <View style={styles.inputRow}>
                        <View style={[styles.inputContainer, styles.halfInput]}>
                            <MaterialIcons name="flash-on" size={20} color="#4285F4" style={styles.inputIcon} />
                            <FarsiTextInput
                                style={styles.input}
                                placeholder={t('messages.power')}
                                value={formData.power_output}
                                onChangeText={(value) => handleInputChange('power_output', value)}
                                keyboardType="decimal-pad"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputContainer, styles.halfInput]}>
                            <MaterialIcons name="attach-money" size={20} color="#4285F4" style={styles.inputIcon} />
                            <FarsiTextInput
                                style={styles.input}
                                placeholder={t('messages.hour')}
                                value={formData.price_per_hour}
                                onChangeText={(value) => handleInputChange('price_per_hour', value)}
                                keyboardType="decimal-pad"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.switchContainer}>
                        <View style={styles.switchInfo}>
                            <MaterialIcons name="speed" size={24} color="#4285F4" />
                            <View style={styles.switchTextContainer}>
                                <FarsiText style={styles.switchLabel}>{t('messages.fastCharging')}</FarsiText>
                                <FarsiText style={styles.switchDescription}>
                                    {t('messages.enableDc')}
                                </FarsiText>
                            </View>
                        </View>
                        <Switch
                            value={formData.fast_charging}
                            onValueChange={(value) => handleInputChange('fast_charging', value)}
                            trackColor={{ false: '#ccc', true: '#4285F4' }}
                            thumbColor={formData.fast_charging ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    {/* Accommodation Switch */}
                    <View style={styles.switchContainer}>
                        <View style={styles.switchInfo}>
                            <MaterialIcons name="hotel" size={24} color="#4285F4" />
                            <View style={styles.switchTextContainer}>
                                <FarsiText style={styles.switchLabel}>{t('messages.hasAccommodation')}</FarsiText>
                                <FarsiText style={styles.switchDescription}>
                                    {t('messages.enableAccommodation')}
                                </FarsiText>
                            </View>
                        </View>
                        <Switch
                            value={formData.has_accommodation}
                            onValueChange={(value) => handleInputChange('has_accommodation', value)}
                            trackColor={{ false: '#ccc', true: '#4285F4' }}
                            thumbColor={formData.has_accommodation ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="description" size={20} color="#4285F4" style={styles.inputIcon} />
                        <FarsiTextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder={t('messages.description')}
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleNext}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#4285F4', '#34A853']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <MaterialIcons name="hourglass-empty" size={24} color="#fff" />
                            ) : (
                                <MaterialIcons name="add-location" size={24} color="#fff" />
                            )}
                            <FarsiText style={styles.buttonText}>
                                {loading ? t('messages.addStation') : t('messages.addChargingStation')}
                            </FarsiText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.benefitsCard}>
                    <FarsiText style={styles.benefitsTitle}>💡 {t('messages.benefits')}</FarsiText>
                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="attach-money" size={16} color="#34A853" />
                            <FarsiText style={styles.benefitText}>{t('messages.earnIncome')}</FarsiText>
                        </View>
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="eco" size={16} color="#34A853" />
                            <FarsiText style={styles.benefitText}>{t('messages.supportTransport')}</FarsiText>
                        </View>
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="people" size={16} color="#34A853" />
                            <FarsiText style={styles.benefitText}>{t('messages.helpCommunity')}</FarsiText>
                        </View>
                    </View>
                </View>

                <View style={styles.noteContainer}>
                    <MaterialIcons name="info" size={20} color="#ff9800" />
                    <FarsiText style={styles.noteText}>
                        {t('messages.requiredField')}
                    </FarsiText>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'visible',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    flexInput: {
        flex: 2,
    },
    smallInput: {
        flex: 1,
    },
    inputIcon: {
        marginRight: 12,
        marginTop: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    multilineInput: {
        paddingTop: 16,
        paddingBottom: 16,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    switchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    switchTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    switchDescription: {
        fontSize: 12,
        color: '#666',
    },
    addButton: {
        borderRadius: 12,
        marginTop: 8,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    benefitsCard: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    benefitsList: {
        gap: 8,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    benefitText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        margin: 20,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
    },
    noteText: {
        fontSize: 12,
        color: '#856404',
        marginLeft: 12,
        flex: 1,
        lineHeight: 16,
    },
    phoneRow:{ flex:1, flexDirection:'row', alignItems:'center', paddingVertical:8, position:'relative', zIndex:1000 },
    countryDropdown:{ position:'absolute', top:'100%', left:0, marginTop:6, backgroundColor:'#fff', borderRadius:10, paddingHorizontal:10, paddingVertical:6, elevation:20, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, width:250, zIndex:2000, borderWidth:1, borderColor:'#e0e0e0' },
    fullscreenBackdrop:{ position:'absolute', top:-3000, left:-3000, width:6000, height:6000, backgroundColor:'transparent', zIndex:1500 },
    dialCodeBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#f0f4ff', paddingHorizontal:10, paddingVertical:8, borderRadius:8, marginRight:8 },
    dialCodeText:{ fontSize:14, fontWeight:'600', color:'#333', marginRight:4 },
    flagText:{ fontSize:20, marginRight:4 },
    phoneInput:{ paddingVertical:8 },
    countryItem:{ flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#eee' },
    countryFlag:{ fontSize:22, marginRight:10 },
    countryName:{ fontSize:14, fontWeight:'600', color:'#333' },
    countryDial:{ fontSize:12, color:'#666' },
    phoneContainerRaised:{ zIndex:4000, elevation:40 }
});
