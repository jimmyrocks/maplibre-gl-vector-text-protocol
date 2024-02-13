import { RequestParameters, default as MapLibrary, GetResourceResponse } from 'maplibre-gl';
import { FeatureCollection } from 'geojson';
import { supportedOptions } from './converter';
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
export declare const addOptions: (url: string | URL, options: supportedOptions) => string | URL;
/**
 * Add the vector text protocol to a map library for each supported format.
 * @param mapLibrary - The MapLibrary object to add the protocols to.
 */
export declare const addProtocols: (mapLibrary: typeof MapLibrary) => void;
export declare const vectorFormats: readonly ["topojson", "osm", "kml", "gpx", "tcx", "csv", "tsv", "polyline"];
export { supportedFormatsType } from './converter';
