function createEarthquakeLayer(earthquakeData) {
    return L.geoJson(earthquakeData, {
      pointToLayer: function (feature, latLong) {
        var color = deriveColor(feature.properties.mag.toFixed(3))
        var currentMarkerProperties = {
          radius: 5 * feature.properties.mag,
          fillColor: color,
          color: "black",
          weight: 1,
          fillOpacity: 0.7
        };
        return L.circleMarker(latLong, currentMarkerProperties);
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(createPopup(feature.properties));
      }
    });
  }
  
  function deriveColor(magnitude) {
    return magnitude >= 5 ? '#EF3E3E' :
    magnitude >= 4 ? '#EF863E' :
    magnitude >= 3 ? '#EFD93E' :
    magnitude >= 2 ? '#E2EF3E' :
    magnitude >= 1 ? '#BAEF3E' :
    magnitude >= 0 ? '#8FEF3E' :
    '#ffffff';
}

function createPopup(details) {
  return `
  <h4>${details.title}</h4>
  <b>Code: </b>${details.code}<br>  
  <b>Time: </b>${new Date(details.time).toLocaleString()}<br>
  <b>Magnitude: </b>${details.mag}<br>
  <a href="${details.url}" target="_blank">More details</a>
  `;
}

function addLegend(map) {
  var legend = L.control({
    position: 'bottomright'
  });
  legend.onAdd = function (map) {

    var div = L.DomUtil.create('legend', 'legend'),
      labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

    div.innerHTML += `<b> Magnitude</b><br>`;
    // loop through our density intervals and generate a label with a colored square for each interval  
    const totalLegends = 6
    for (var i = 0; i < totalLegends; i++) {
      div.innerHTML += '<div><i style="background:' + deriveColor(i) + '"> </i>' + labels[i] + '</div><br>';
    }
    return div;
  }
  legend.addTo(map);
}

function createFaultLineLayer(faultLineData) {
  const orangeColor = "#ffa500"
  return L.geoJson(faultLineData, {
    color: orangeColor
  });
}

function generateTileLayer(mapId) {
  const apiUrl = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}";
  return L.tileLayer(apiUrl, {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: mapId,
    accessToken: API_KEY
  });
}

function createMap(earthquakes, faultLines) {

  
  var baseMaps = {
    "Satellite": generateTileLayer("mapbox.satellite"),
    "GreyScale": generateTileLayer("mapbox.outdoors"),
    "Outdoors": generateTileLayer("mapbox.light")
  }

  
  var overlayMaps = {
    "Fault Line": faultLines,
    "Earthquakes": earthquakes
  }

 
  var defaultMap = L.map("map", {
    center: [0, 0],
    zoom: 3,
    layers: [baseMaps.Satellite, faultLines, earthquakes]
  });
  addLegend(defaultMap);

  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(defaultMap);
}

async function main() {
  var earthquakeData = await d3.json(DATA_URL);
  var earthquakes = createEarthquakeLayer(earthquakeData);

  var faultLineData = await d3.json(TECTONIC_PLATES_URL);
  var faultLines = createFaultLineLayer(faultLineData);

  createMap(earthquakes, faultLines)
}

main();