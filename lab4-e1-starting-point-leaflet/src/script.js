// config map
let config = {
  minZoom: 2,
  maxZoom: 18
};
// magnification with which the map will start
const zoom = 4;
// co-ordinates
const lat = 37.8;
const lng = -96;

// calling map, "map-linked" is your map div's id
const map = L.map("map", config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
