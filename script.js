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
        const lat = (Math.random() * 180) - 90;
        const lng = (Math.random() * 360) - 180;

        const marker = L.marker([lat, lng], { icon: satIcon })
            .addTo(map)
            .bindPopup(`<b>${sat.name}</b>`);

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
        },
        (error) => {
            document.getElementById("gpsStatus").textContent = error.message;
            alert("Unable to get your location.");
        }
    );
});
