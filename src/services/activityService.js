// services/activityService.js
import env from '../config/environment';

export const getActivityData = async (userId, userType = 'car_owner') => {
    try {
        console.log('Fetching activity data for:', { userId, userType });

        // Determine the correct payload structure based on user type
        const payload = userType === 'car_owner' || userType === 'Electric car owner'
            ? { car_owner_user_id: userId }
            : { charger_location_owner_user_id: userId };

        console.log('API payload:', payload);

        const response = await fetch(`${env.apiUrl}/get-activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Token': `${env.apiToken} `,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            body: JSON.stringify(payload),
        });

        console.log('Activity API response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Activity API response data:', data);

            // Handle different possible response structures
            const activityData = {
                totalPrice: Math.abs(data.total_price) || 0,
                numberBooking: data.Number_booking || data.number_booking || data.numberBooking || data.number_bookings || 0,
                numberLocations: data.Number_locations || data.number_locations || data.numberLocations || 0
            };

            console.log('Parsed activity data:', activityData);

            return {
                success: true,
                data: activityData
            };
        } else {
            const errorText = await response.text();
            console.error('Activity API error:', response.status, errorText);
            return { success: false, error: `API Error: ${response.status} - ${errorText}` };
        }
    } catch (error) {
        console.error('Activity fetch error:', error);
        return { success: false, error: error.message };
    };
};
