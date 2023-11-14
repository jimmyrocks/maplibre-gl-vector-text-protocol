import { addProtocols, addOptions } from "../dist/maplibre-gl-vector-text-protocol.es.js";
import { default as layerSelector } from "./layerSelector.js";


const map = new maplibregl.Map({
  container: 'map', // container id
  style: 'https://demotiles.maplibre.org/style.json', // style URL
  center: [-74.8306, 39.06], // starting position [lng, lat]
  zoom: 9 // starting zoom
});

// Add the sources for all the types
addProtocols(maplibregl);

// Use a prefix so the layer selector can find our layers
const layerIdPrefix = 'example-';

map.on('load', () => {

  // Add few sources and layers to show how each converter works

  // KML
  const kmlSourceName = 'cape-may-incorporated-place (kml)';
  const kmlLink = 'kml://./data/cape_may_incorporated_places.kml';
  map.addSource(kmlSourceName, {
    'type': 'geojson',
    'data': kmlLink,
  });
  map.addLayer({
    'id': layerIdPrefix + kmlSourceName,
    'type': 'fill',
    'source': kmlSourceName,
    'minzoom': 0,
    'maxzoom': 20,
    'paint': {
      'fill-opacity': 0.5,
      'fill-color': 'green',
      'fill-outline-color': 'gray'
    }
  });

  // TOPOJSON
  const topojsonSourceName = 'us-congress-113 (topojson)';
  const topojsonLink = 'topojson://https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/us-congress-113.json'
  map.addSource(topojsonSourceName, {
    'type': 'geojson',
    'data': topojsonLink,
  });
  map.addLayer({
    'id': layerIdPrefix + topojsonSourceName,
    'type': 'fill',
    'source': topojsonSourceName,
    'minzoom': 0,
    'maxzoom': 20,
    'paint': {
      'fill-opacity': 0.25,
      'fill-color': 'yellow',
      'fill-outline-color': 'gray'
    }
  });

  // OSM polygon (json)
  const osmSourceName = 'marsh (osm polygon json)';
  const osmLink = 'osm://https://www.openstreetmap.org/api/0.6/relation/5544086/full.json'
  map.addSource(osmSourceName, {
    'type': 'geojson',
    'data': osmLink,
  });
  map.addLayer({
    'id': layerIdPrefix + osmSourceName,
    'type': 'fill',
    'source': osmSourceName,
    'minzoom': 0,
    'maxzoom': 20,
    'paint': {
      'fill-opacity': 0.25,
      'fill-color': 'blue',
      'fill-outline-color': 'gray'
    }
  });

  // OSM line (xml)
  const osmLineSourceName = 'madison ave (osm line xml)';
  const osmLineLink = 'osm://https://www.openstreetmap.org/api/0.6/relation/968291/full'
  map.addSource(osmLineSourceName, {
    'type': 'geojson',
    'data': osmLineLink,
  });
  map.addLayer({
    'id': layerIdPrefix + osmLineSourceName,
    'type': 'line',
    'source': osmLineSourceName,
    'minzoom': 0,
    'maxzoom': 20,
    'paint': {
      'line-opacity': 0.4,
      'line-color': 'blue',
    }
  });

  // CSV
  const csvSourceName = 'restaurants (csv)';
  const csvLink = 'csv://./data/cape_may_restaurants.csv';
  map.addSource(csvSourceName, {
    'type': 'geojson',
    'data': csvLink,
  });
  map.addLayer({
    'id': layerIdPrefix + csvSourceName,
    'type': 'circle',
    'source': csvSourceName,
    'minzoom': 0,
    'maxzoom': 20,
    'paint': {
      'circle-color': 'orange',
      'circle-radius': 5,
      'circle-stroke-color': 'black'
    }
  });

  // GPX
  const gpxSourceName = 'beach ave (gpx)';
  const gpxLink = 'gpx://./data/beach_ave.gpx';
  map.addSource(gpxSourceName, {
    'type': 'geojson',
    'data': gpxLink,
  });
  map.addLayer({
    'id': layerIdPrefix + gpxSourceName,
    'type': 'line',
    'source': gpxSourceName,
    'minzoom': 0,
    'maxzoom': 20,
    'paint': {
      'line-color': 'red',
      'line-width': 5
    }
  });


  // Polyline
  const polylineSourceName = 'pittsburg ave (polyline)';
  const polylineProperties = {
    "@id": "way/11605426",
    "alt_name": "County Highway 622",
    "cycleway": "lane",
    "highway": "tertiary",
    "name": "Pittsburg Avenue",
  };
  const polylinePath = 'ymslF`cdhMSJcBv@}@`@QHcDzA{CpA}CvA{CtAcAd@KDo@ZyAp@GByCtAOFgCjAGBaBt@u@ZOHyCrAKFqCnAGB{CvAOFkClAgAd@OHKJKPIN';
  // Convert the string into a Blob
  const polylineBlob = new Blob([polylinePath], { type: 'text/plain' });

  // Create a data URL from the Blob
  const polylineURL = 'polyline://' + URL.createObjectURL(polylineBlob);
  console.log('s1', polylineBlob, polylineURL);
  /*addOptions(polylineURL, {
    polylineOptions: {
      properties: polylineProperties
    }
  });*/

  map.addSource(polylineSourceName, {
    'type': 'geojson',
    'data': polylineURL,
  });
  map.addLayer({
    'id': layerIdPrefix + polylineSourceName,
    'type': 'line',
    'source': polylineSourceName,
    'minzoom': 0,
    'maxzoom': 20,
    'paint': {
      'line-color': 'purple',
      'line-width': 5
    }
  });
});

// After the last frame rendered before the map enters an "idle" state,
//  add the toggle fields / layer selector
map.on('idle', () => {
  // Add the layer selector
  layerSelector(map, layerIdPrefix);
});
