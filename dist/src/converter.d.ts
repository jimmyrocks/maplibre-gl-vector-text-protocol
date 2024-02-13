/// <reference path="../../../../../src/custom.d.ts" />
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import * as csv2geojson from 'csv2geojson';
export declare const supportedFormats: readonly ["topojson", "osm", "kml", "gpx", "tcx", "csv", "tsv", "polyline"];
export type supportedFormatsType = typeof supportedFormats[number];
export type supportedOptions = {
    csvOptions?: csv2geojson.csvOptions;
    polylineOptions?: {
        precision?: number;
        properties?: GeoJsonProperties;
        type?: 'point' | 'line' | 'polygon';
    };
};
export declare class Converter {
    _conversionFn: () => Promise<FeatureCollection>;
    _rawData: string;
    _format: supportedFormatsType;
    _options: supportedOptions;
    constructor(format: supportedFormatsType, data: string, options?: supportedOptions);
    /**
     * Creates a blank GeoJSON feature collection.
     * @returns A new GeoJSON feature collection with no features.
     */
    blankGeoJSON: () => FeatureCollection;
    convert(): Promise<unknown>;
    /**
     * Load the XML data as GeoJSON
     * @returns A promise resolving to a GeoJSON FeatureCollection
     */
    loadXml(): Promise<FeatureCollection>;
    /**
     * Loads and parses CSV data into a GeoJSON FeatureCollection.
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    loadCsv(): Promise<FeatureCollection>;
    /**
     * Loads TopoJSON data and converts it into a GeoJSON FeatureCollection
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    loadTopoJson(): Promise<FeatureCollection>;
    /**
     * Loads OSM data and converts it into a GeoJSON FeatureCollection
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    loadOsm(): Promise<FeatureCollection>;
    /**
     * Loads and parses Polyline data into a GeoJSON FeatureCollection.
     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
     */
    loadPolyline(): Promise<FeatureCollection>;
}
