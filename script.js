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
