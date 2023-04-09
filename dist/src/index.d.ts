import { RequestParameters, ResponseCallback, default as MapLibrary } from 'maplibre-gl';
import { FeatureCollection } from 'geojson';
/**
 * The VectorTextProtocol function handles requests for vector data and returns a Promise with the
 * response callback function.
 * Modeled after this: https://github.com/maplibre/maplibre-gl-js/blob/ddf69421c6ae34c808afefec309a5beecdb7500e/src/index.ts#L151
 * @param requestParameters - The request parameters containing the URL of the resource.
 * @param callback - The function to be called when the response is available.
 * @returns An object with the cancel function.
 */
export declare const VectorTextProtocol: (requestParameters: RequestParameters, callback: ResponseCallback<FeatureCollection>) => {
    cancel: () => void;
};
/**
 * Add the vector text protocol to a map library for each supported format.
 * @param mapLibrary - The MapLibrary object to add the protocols to.
 */
export declare const addProtocols: (mapLibrary: typeof MapLibrary) => void;
