import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";


export default function EndBookingScreen({ navigation, route }) {
    const { t } = useTranslation();

    const [reviewRate, setReviewRate] = useState(5);
    const [reviewMessage, setReviewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { booking, user, onBookingEnded } = route.params || {};

    const handleEndBooking = async () => {
        if (!reviewMessage.trim()) {
            Alert.alert(t('messages.reviewRequire'), t('messages.shareExperience'));
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/update-booking/${booking.booking_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,
                },
                body: JSON.stringify({
                    end_time: new Date().toISOString(),
                    review_rate: reviewRate,
                    review_message: reviewMessage,
                }),
            });

            if (response.ok) {
                Alert.alert(
                    t('messages.completeSession'),
                    t('messages.thankYou'),
                    [
                        {
                            text: t('messages.ok'),
                            onPress: () => {
                                if (onBookingEnded) {
                                    onBookingEnded();
                                }
                                navigation.goBack();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(t('messages.error'), t('messages.failEndingBooking'));
            }
        } catch (error) {
            Alert.alert(t('messages.NetError'), t('messages.checkConnection'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStarRating = () => {
        return (
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>{t('messages.rateExperience')}</Text>
                <Text style={styles.ratingSubtext}>{t('messages.help')}</Text>
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setReviewRate(star)}
                            style={styles.starButton}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons
                                name={star <= reviewRate ? "star" : "star-border"}
                                size={40}
                                color={star <= reviewRate ? "#FFD700" : "#ddd"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.ratingText}>
                    {reviewRate === 1 && "Poor"}
                    {reviewRate === 2 && "Fair"}
                    {reviewRate === 3 && "Good"}
                    {reviewRate === 4 && "Very Good"}
                    {reviewRate === 5 && "Excellent"}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="stop-circle" size={60} color="#fff" />
                    </View>
                    <FarsiText style={styles.title}>{t('messages.endSession')}</FarsiText>
                    <FarsiText style={styles.subtitle}>
                        {t('messages.completeAndShare')}
                    </FarsiText>
                </LinearGradient>

                <View style={styles.bookingInfoCard}>
                    <View style={styles.bookingHeader}>
                        <MaterialIcons name="confirmation-number" size={24} color="#667eea" />
                        <FarsiText style={styles.bookingTitle}>{t('messages.sessionDetail')}</FarsiText>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <MaterialIcons name="confirmation-number" size={20} color="#666" />
                            <View style={styles.infoContent}>
                                <FarsiText style={styles.infoLabel}>{t('messages.bookingId')}</FarsiText>
                                <Text style={styles.infoValue}>#{booking?.booking_id || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <MaterialIcons name="directions-car" size={20} color="#666" />
                            <View style={styles.infoContent}>
                                <FarsiText style={styles.infoLabel}>{t('messages.carId')}</FarsiText>
                                <Text style={styles.infoValue}>{booking?.car_id || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <MaterialIcons name="location-on" size={20} color="#666" />
                            <View style={styles.infoContent}>
                                <FarsiText style={styles.infoLabel}>{t('messages.locId')}</FarsiText>
                                <Text style={styles.infoValue}>{booking?.charging_location_id || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <MaterialIcons name="schedule" size={20} color="#666" />
                            <View style={styles.infoContent}>
                                <FarsiText style={styles.infoLabel}>{t('messages.started')}</FarsiText>
                                <Text style={styles.infoValue}>
                                    {booking?.start_time ? formatDate(booking.start_time) : 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {renderStarRating()}

                <View style={styles.reviewContainer}>
                    <FarsiText style={styles.reviewLabel}>{t('messages.shareExp')}</FarsiText>
                    <FarsiText style={styles.reviewSubtext}>
                        {t('messages.tellUs')}
                    </FarsiText>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="comment" size={20} color="#667eea" style={styles.inputIcon} />
                        <FarsiTextInput
                            style={styles.messageInput}
                            placeholder={t('messages.chargingQuestion')}
                            value={reviewMessage}
                            onChangeText={setReviewMessage}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.endButton, loading && styles.endButtonDisabled]}
                    onPress={handleEndBooking}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={loading ? ['#ccc', '#999'] : ['#ff6b6b', '#ee5a52']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons
                            name={loading ? "hourglass-empty" : "stop-circle"}
                            size={24}
                            color="#fff"
                        />
                        <FarsiText style={styles.buttonText}>
                            {loading ? t('messages.endingSession') : t('messages.endChargeSession')}
                        </FarsiText>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.noteContainer}>
                    <MaterialIcons name="info" size={20} color="#ff9800" />
                    <FarsiText style={styles.noteText}>
                        {t('messages.finalizeBooking')}
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
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
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
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    bookingInfoCard: {
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
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    bookingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    infoGrid: {
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    ratingContainer: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    ratingSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    starButton: {
        paddingHorizontal: 4,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#667eea',
    },
    reviewContainer: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    reviewLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    reviewSubtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    inputIcon: {
        marginTop: 2,
        marginRight: 12,
    },
    messageInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    endButton: {
        margin: 20,
        marginTop: 0,
        borderRadius: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    endButtonDisabled: {
        elevation: 2,
        shadowOpacity: 0.1,
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
        marginLeft: 12,
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
        fontSize: 14,
        color: '#856404',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
});
