const gameCanvas = document.getElementById("gameCanvas");
const coordinatesDisplay = document.getElementById("coordinates");
const distanceDisplay = document.getElementById("distance");

const ctx = gameCanvas.getContext("2d");
gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;

const TARGET_LOCATION = { lat: 40.035841, lon: -105.250928 };
const ARRIVAL_THRESHOLD = 0.02;
let playerPosition = { lat: 0, lon: 0 };

function calculateDistance(pos1, pos2) {
    const R = 6371;
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const dLon = ((pos2.lon - pos1.lon) * Math.PI) / 180;
    const lat1 = (pos1.lat * Math.PI) / 180;
    const lat2 = (pos2.lat * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateBearing(pos1, pos2) {
    const lat1 = (pos1.lat * Math.PI) / 180;
    const lat2 = (pos2.lat * Math.PI) / 180;
    const dLon = ((pos2.lon - pos1.lon) * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
}

navigator.geolocation.watchPosition(
    (position) => {
        const { latitude, longitude } = position.coords;
        playerPosition = { lat: latitude, lon: longitude };
        const distance = calculateDistance(playerPosition, TARGET_LOCATION);

        coordinatesDisplay.textContent = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        distanceDisplay.textContent = `Distance: ${distance.toFixed(2)} km`;

        if (distance <= ARRIVAL_THRESHOLD) {
            alert("Congratulations! You've reached the target!");
        }

        drawCompass();
    },
    (error) => {
        console.error("Error getting position:", error.message);
    },
    { enableHighAccuracy: true }
);

function drawCompass() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    const bearing = calculateBearing(playerPosition, TARGET_LOCATION);

    ctx.save();
    ctx.translate(gameCanvas.width / 2, gameCanvas.height / 2);
    ctx.rotate((bearing * Math.PI) / 180);

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(20, 20);
    ctx.lineTo(-20, 20);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
        const videoElement = document.getElementById("camera");
        videoElement.srcObject = stream;
    })
    .catch((error) => {
        console.error("Camera error:", error);
    });
