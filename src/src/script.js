mapboxgl.accessToken = 'pk.eyJ1IjoiZmlzaGVyMDEyMSIsImEiOiJjbTV3dG10enYwMXlhMmtzZGlqNzByNGljIn0.iiFQCsh4te_fC7eTCcOYvQ';

window.map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-0.1278, 51.5074],
    zoom: 11,
    pitch: 45,
    bearing: -17.6
});

map.on('load', async function () {
    console.log("✔ The map is loaded");

map.addControl(new mapboxgl.NavigationControl(), 'top-right');

map.addControl(new mapboxgl.ScaleControl({ maxWidth: 200, unit: 'metric' }), 'top-left');

    try {
        const railwayResponse = await fetch('https://raw.githubusercontent.com/Fisher0121/geojson/cc48829af5fb31ff9b10f8c2c20f49533f233f98/export1.geojson');
        const railwayData = await railwayResponse.json();

        map.addSource('railway-lines', { type: 'geojson', data: railwayData });

        map.addLayer({
            id: 'railway-line-layer',
            type: 'line',
            source: 'railway-lines',
            layout: { 'visibility': 'visible' },
            paint: {
                'line-width': 3,
                'line-color': '#FF0000',
                'line-opacity': 0.8
            }
        });

        console.log("✔ The railway data was loaded successfully");
    } catch (error) {
        console.error("❌ Failure to load railway:", error);
    }

    try {
        const stationResponse = await fetch('https://gist.githubusercontent.com/Fisher0121/949ed5b3d0f7860b9ce76b3afb66a6f8/raw/da67b810ba33898bea324dd2867937f1d858d8bf/gistfile1.txt');
        const stationData = await stationResponse.json();

        map.addSource('stations', { type: 'geojson', data: stationData });

        map.addLayer({
            id: 'stations-layer',
            type: 'circle',
            source: 'stations',
            paint: {
                'circle-radius': 6,
                'circle-color': '#007bff',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        });

        console.log("✔ The subway station data was loaded successfully");
    } catch (error) {
        console.error("❌ Failure to load subway station:", error);
    }

    try {
        const poiResponse = await fetch('https://gist.githubusercontent.com/Fisher0121/29aea09826f57f6afa5daed94464a5c1/raw/3bf53da7602aaefb71b2ec76aec914899d86da56/gistfile1.txt');
        let poiData = await poiResponse.json();

const validTypes = new Set([
    'restaurant', 'cafe', 'supermarket', 'bakery', 'butcher', 'convenience'
]);

poiData.features = poiData.features.filter(f => 
    f.properties && f.properties.type && f.properties.type.trim() !== "" && validTypes.has(f.properties.type)
);

        console.log("All POI types: ", [...new Set(poiData.features.map(f => f.properties.type))]);

        map.addSource('nearby-pois', { type: 'geojson', data: poiData });

     map.addLayer({
    id: 'poi-layer',
    type: 'circle',
    source: 'nearby-pois',
    layout: { 'visibility': 'visible' },
    paint: {
        'circle-radius': 6,
        'circle-color': [
            'match',
            ['get', 'type'],
            'restaurant', '#FF4500',
            'cafe', '#FFD700',
            'supermarket', '#32CD32',
            'bakery', '#32CD32',
            'butcher', '#32CD32',
            'convenience', '#32CD32',
            'rgba(0,0,0,0)' 
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff'
    }
});

        console.log("✔ POI data loaded successfully");

        updatePOIFilter();

    } catch (error) {
        console.error("❌ Failed to load the POI:", error);
    }
});

document.querySelectorAll('#filter-container input').forEach(checkbox => {
    checkbox.checked = true; 
    checkbox.addEventListener('change', updatePOIFilter);
});


function getSelectedPOITypes() {
    let selectedTypes = [];
    if (document.getElementById('toggleRestaurants')?.checked) {
        selectedTypes.push('restaurant');
    }
    if (document.getElementById('toggleCafes')?.checked) {
        selectedTypes.push('cafe');
    }
    if (document.getElementById('toggleShops')?.checked) {
        selectedTypes.push('supermarket', 'bakery', 'butcher', 'convenience');
    }
    return selectedTypes;
}


function updatePOIFilter() {
    if (!map.getLayer('poi-layer')) return; 

    const selectedTypes = getSelectedPOITypes();
    if (selectedTypes.length === 0) {
        map.setLayoutProperty('poi-layer', 'visibility', 'none');
    } else {
        map.setLayoutProperty('poi-layer', 'visibility', 'visible');
        map.setFilter('poi-layer', ['in', 'type', ...selectedTypes]);
    }
}


window.searchLocation = function () {
    const query = document.getElementById('searchBox').value.trim().toLowerCase();
    if (!query) return;

    const features = map.queryRenderedFeatures({ layers: ['stations-layer', 'poi-layer'] })
        .filter(f => f.properties.name && f.properties.name.toLowerCase().includes(query));

    if (features.length > 0) {
        const feature = features[0];
        map.flyTo({ center: feature.geometry.coordinates, zoom: 14 });

        new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML(`<b>📍 ${feature.properties.name}</b>`)
            .addTo(map);
    }
};


map.on('click', 'stations-layer', function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const stationName = e.features[0].properties.name || 'Unnamed Station';

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<b>🚇 ${stationName}</b>`)
        .addTo(map);
});


map.on('click', 'poi-layer', async function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const poiName = e.features[0].properties.name || 'Unnamed';

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<b>📍 ${poiName}</b>`)
        .addTo(map);
});
map.on('click', 'poi-layer', async function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const poiName = e.features[0].properties.name || 'Unnamed';

    try {
        
        const response = await fetch(`http://localhost:3000/place?place=${encodeURIComponent(poiName)}`);
        const googleData = await response.json();

        console.log("Google API returns:", googleData); 

        let ratingText = googleData.rating ? `⭐ Rating: ${googleData.rating}` : "No rating available";
        let photoHtml = googleData.photo ? `<img src="${googleData.photo}" width="250px" style="border-radius: 10px;">` : "<p>No photo available</p>";

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <div style="text-align:center; font-family:sans-serif;">
                    <h2>📍 ${poiName}</h2>
                    <h3>${ratingText}</h3>
                    ${photoHtml}
                </div>
            `)
            .addTo(map);
    } catch (error) {
        console.error('❌ Google score failed to load:', error);
    }
});

