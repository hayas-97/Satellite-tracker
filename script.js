// ===============================
// Satellite Tracker Pro
// ===============================

// Create the map
const map = L.map("map").setView([20, 0], 3);

// OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// Global variables
let satellites = [];
let satelliteMarkers = [];
let userMarker = null;
let userLat = null;
let userLon = null;
let selectedSatellite = null;
// Zoom level display
const zoomLevel = document.getElementById("zoomLevel");

map.on("zoomend", () => {
    if (zoomLevel) {
        zoomLevel.textContent = map.getZoom();
    }
});

// Satellite icon
const satIcon = L.divIcon({
    html: '<div style="width:14px;height:14px;background:#ff3b30;border:3px solid white;border-radius:50%;"></div>',
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});
// Load satellites from tle.txt
async function loadSatellites() {
    try {
        const response = await fetch("./tle.txt");

        if (!response.ok) {
            throw new Error("Unable to load tle.txt");
        }

        const text = await response.text();
        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        satellites = [];

        for (let i = 0; i < lines.length; i += 3) {
            satellites.push({
                name: lines[i],
                tle1: lines[i + 1],
                tle2: lines[i + 2]
            });
        }

        const count = document.getElementById("satCount");
        if (count) count.textContent = satellites.length;

        console.log("Loaded", satellites.length, "satellites");
        createSatelliteMarkers();
const satelliteList = document.getElementById("satelliteList");

if (satelliteList) {
    satelliteList.innerHTML = "";

    satellites.forEach((sat, index) => {
        const item = document.createElement("div");
        item.className = "sat-item";
        item.textContent = sat.name;

        item.onclick = () => {

    if (satelliteMarkers[index]) {
        satelliteMarkers[index].openPopup();
        map.setView(satelliteMarkers[index].getLatLng(), 5);
    }
};

        satelliteList.appendChild(item);
    });
}
const loadingScreen = document.getElementById("loading-screen");
if (loadingScreen) {
    loadingScreen.style.display = "none";
    }
    } catch (err) {
        console.error(err);
        alert("Failed to load tle.txt");
    }
}
function createSatelliteMarkers() {
    satelliteMarkers.forEach(marker => map.removeLayer(marker));
    satelliteMarkers = [];

    satellites.forEach(sat => {
        const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);

const positionAndVelocity = satellite.propagate(satrec, new Date());
const position = positionAndVelocity.position;
const velocity = positionAndVelocity.velocity;
if (!positionAndVelocity.position) return;

const gmst = satellite.gstime(new Date());

const geo = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

const lat = satellite.degreesLat(geo.latitude);
const lng = satellite.degreesLong(geo.longitude);

        const marker = L.marker([lat, lng], { icon: satIcon })
    .addTo(map)
    .bindPopup(`<b>${sat.name}</b>`);

marker.on("click", () => {
    document.getElementById("satName").textContent = sat.name;
    document.getElementById("satLat").textContent = lat.toFixed(4) + "°";
    document.getElementById("satLon").textContent = lng.toFixed(4) + "°";
    const altitude = Math.sqrt(
    position.x * position.x +
    position.y * position.y +
    position.z * position.z
) - 6371;

const speed = Math.sqrt(
    velocity.x * velocity.x +
    velocity.y * velocity.y +
    velocity.z * velocity.z
);

document.getElementById("satAlt").textContent =
    altitude.toFixed(2) + " km";

document.getElementById("satSpeed").textContent =
    speed.toFixed(2) + " km/s";
    if (userLat !== null && userLon !== null) {
    const distance = map.distance(
        [userLat, userLon],
        [lat, lng]
    ) / 1000;

    document.getElementById("satDistance").textContent =
        distance.toFixed(2) + " km";
} else {
    document.getElementById("satDistance").textContent =
        "Enable GPS";
    }
});

satelliteMarkers.push(marker);
    });
}
loadSatellites();
document.getElementById("locateBtn").addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }

    document.getElementById("gpsStatus").textContent = "Getting location...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            userLat = lat;
            userLon = lon;

            document.getElementById("myLat").textContent = lat.toFixed(6);
            document.getElementById("myLon").textContent = lon.toFixed(6);
            document.getElementById("accuracy").textContent =
                position.coords.accuracy.toFixed(1) + " m";
            document.getElementById("gpsStatus").textContent = "Connected";

            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([lat, lon]).addTo(map);
            userMarker.bindPopup("📍 Your Location").openPopup();

            map.setView([lat, lon], 12);
            updateWeather(lat, lon);
        },
        (error) => {
            document.getElementById("gpsStatus").textContent = error.message;
            alert("Unable to get your location.")
        }
    );
});
function updateClock() {
    const now = new Date();

    document.getElementById("localTime").textContent =
        now.toLocaleTimeString();

    document.getElementById("utcTime").textContent =
        "UTC: " + now.toUTCString().split(" ")[4];
}

updateClock();
setInterval(updateClock, 1000);
async function updateWeather(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
        );

        const data = await response.json();

        document.getElementById("weatherLocation").textContent =
            lat.toFixed(2) + ", " + lon.toFixed(2);

        document.getElementById("temperature").textContent =
            data.current.temperature_2m + " °C";

        document.getElementById("humidity").textContent =
            data.current.relative_humidity_2m + " %";

        document.getElementById("windSpeed").textContent =
            data.current.wind_speed_10m + " km/h";

        document.getElementById("weatherCondition").textContent =
            "Live Weather";
    } catch (err) {
        console.error(err);
    }
}
setInterval(() => {
    createSatelliteMarkers();
}, 5000);
// ===== Tracker AI =====

const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");
const sendAI = document.getElementById("sendAI");

sendAI.addEventListener("click", sendMessage);

aiInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function addMessage(sender, text) {
    aiMessages.innerHTML += `
        <div class="ai-message">
            <strong>${sender}:</strong> ${text}
        </div>
    `;

    aiMessages.scrollTop = aiMessages.scrollHeight;
}

function sendMessage() {
    const question = aiInput.value.trim();

    if (question === "") return;

    addMessage("You", question);

    aiInput.value = "";

    addMessage("Tracker AI", "Thinking...");
}
