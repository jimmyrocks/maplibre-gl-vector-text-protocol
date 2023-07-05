# maplibre-gl-vector-text-protocol
Supports geospatial text based vector data using [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) in v1.15.0 or later.

It makes use of the [addProtocol](https://github.com/maplibre/maplibre-gl-js/pull/30) functionality that was added in version [1.15.0](https://github.com/maplibre/maplibre-gl-js/releases/tag/v1.15.0).

It can be used with Mapbox GL JS 1.x.x using the [mapbox-gl-custom-protocol](https://www.github.com/jimmyrocks/mapbox-gl-custom-protocol) library. I haven't tested it with Mapbox GL JS 2+.

Web workers are used to convert `CSV`, `TSV`, `Topojson`, and `OSM` formats. `KML`, `GPX`, and `TCX` formats are based on XML and use the [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser), which isn't available to web workers, so they are converted to GeoJSON in the main thread.

## Supported Formats 🗎
* [`Topojson`](https://en.wikipedia.org/wiki/GeoJSON#TopoJSON) - A more compact JSON based format than [GeoJSON](https://en.wikipedia.org/wiki/GeoJSON) that takes advantage of shared **topo**logies.
* [`OSM`](https://wiki.openstreetmap.org/wiki/OSM_JSON) - Open Street Map json/xml.
* [`KML`](https://en.wikipedia.org/wiki/Keyhole_Markup_Language) - **K**eyhole **M**arkup **L**anguage, popularized by [Google Earth](https://en.wikipedia.org/wiki/Google_Earth).
* [`GPX`](https://en.wikipedia.org/wiki/GPS_Exchange_Format) - **GP**S E**x**change Format - A common XML-based format used by may GPS devices.
* [`TCX`](https://en.wikipedia.org/wiki/Training_Center_XML) - **T**raining **C**enter **X**ML - An XML-based format used by various Garmin devices and applications (e.g. [Garmin Connect](https://connect.garmin.com)).
* [`CSV`](https://en.wikipedia.org/wiki/Comma-separated_values) - **C**omma-**S**eparated **V**alues, the old reliable of data formats. No options are exposed, Latitude fields must start with "lat" and Longitude fields must start with "lon" or "lng". Will also work with bar (|) and tab (\t) separated values.
* [`TSV`](https://en.wikipedia.org/wiki/Tab-separated_values) - **T**ab-**S**eparated **V**alue - Same as CSV, but it forces the delimiter to be a tab character (\t).

## Objective ✨
The [`addProtocol`](https://github.com/maplibre/maplibre-gl-js/blob/492bec58c5684609af8fba81ef01e5f5a3ef0711/src/index.js#L177) feature makes it extremely easy to extend the existing functionality of MapLibre sources without creating a new source type using the [addSourceType](https://github.com/maplibre/maplibre-gl-js/blob/d375def728d23b9d443a4dcaab0fd06df912223e/src/ui/map.ts#L1583) feature. This makes it very easy to support all kinds of new things in MapLibre. 

## Inspiration 💡
I have worked on many projects where users want to add their own data to a map, but their data is rarely in the right format. This library makes it as easy as adding a `csv://` before the file path to bring a csv file in.

There are a lot of [Geospatial File Formats](https://en.wikipedia.org/wiki/GIS_file_formats#Vector) out there, this library is intended to serve the most common formats (CSV, KML, GPX, Topojson, OSM) without creating a huge library. There are other formats I would like to support, but they will be available in different libraries.

## External Libraries 📚
This project would not be possible if it weren't for three core libraries that drive it:
* `@tmcw/togeojson` - Supported by [placemark.io](https:placemark.io) - `KML`, `GPX`, `TCX` support
* `csv2geojson` - Supported by [Mapbox](https://mapbox.com) - `CSV`, `TSV` support
* `topojson-client` - From [Mike Bostock](https://github.com/mbostock) - `Topojson` support
* `osm2geojson-lite` - From [tibetty](https://github.com/tibetty/osm2geojson-lite) - `osm2geojson-lite` support

I'd also like to thank the Mapbox🚀 and MapLibre teams for creating such a great project that is easily extendable.

## Usage 🛠️

```javascript
<script src="https://loc8.us/maplibre-gl-vector-text-protocol/dist/maplibre-gl-vector-text-protocol.js"></script>

// Add all types
VectorTextProtocol.addProtocols(maplibregl);

// Individual protocols can be added as well
maplibregl.addProtocol('csv', VectorTextProtocol);
maplibregl.addProtocol('kml', VectorTextProtocol);
```

## Examples ⚙️
* [KML, CSV, TOPOJSON, GPX (using Modules)](https://loc8.us/maplibre-gl-vector-text-protocol/examples/index.html)
* [TOPOJSON (using UMD)](https://loc8.us/maplibre-gl-vector-text-protocol/examples/umd.html) 
### Codepen
* [TOPOJSON](https://codepen.io/jimmyrocks/pen/ExbPXZP)
