import {
    RequestParameters,
    ResponseCallback,
    default as MapLibrary
} from 'maplibre-gl';

import { FeatureCollection } from 'geojson';
import { Converter, supportedFormatsType, supportedFormats, supportedOptions } from './converter';
import { Actor } from './worker/actor';

// Make sure we can support workers in the current browser / runtime
const supportsWorkers = () => {
    let supported = false;
    try {
        supported = typeof (window.Worker) === 'function';
    } catch (e) {
        supported = false;
    }
    return supported;
};

// Safari changes https:// to http// for some reason, so this is broken in Safari and iPhone
// So to fix this we add it back
const needsUrlCheck = (new URL('test://http://example.com')).href !== 'test://http://example.com';
const checkUrl = (url: string): string | undefined => {
    const safariFixRegex = new RegExp('^(https?)(\/\/)')
    const cleanUrl = url.replace(safariFixRegex, '$1:$2');
    return cleanUrl;
}

/**
 * The processData function accepts a URL, prefix, and an optional controller
 * and tries to read and convert the data
 * @param url - The URL of the resource.
 * @param prefix - The prefix used to process the data
 * @param controller - optional controller that can be used to cancel a request
 * @returns A geojson FeatureCollection (or undefined)
 */
async function processData(url: string, prefix: supportedFormatsType, controller?: AbortController): Promise<FeatureCollection | undefined> {
    const response = await fetch(url, controller ? { signal: controller.signal } : undefined);

    let options = {};
    try {
        // Parse the URL
        const urlObject = new URL(url, window.location.href);

        // Extract the hash (including the "#" symbol)
        const hash = urlObject.hash;

        // Remove the "#" symbol from the hash and decode it
        const decodedHash = decodeURIComponent(hash.slice(1)); // Remove the "#" symbol

        options = JSON.parse(decodedHash);
    } catch (error) {
        console.warn('Error parsing or reading URL:', error);
    }

    if (response.status == 200) {
        const rawData = await response.text();
        let convertPromise;
        if (['kml', 'tcx', 'gpx'].indexOf(prefix) >= 0 || !supportsWorkers()) {
            // XML uses the DOM, which isn't available to web workers
            const converter = new Converter(prefix, rawData, options);
            convertPromise = converter.convert();
        } else {
            const converter = new Actor('Converter', [prefix, rawData, options]);
            convertPromise = converter.exec('convert')();
        }
        return await convertPromise;
    } else {
        throw (new Error(`Data fetch error: ${response.statusText}`));
    }
};

/**
 * The VectorTextProtocol function handles requests for vector data and returns a Promise with the
 * response callback function.
 * Modeled after this: https://github.com/maplibre/maplibre-gl-js/blob/ddf69421c6ae34c808afefec309a5beecdb7500e/src/index.ts#L151
 * @param requestParameters - The request parameters containing the URL of the resource.
 * @param callback - The function to be called when the response is available.
 * @returns An object with the cancel function.
 */
export const VectorTextProtocol = (requestParameters: RequestParameters, callback: ResponseCallback<FeatureCollection>) => {
    const controller = new AbortController();
    const prefix = requestParameters.url.split('://')[0] as supportedFormatsType;
    const url = requestParameters.url.replace(new RegExp(`^${prefix}://`), '');

    // Apply the Safari fix
    const cleanUrl = needsUrlCheck ? checkUrl(url) : url;

    if (cleanUrl) {
        processData(cleanUrl, prefix, controller)
            .then(data => callback(null, data))
            .catch(e => callback(e))
    }

    // Allow the request to be cancelled
    return { cancel: () => { controller.abort() } };
};

export const addOptions = (url: string | URL, options: supportedOptions) => {
    try {
        // Parse the original URL
        const urlObject = new URL(url);

        // Set the hash property with the GeoJSON data
        urlObject.hash = `#${encodeURIComponent(JSON.stringify(options))}`;

        // Convert the updated URL object back to a string
        return urlObject.toString();
    } catch (error) {
        console.error('Error parsing or updating URL:', error);
        return url; // Return the original URL if there's an error
    }
}

/**
 * Add the vector text protocol to a map library for each supported format.
 * @param mapLibrary - The MapLibrary object to add the protocols to.
 */
export const addProtocols = (mapLibrary: typeof MapLibrary) => {
    supportedFormats.forEach(type => {
        mapLibrary.addProtocol(type, VectorTextProtocol);
    })
};