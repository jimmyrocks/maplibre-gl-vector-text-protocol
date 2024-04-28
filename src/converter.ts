import { FeatureCollection, GeoJsonProperties, Geometry, LineString } from 'geojson';
import { Topology } from 'topojson-specification'
import * as csv2geojson from 'csv2geojson';
import { feature as topojsonFeature } from 'topojson-client';
import * as toGeoJson from '@tmcw/togeojson';
import { toGeoJSON as polylineToGeoJSON } from '@mapbox/polyline';
import osm2geojson from 'osm2geojson-lite';

export const supportedFormats = ['topojson', 'osm', 'kml', 'gpx', 'tcx', 'csv', 'tsv', 'polyline'] as const;
export type supportedFormatsType = typeof supportedFormats[number];

export type supportedOptions = {
    csvOptions?: csv2geojson.csvOptions,
    polylineOptions?: {
        precision?: number,
        properties?: GeoJsonProperties,
        type?: 'point' | 'line' | 'polygon'
    }
};

export class Converter {
    _conversionFn: () => Promise<FeatureCollection>;
    _rawData: string;
    _format: supportedFormatsType;
    _options: supportedOptions;

    constructor(format: supportedFormatsType, data: string, options: supportedOptions = {}) {
        this._rawData = data;
        this._format = format;
        this._options = options;

        const converters: { [key: string]: () => Promise<FeatureCollection> } = {
            'topojson': this.loadTopoJson,
            'osm': this.loadOsm,
            'kml': this.loadXml,
            'gpx': this.loadXml,
            'tcx': this.loadXml,
            'csv': this.loadCsv,
            'tsv': this.loadCsv,
            'polyline': this.loadPolyline
        };
        this._conversionFn = converters[format];

    }

    /**
     * Creates a blank GeoJSON feature collection.
     * @returns A new GeoJSON feature collection with no features.
     */
    blankGeoJSON: () => FeatureCollection = () => ({
        type: 'FeatureCollection',
        features: [],
    });

    async convert() {
        if (!this._conversionFn) {
            return new Promise((_, rej) => rej(`No converter exists for ${this._format}`));
        } else {
            return this._conversionFn();
        }
    }

    /**
     * Load the XML data as GeoJSON
     * @returns A promise resolving to a GeoJSON FeatureCollection
     */
    async loadXml(): Promise<FeatureCollection> {
        // Use the appropriate parser based on the format
        const geojson = (toGeoJson as any)[this._format](
            new DOMParser().parseFromString(this._rawData, "text/xml")
        );

        return geojson;
    }

    /**
     * Loads and parses CSV data into a GeoJSON FeatureCollection.
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    async loadCsv(): Promise<FeatureCollection> {
        // Define options for the csv2geojson library
        let options: csv2geojson.csvOptions = this._options.csvOptions || {}; // TODO allow CSV options

        if (this._format === 'tsv') {
            options.delimiter = '\t';
        }

        // Use the csv2geojson library to convert the CSV to GeoJSON
        const geojson = await new Promise<FeatureCollection>((resolve, reject) => {
            csv2geojson.csv2geojson(
                this._rawData,
                options,
                (err: string, data: FeatureCollection) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }
            );
        });

        return geojson;
    }

    /**
     * Loads TopoJSON data and converts it into a GeoJSON FeatureCollection
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    async loadTopoJson(): Promise<FeatureCollection> {

        type TopoJson = {
            type?: 'Topology';
            objects?: { [key: string]: Topology };
            arcs?: any;
        };
        let topoJsonData: TopoJson = {};

        try {
            topoJsonData = JSON.parse(this._rawData);
        } catch (e) {
            throw "Invalid TopoJson";
        }

        // Convert the data
        let result: FeatureCollection = this.blankGeoJSON();
        if (topoJsonData.type === "Topology" && topoJsonData.objects !== undefined) {
            result = {
                type: "FeatureCollection",
                features: result.features = Object.keys(topoJsonData.objects).map(key =>
                    topojsonFeature(topoJsonData as any, key)
                ).reduce((a: any[], v) => [...a, ...(v as any).features], [])
            };
        }
        return result;
    };

    /**
     * Loads OSM data and converts it into a GeoJSON FeatureCollection
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    async loadOsm(): Promise<FeatureCollection> {
        return osm2geojson(this._rawData) as FeatureCollection;
    }

    /**
     * Loads and parses Polyline data into a GeoJSON FeatureCollection.
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    async loadPolyline(): Promise<FeatureCollection> {
        let options = this._options.polylineOptions || {};

        // Use the @mapbox/polyline library to convert the polyline to GeoJSON
        const geojson = await new Promise<FeatureCollection>((resolve, reject) => {
            try {
                const lineString = polylineToGeoJSON(this._rawData, options.precision);
                let geometry: Geometry = lineString;

                if (options.type === 'point') {
                    if (lineString.coordinates.length === 1) {
                        // Make it a point
                        geometry = {
                            'type': 'Point',
                            'coordinates': lineString.coordinates[0]
                        }
                    } else {
                        console.warn('Cannot convert polyline to ' + options.type)
                    }
                } else if (options.type === 'polygon') {
                    if (
                        lineString.coordinates[0][0] === lineString.coordinates[lineString.coordinates.length - 1][0] &&
                        lineString.coordinates[0][1] === lineString.coordinates[lineString.coordinates.length - 1][1]) {
                        // Make it a polygon
                        geometry = {
                            'type': 'Polygon',
                            'coordinates': [lineString.coordinates]
                        }
                    } else {
                        console.warn('Cannot convert polyline to ' + options.type)
                    }
                }
                resolve({
                    type: "FeatureCollection",
                    features: [{
                        "type": "Feature",
                        "geometry": geometry,
                        "properties": options.properties || {}
                    }]
                });
            } catch (err) {
                reject(err)
            }
        });

        return geojson;
    }
}