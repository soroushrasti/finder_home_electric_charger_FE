import env from '../config/environment';

class ChargingLocationService {
    constructor() {
        this.baseUrl = env.apiUrl;
        this.headers = {
            'Content-Type': 'application/json',
            'X-API-Token': env.apiToken,
        };
    }

    // Find nearby public chargers within specified distance
    async findNearbyPublicChargers(lat, lon, distanceKm = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/public-chargers/nearby`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    lat: parseFloat(lat),
                    lon: parseFloat(lon),
                    distance_km: distanceKm
                })
            });
            console.log("Fetch nearby chargers response:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.formatPublicChargers(data);
        } catch (error) {
            console.error('Error fetching nearby public chargers:', error);
            throw error;
        }
    }

    // Find public chargers in bounding box
    async findPublicChargersInBounds(north, south, east, west) {
        try {
            const response = await fetch(`${this.baseUrl}/public-chargers/bbox`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    north: parseFloat(north),
                    south: parseFloat(south),
                    east: parseFloat(east),
                    west: parseFloat(west)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.formatPublicChargers(data);
        } catch (error) {
            console.error('Error fetching public chargers in bounds:', error);
            throw error;
        }
    }

    // Find nearby user charging locations
    async findNearbyUserLocations(lat, lon, distanceKm = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/user-charging-locations/nearby`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    lat: parseFloat(lat),
                    lon: parseFloat(lon),
                    distance_km: distanceKm
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.formatUserLocations(data);
        } catch (error) {
            console.error('Error fetching nearby user locations:', error);
            throw error;
        }
    }

    // Find user charging locations in bounding box
    async findUserLocationsInBounds(north, south, east, west) {
        try {
            const response = await fetch(`${this.baseUrl}/user-charging-locations/bbox`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    north: parseFloat(north),
                    south: parseFloat(south),
                    east: parseFloat(east),
                    west: parseFloat(west)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.formatUserLocations(data);
        } catch (error) {
            console.error('Error fetching user locations in bounds:', error);
            throw error;
        }
    }

    // Get combined charging locations (both public and user)
    async getCombinedChargingLocations(lat, lon, distanceKm = 10, showPublic = true, showUser = true) {
        try {
            const promises = [];

            if (showPublic) {
                console.log("Fetching public chargers");
                promises.push(this.findNearbyPublicChargers(lat, lon, distanceKm));
            }

            if (showUser) {
                console.log("Fetching user locations");
                promises.push(this.findNearbyUserLocations(lat, lon, distanceKm));
            }

            const results = await Promise.allSettled(promises);
            let publicChargers = [];
            let userLocations = [];
            console.log("Geo reuslts:", results);

            if (showPublic && results[0]?.status === 'fulfilled') {
                publicChargers = results[0].value;
            }

            const userIndex = showPublic ? 1 : 0;
            if (showUser && results[userIndex]?.status === 'fulfilled') {
                userLocations = results[userIndex].value;
            }

            return {
                publicChargers,
                userLocations,
                total: publicChargers.length + userLocations.length
            };
        } catch (error) {
            console.error('Error fetching combined charging locations:', error);
            throw error;
        }
    }

    // Fetch primary (user's own) charging location(s) first view
    async getUserPrimaryChargingLocation(searchCriteria = {}) {
        try {
                const body = {
                    country: searchCriteria.country,
                    city: searchCriteria.city ? searchCriteria.city : undefined,
                };
                let response = await fetch(`${this.baseUrl}/find-charging-location`, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(body)
                });

            if(response.status === 404){
                return []; // endpoint not available
            }
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const arr = Array.isArray(data) ? data : (data ? [data] : []);
            return this.formatUserLocations(arr);
        } catch (error) {
            // Downgrade log severity for primary fetch
            console.log('Primary charging location not available:', error.message);
            return [];
        }
    }

    // Format public charger data for map display
    formatPublicChargers(chargers) {
        return chargers.map((charger, idx) => {
            // Accept either flat latitude/longitude or nested coordinate
            const latRaw = charger.latitude ?? charger.lat ?? charger?.coordinate?.latitude;
            const lngRaw = charger.longitude ?? charger.lon ?? charger?.coordinate?.longitude;
            const lat = parseFloat(latRaw);
            const lng = parseFloat(lngRaw);
            const idFallback = charger.id || charger.charging_location_id || charger.location_id || charger.name || `${lat}_${lng}_${idx}`;
            return {
                id: idFallback,
                type: 'public',
                title: charger.name,
                subtitle: `${charger.power_kw || 'Unknown'}kW · ${charger.operator || 'Operator'}`,
                description: charger.address,
                coordinate: { latitude: lat, longitude: lng },
                latitude: lat,
                longitude: lng,
                address: charger.address,
                city: charger.city,
                country: charger.country,
                powerKw: charger.power_kw,
                connectors: JSON.parse(charger.connectors || '[]'),
                operator: charger.operator,
                isActive: charger.is_active !== false,
                hasAccommodation: charger.has_accommodation || false,
                markerColor: '#FF6B6B',
                markerIcon: 'ev-station'
            };
        }).filter(c => !isNaN(c.latitude) && !isNaN(c.longitude));
    }

    // Format user location data for map display
    formatUserLocations(locations) {
        return locations.map((location, idx) => {
            const latRaw = location.latitude ?? location.lat ?? location?.coordinate?.latitude;
            const lngRaw = location.longitude ?? location.lon ?? location?.coordinate?.longitude;
            const lat = parseFloat(latRaw);
            const lng = parseFloat(lngRaw);
            const idFallback = location.id || location.charging_location_id || location.location_id || location.name || `${lat}_${lng}_${idx}`;
            return {
                id: idFallback,
                type: 'user',
                title: location.name || location.title,
                subtitle: `${location.power_kw || 'Unknown'}kW • Private`,
                description: location.address || location.description,
                coordinate: { latitude: lat, longitude: lng },
                latitude: lat,
                longitude: lng,
                address: location.address,
                city: location.city,
                country: location.country,
                powerKw: location.power_kw,
                connectors: JSON.parse(location.connectors || '[]'),
                operator: 'Private Owner',
                isActive: location.is_active !== false,
                hasAccommodation: location.has_accommodation || false,
                markerColor: '#4ECDC4',
                markerIcon: 'home',
                isUserLocation: true
            };
        }).filter(c => !isNaN(c.latitude) && !isNaN(c.longitude));
    }

    // Geocoding service to get coordinates from address
    async geocodeAddress(address, city, country) {
        try {
            // This is a placeholder for geocoding service
            // You can integrate with Google Maps Geocoding, OpenStreetMap Nominatim, etc.
            const query = encodeURIComponent(`${address}, ${city}, ${country}`);

            // Example using a free geocoding service (replace with your preferred service)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
            );

            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }

            return null;
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    }

    // Calculate distance between two coordinates
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in kilometers
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}

export default new ChargingLocationService();
