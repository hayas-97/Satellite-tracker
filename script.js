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
    } catch (err) {
        console.error(err);
        alert("Failed to load tle.txt");
    }
}
loadSatellites();
