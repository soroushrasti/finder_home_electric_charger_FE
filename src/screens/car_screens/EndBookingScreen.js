import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import env from '../../config/environment';

export default function EndBookingScreen({ navigation, route }) {
    const [reviewRate, setReviewRate] = useState(5);
    const [reviewMessage, setReviewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { booking, user, onBookingEnded } = route.params || {};

    const handleEndBooking = async () => {
        if (!reviewMessage.trim()) {
            Alert.alert('Error', 'Please provide a review message');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/update-booking/${booking.booking_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    end_time: new Date().toISOString(),
                    review_rate: reviewRate,
                    review_message: reviewMessage,
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Booking ended successfully', [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (onBookingEnded) {
                                onBookingEnded();
                            }
                            navigation.goBack();
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', 'Failed to end booking');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const renderStarRating = () => {
        return (
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rate your experience:</Text>
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setReviewRate(star)}
                        >
                            <MaterialIcons
                                name={star <= reviewRate ? 'star' : 'star-border'}
                                size={32}
                                color={star <= reviewRate ? '#FFD700' : '#ccc'}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>End Booking</Text>

            <View style={styles.bookingInfo}>
                <Text style={styles.infoText}>Booking ID: {booking?.id}</Text>
                <Text style={styles.infoText}>Car: {booking?.car_model}</Text>
                <Text style={styles.infoText}>Started: {new Date(booking?.start_time).toLocaleString()}</Text>
            </View>

            {renderStarRating()}

            <Text style={styles.messageLabel}>Share your experience:</Text>
            <TextInput
                style={styles.messageInput}
                placeholder="Tell us about your charging experience..."
                value={reviewMessage}
                onChangeText={setReviewMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <Button
                title={loading ? "Ending Booking..." : "End Booking"}
                onPress={handleEndBooking}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    bookingInfo: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 4,
    },
    ratingContainer: {
        marginBottom: 20,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    messageLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        minHeight: 100,
    },
});
