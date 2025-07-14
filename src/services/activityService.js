// services/activityService.js
import env from '../config/environment';

export const getActivityData = async (userId, userType = 'car_owner') => {
    try {
        const payload = userType === 'car_owner'
            ? { car_charger_owner_user_id: userId }
            : { charger_location_user_id: userId };

        const response = await fetch(`${env.apiUrl}/get-activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.apiToken} `,
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                data: {
                    totalPrice: data.Total_price || 0,
                    numberBooking: data.Number_booking || 0,
                    numberLocations: data.Number_locations || 0
                }
            };
        } else {
            return { success: false, error: 'Failed to fetch activity data' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};
