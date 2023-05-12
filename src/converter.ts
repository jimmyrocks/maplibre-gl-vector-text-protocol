import { FeatureCollection } from 'geojson';
import { Topology } from 'topojson-specification'
import * as csv2geojson from 'csv2geojson';
import { feature as topojsonFeature } from 'topojson-client';
import * as toGeoJson from '@tmcw/togeojson';
import osm2geojson from 'osm2geojson-lite';

export const supportedFormats = ['topojson', 'osm', 'kml', 'gpx', 'tcx', 'csv', 'tsv'] as const;
export type supportedFormatsType = typeof supportedFormats[number];


export class Converter {
    _conversionFn: () => Promise<FeatureCollection>;
    _rawData: string;
    _format: supportedFormatsType;

    constructor(format: supportedFormatsType, data: string) {
        this._rawData = data;
        this._format = format;

        const converters: { [key: string]: () => Promise<FeatureCollection> } = {
            'topojson': this.loadTopoJson,
            'osm': this.loadOsm,
            'kml': this.loadXml,
            'gpx': this.loadXml,
            'tcx': this.loadXml,
            'csv': this.loadCsv,
            'tsv': this.loadCsv
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
        let options: csv2geojson.csvOptions = {}; // TODO allow CSV options

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
     */
    async loadOsm(): Promise<FeatureCollection> {
        return osm2geojson(this._rawData) as FeatureCollection;
    }
}
