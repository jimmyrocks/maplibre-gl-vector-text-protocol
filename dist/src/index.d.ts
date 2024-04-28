import { RequestParameters, default as MapLibrary, GetResourceResponse } from 'maplibre-gl';
import { FeatureCollection } from 'geojson';
import { supportedFormatsType, supportedOptions } from './converter';
/**
 * The processData function accepts a URL, prefix, and an optional controller
 * and tries to read and convert the data
 * @param url - The URL of the resource.
 * @param prefix - The prefix used to process the data
 * @param controller - optional controller that can be used to cancel a request
 * @returns A geojson FeatureCollection (or undefined)
 */
export declare function processData(url: string, prefix: supportedFormatsType, controller?: AbortController): Promise<FeatureCollection | undefined>;
/**
 * Selects the appropriate Vector Text Protocol version based on the type of controller provided.
 *
 * @param requestParameters - The parameters for the request including the URL.
 * @param controller - Either an AbortController or a callback function.
 * @returns Either a Promise for V4 or an object with a cancel method for V3.
 */
export declare const VectorTextProtocol: (requestParameters: RequestParameters, controller: AbortController | ((e: string | null, d?: FeatureCollection) => void)) => Promise<GetResourceResponse<FeatureCollection | undefined>> | {
    cancel: () => void;
};
/**
 * Add options to a URL for the Vector Text Protocol.
 *
 * @param url - The URL to add options to.
 * @param options - The options to add to the URL.
 * @returns A string with the updated URL.
 */
export declare const addOptions: (url: string | URL, options: supportedOptions) => string | URL;
/**
 * Add the vector text protocol to a map library for each supported format.
 * @param mapLibrary - The MapLibrary object to add the protocols to.
 */
export declare const addProtocols: (mapLibrary: typeof MapLibrary) => void;
export declare const vectorFormats: readonly ["topojson", "osm", "kml", "gpx", "tcx", "csv", "tsv", "polyline"];
export { supportedFormatsType } from './converter';
//# sourceMappingURL=index.d.ts.map