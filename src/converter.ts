import { FeatureCollection } from 'geojson';
import { Topology } from 'topojson-specification'
import * as csv2geojson /*{, csvOptions }*/ from 'csv2geojson';
import { feature as topojsonFeature } from 'topojson-client';
import * as toGeoJson  from '@tmcw/togeojson';

export const supportedFormats = ['topojson', 'kml', 'gpx', 'tcx', 'csv', 'tsv'] as const;
export type supportedFormatsType = typeof supportedFormats[number];

export class Converter {
    blankGeoJSON: () => FeatureCollection = () => ({
        'type': 'FeatureCollection',
        'features': []
    });
 
    _conversionFn: () => Promise<FeatureCollection>;
    _rawData: string;
    _format: supportedFormatsType;

    constructor(format: supportedFormatsType, data: string) {
        this._rawData = data;
        this._format = format;

        const converters: { [key: string]: () => Promise<FeatureCollection> } = {
            'topojson': this.loadTopoJson,
            'kml': this.loadXml,
            'gpx': this.loadXml,
            'tcx': this.loadXml,
            'csv': this.loadCsv,
            'tsv': this.loadCsv
        };
        this._conversionFn = converters[format];

    }

    async convert() {
        if (!this._conversionFn) {
            return new Promise((_, rej) => rej(`No converter exists for ${this._format}`));
        } else {
            return this._conversionFn();
        }
    }

    loadXml = async (): Promise<FeatureCollection> => {

        /*const formats:{[key: string]: (doc: Document) => FeatureCollection} = {
            'kml': kml,
            'gpx': gpx,
            //'tcx': tcx
        };*/

        const geojson = (toGeoJson as any)[this._format](
            new DOMParser().parseFromString(this._rawData, "text/xml")
        );
    
        return geojson;
    };

    loadCsv = async (): Promise<FeatureCollection> => {
    
        type csvOptions = any; //TODO
        let geojson = this.blankGeoJSON();
        let options: csvOptions = {};
    
        if (this._format === 'tsv') {
            options.delimiter = '\t';
        }
    
        geojson = await new Promise((res, rej) => {
            csv2geojson.csv2geojson(
                this._rawData,
                options,
                (err: string, data: FeatureCollection) => err ? rej(err) : res(data)
            )
        });
    
        return geojson;
    };

    loadTopoJson = async (): Promise<FeatureCollection> => {

        type topojson = {
            type?: 'Topology';
            objects?: { [key: string]: Topology };
            arcs?: any;
        };
        let topoJsonData: topojson = {};
    
        try {
            topoJsonData = JSON.parse(this._rawData);
        } catch (e) {
            throw "Invalid TopoJson";
        }
    
        // Convert the data (TODO: web worker?)
        let result: FeatureCollection = this.blankGeoJSON();
        if (topoJsonData.type === "Topology" && topoJsonData.objects !== undefined) {
            result = {
                type: "FeatureCollection",
                features: result.features = Object.keys(topoJsonData.objects).map(key =>
                    topojsonFeature(topoJsonData as any, key)
                ).reduce((a: any[], v) => [...a, ...(v as any).features],[])
            };
        }
        return result;
    };
}