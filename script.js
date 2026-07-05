let map;
let geojsonLayer;

const sampleStateData = {
    "California": { access: 72, mortality: 18, uninsured: 7 },
    "Texas": { access: 48, mortality: 32, uninsured: 18 },
    "Florida": { access: 55, mortality: 28, uninsured: 12 },
    "New York": { access: 76, mortality: 17, uninsured: 6 },
    "Illinois": { access: 68, mortality: 20, uninsured: 8 },
    "Georgia": { access: 42, mortality: 34, uninsured: 13 },
    "Alabama": { access: 35, mortality: 38, uninsured: 10 },
    "Mississippi": { access: 30, mortality: 43, uninsured: 12 },
    "Louisiana": { access: 34, mortality: 39, uninsured: 9 },
    "Washington": { access: 78, mortality: 15, uninsured: 5 },
    "Massachusetts": { access: 82, mortality: 12, uninsured: 3 },
    "Minnesota": { access: 80, mortality: 13, uninsured: 4 },
    "Arizona": { access: 52, mortality: 27, uninsured: 11 },
    "Colorado": { access: 74, mortality: 16, uninsured: 7 },
    "Oregon": { access: 73, mortality: 17, uninsured: 6 }
};

function getAccessColor(value) {
    if (value >= 75) return "#263f5c";
    if (value >= 60) return "#6f7e8f";
    if (value >= 45) return "#d6c07a";
    if (value >= 30) return "#d98256";
    return "#8f2f25";
}

function getStateName(feature) {
    return feature.properties.name || feature.properties.NAME || feature.properties.NAME_1;
}

function styleState(feature) {
    const name = getStateName(feature);
    const data = sampleStateData[name];
    const access = data ? data.access : 50;

    return {
        fillColor: getAccessColor(access),
        weight: 0.8,
        opacity: 1,
        color: "#ffffff",
        fillOpacity: 0.82
    };
}

function onEachState(feature, layer) {
    const name = getStateName(feature);
    const data = sampleStateData[name];

    layer.bindPopup(
        data
            ? `<strong>${name}</strong><br>
               Accessibility Index: ${data.access}/100<br>
               Maternal mortality: ${data.mortality}<br>
               Uninsured rate: ${data.uninsured}%`
            : `<strong>${name}</strong><br>Data placeholder`
    );

    layer.on({
        mouseover: event => {
            const target = event.target;

            target.setStyle({
                weight: 2,
                color: "#0b0b0b",
                fillOpacity: 0.95
            });

            const infoBox = document.getElementById("infoBox");

            infoBox.innerHTML = data
                ? `<strong>${name}</strong><br>
                   Accessibility Index: ${data.access}/100<br>
                   Maternal mortality: ${data.mortality}<br>
                   Uninsured rate: ${data.uninsured}%`
                : `<strong>${name}</strong><br>Data will be added in the next step.`;
        },

        mouseout: event => {
            geojsonLayer.resetStyle(event.target);

            document.getElementById("infoBox").innerHTML = `
                <strong>Interactive Map</strong><br>
                Hover over a state to explore indicators.
            `;
        }
    });
}

function initMap() {
    map = L.map("leafletMap", {
        zoomControl: true,
        scrollWheelZoom: false
    }).setView([39.5, -98.35], 4);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19
    }).addTo(map);

    fetch("data/us-states.geojson")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load data/us-states.geojson");
            }
            return response.json();
        })
        .then(geojson => {
            geojsonLayer = L.geoJson(geojson, {
                style: styleState,
                onEachFeature: onEachState
            }).addTo(map);

            map.fitBounds(geojsonLayer.getBounds(), {
                padding: [30, 30]
            });
        })
        .catch(error => {
            console.error(error);

            document.getElementById("infoBox").innerHTML = `
                <strong>Map data missing</strong><br>
                Add a US states GeoJSON file named:<br>
                <code>data/us-states.geojson</code>
            `;
        });
}

document.addEventListener("DOMContentLoaded", initMap);