// HTML Elements
const gameCanvas = document.getElementById("gameCanvas");
const coordinatesDisplay = document.getElementById("coordinates");
const distanceDisplay = document.getElementById("distance");

// Set up canvas
const ctx = gameCanvas.getContext("2d");
gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;

// Target location
const TARGET_LOCATION = { lat: 40.035841, lon: -105.250928 }; // Example: Boulder, CO
const ARRIVAL_THRESHOLD = 0.02; // 20 meters in kilometers
let playerPosition = { lat: 0, lon: 0 };

// Calculate distance using the Haversine formula
function calculateDistance(pos1, pos2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const dLon = ((pos2.lon - pos1.lon) * Math.PI) / 180;
    const lat1 = (pos1.lat * Math.PI) / 180;
    const lat2 = (pos2.lat * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Calculate bearing between two points
function calculateBearing(pos1, pos2) {
    const lat1 = (pos1.lat * Math.PI) / 180;
    const lat2 = (pos2.lat * Math.PI) / 180;
    const dLon = ((pos2.lon - pos1.lon) * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
}

// Watch for GPS updates
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            playerPosition = { lat: latitude, lon: longitude };
            const distance = calculateDistance(playerPosition, TARGET_LOCATION);

            // Update UI
            coordinatesDisplay.textContent = `GPS: ${latitude.toFixed(
                6
            )}, ${longitude.toFixed(6)}`;
            distanceDisplay.textContent = `Distance: ${distance.toFixed(2)} km`;

            // Check if target reached
            if (distance <= ARRIVAL_THRESHOLD) {
                alert("Congratulations! You've reached the target!");
            }

            // Update game elements
            drawCompass();
        },
        (error) => {
            console.error("Error getting position:", error.message);
        },
        { enableHighAccuracy: true }
    );
} else {
    alert("Geolocation is not supported by your browser.");
}

// Draw compass arrow
function drawCompass() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    const bearing = calculateBearing(playerPosition, TARGET_LOCATION);

    // Save the canvas state
    ctx.save();

    // Translate to the center of the canvas
    ctx.translate(gameCanvas.width / 2, 100);

    // Rotate the canvas according to the bearing
    ctx.rotate((bearing * Math.PI) / 180);

    // Draw the arrow
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(0, -50); // Arrow tip
    ctx.lineTo(20, 20); // Right corner
    ctx.lineTo(-20, 20); // Left corner
    ctx.closePath();
    ctx.fill();

    // Restore the canvas state
    ctx.restore();
}

// Access the camera
navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
        const videoElement = document.getElementById("camera");
        videoElement.srcObject = stream;
    })
    .catch((error) => {
        console.error("Error accessing camera:", error);
    });
