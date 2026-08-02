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
