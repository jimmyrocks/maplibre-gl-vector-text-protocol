import { FeatureCollection } from 'geojson';
export declare const supportedFormats: readonly ["topojson", "kml", "gpx", "tcx", "csv", "tsv"];
export declare type supportedFormatsType = typeof supportedFormats[number];
export declare class Converter {
    blankGeoJSON: () => FeatureCollection;
    _conversionFn: () => Promise<FeatureCollection>;
    _rawData: string;
    _format: supportedFormatsType;
    constructor(format: supportedFormatsType, data: string);
    convert(): Promise<unknown>;
    loadXml: () => Promise<FeatureCollection>;
    loadCsv: () => Promise<FeatureCollection>;
    loadTopoJson: () => Promise<FeatureCollection>;
}
