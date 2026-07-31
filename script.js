/* ============================
   Satellite Tracker Pro V3
   Part 1 - Map Initialization
============================ */

// Create the map
const map = L.map("map", {
    zoomControl: true,
    worldCopyJump: true
}).setView([20, 0], 2);

// Dark map layer
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 19
}).addTo(map);

// Global variables
let userMarker = null;
let satelliteMarkers = [];
let selectedSatellite = null;

// Update zoom display
const zoomLevel = document.getElementById("zoomLevel");

map.on("zoomend", () => {
    zoomLevel.textContent = map.getZoom();
});
/* ============================
   Part 2 - User GPS Location
============================ */

const userIcon = L.divIcon({
    html: `<div style="
        width:16px;
        height:16px;
        background:#00ff88;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 12px #00ff88;
    "></div>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

function updateUserLocation(position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    document.getElementById("myLat").textContent = lat.toFixed(5);
    document.getElementById("myLon").textContent = lon.toFixed(5);
    document.getElementById("accuracy").textContent = accuracy.toFixed(1) + " m";
    document.getElementById("gpsStatus").textContent = "Connected";
    document.getElementById("gpsState").textContent = "Connected";

    if (!userMarker) {
        userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
    } else {
        userMarker.setLatLng([lat, lon]);
    }
}

function locationError() {
    document.getElementById("gpsStatus").textContent = "Permission Denied";
    document.getElementById("gpsState").textContent = "Disconnected";
}

navigator.geolocation.watchPosition(
    updateUserLocation,
    locationError,
    {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
    }
);
/* ============================
   Part 3 - Satellite Data
============================ */

const satellites = [
    {
        name: "ISS (ZARYA)",
        tle1: "1 25544U 98067A   26195.50000000  .00016717  00000+0  30289-3 0  9993",
        tle2: "2 25544  51.6417  81.5023 0004755  48.2007 311.9420 15.50032114502518"
    },
    {
        name: "Hubble Space Telescope",
        tle1: "1 20580U 90037B   26195.50000000  .00000850  00000+0  45000-4 0  9992",
        tle2: "2 20580  28.4698 145.2184 0002893  92.8164 267.3031 15.09211542432154"
    },
    {
        name: "NOAA 15",
        tle1: "1 25338U 98030A   26195.50000000  .00000091  00000+0  72283-4 0  9993",
        tle2: "2 25338  98.7238 208.3672 0011454 168.4832 191.6574 14.25906807399363"
    }
];

const satIcon = L.divIcon({
    html: '<div style="width:14px;height:14px;background:#ff3b30;border:3px solid white;border-radius:50%;"></div>',
    className: "",
    iconSize: [20,20],
    iconAnchor: [10,10]
});

document.getElementById("satCount").textContent = satellites.length;
/* ============================
   Part 4 - Create Satellite Markers
============================ */

function createSatelliteMarkers() {

    satellites.forEach((sat, index) => {

        const marker = L.marker([0, 0], {
            icon: satIcon
        }).addTo(map);

        marker.bindPopup(`<b>${sat.name}</b>`);

        marker.on("click", () => {
            selectedSatellite = index;
            document.getElementById("satName").textContent = sat.name;
        });

        satelliteMarkers.push(marker);

        const item = document.createElement("div");
        item.className = "satellite-item";
        item.textContent = sat.name;

        item.onclick = () => {
            map.setView(marker.getLatLng(), 4);
            marker.openPopup();
            selectedSatellite = index;
            document.getElementById("satName").textContent = sat.name;
        };

        document.getElementById("satelliteList").appendChild(item);

    });

}

createSatelliteMarkers();
/* ============================
   Part 5 - Live Satellite Tracking
============================ */

function updateSatellites() {

    const now = new Date();

    satellites.forEach((sat, index) => {

        const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);

        const positionVelocity = satellite.propagate(satrec, now);

        if (!positionVelocity.position) return;

        const gmst = satellite.gstime(now);

        const geo = satellite.eciToGeodetic(
            positionVelocity.position,
            gmst
        );

        const lat = satellite.degreesLat(geo.latitude);
        const lon = satellite.degreesLong(geo.longitude);
        const alt = geo.height;

        satelliteMarkers[index].setLatLng([lat, lon]);

        if (selectedSatellite === index) {

            document.getElementById("satLat").textContent = lat.toFixed(4) + "°";
            document.getElementById("satLon").textContent = lon.toFixed(4) + "°";
            document.getElementById("satAlt").textContent = alt.toFixed(2) + " km";

        }

    });

}

updateSatellites();
setInterval(updateSatellites, 1000);
/* ============================
   Part 6 - Search Satellites
============================ */

const searchBox = document.getElementById("searchBox");

searchBox.addEventListener("input", function () {

    const keyword = this.value.toLowerCase();

    const items = document.querySelectorAll(".satellite-item");

    items.forEach((item, index) => {

        if (satellites[index].name.toLowerCase().includes(keyword)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }

    });

});
/* ============================
   Part 7 - Favorites
============================ */

const favorites = [];

function toggleFavorite(index) {

    const name = satellites[index].name;

    if (favorites.includes(name)) {
        favorites.splice(favorites.indexOf(name), 1);
    } else {
        favorites.push(name);
    }

    updateFavorites();
}

function updateFavorites() {

    const list = document.getElementById("favoriteList");
    list.innerHTML = "";

    favorites.forEach(name => {

        const item = document.createElement("div");
        item.className = "satellite-item";
        item.textContent = "⭐ " + name;

        list.appendChild(item);

    });

}
/* ============================
   Part 8 - Live Clock
============================ */

function updateClock() {

    const now = new Date();

    document.getElementById("localTime").textContent =
        now.toLocaleTimeString();

    document.getElementById("utcTime").textContent =
        "UTC: " + now.toUTCString().split(" ")[4];

}

updateClock();
setInterval(updateClock, 1000);
/* ============================
   Part 9 - Control Buttons
============================ */

// Refresh
document.getElementById("refreshBtn").addEventListener("click", () => {
    updateSatellites();
});

// Full Screen
document.getElementById("fullscreenBtn").addEventListener("click", () => {

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }

});

// Dark / Light Theme
let darkMode = true;

document.getElementById("themeBtn").addEventListener("click", () => {

    darkMode = !darkMode;

    if (darkMode) {
        document.body.style.background = "#07131f";
        document.body.style.color = "#ffffff";
    } else {
        document.body.style.background = "#f5f5f5";
        document.body.style.color = "#000000";
    }

});
/* ============================
   Part 10 - Weather (Open-Meteo)
============================ */

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

    } catch (error) {
        console.error("Weather Error:", error);
    }

}

// Update weather whenever GPS location changes
navigator.geolocation.getCurrentPosition((position) => {
    updateWeather(
        position.coords.latitude,
        position.coords.longitude
    );
});
/* ============================
   Part 11 - Startup & Loading
============================ */

// Hide loading screen after page loads
window.addEventListener("load", () => {

    setTimeout(() => {

        const loading = document.getElementById("loading-screen");

        if (loading) {
            loading.style.display = "none";
        }

        document.getElementById("trackerStatus").textContent = "Online";

    }, 1200);

});

// Keep map size correct after resize
window.addEventListener("resize", () => {
    map.invalidateSize();
});

// Update status every minute
setInterval(() => {
    document.getElementById("trackerStatus").textContent = "Tracking";
}, 60000);
/* ============================
   Part 12 - Final Setup
============================ */

// Locate Me button
document.getElementById("locateBtn").addEventListener("click", () => {

    if (userMarker) {
        map.setView(userMarker.getLatLng(), 8);
    } else {
        alert("Your location is not available yet.");
    }

});

// Hide Leaflet attribution (optional)
const attribution = document.querySelector(".leaflet-control-attribution");
if (attribution) {
    attribution.style.display = "none";
}

// Final initialization
console.log("🚀 Satellite Tracker Pro V3 Loaded Successfully!");

document.getElementById("trackerStatus").textContent = "Ready";

// Force map refresh
setTimeout(() => {
    map.invalidateSize();
}, 500);
window.onload = () => {
    const loading = document.getElementById("loading-screen");
    if (loading) loading.style.display = "none";
};
