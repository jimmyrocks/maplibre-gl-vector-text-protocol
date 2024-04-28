import {
    RequestParameters,
    default as MapLibrary,
    GetResourceResponse
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
export async function processData(url: string, prefix: supportedFormatsType, controller?: AbortController): Promise<FeatureCollection | undefined> {
    const response = await fetch(url, controller ? { signal: controller.signal } : undefined);

    let options = {};

    // Parse the URL
    const urlObject = new URL(url, window.location.href);

    if (urlObject.hash.length) {
        // Extract the hash (including the "#" symbol)
        const hash = urlObject.hash;

        // Remove the "#" symbol from the hash and decode it
        const decodedHash = decodeURIComponent(hash.slice(1)); // Remove the "#" symbol

        try {
            options = JSON.parse(decodedHash);
        } catch (e) {
            console.warn('Error parsing or reading URL:', e);
        }
    }

    if (response.status == 200) {
        const rawData = await response.text();
        let convertPromise;
        const usesDOM = (['kml', 'tcx', 'gpx'].includes(prefix));
        if (usesDOM || !supportsWorkers()) {
            // XML uses the DOM, which isn't available to web workers
            // It is possible to use xmldom to do this, but that increases the bundle size by 3x
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
 * Processes the URL and returns the prefix and cleaned URL.
 * 
 * @param url - The URL to process.
 * @returns An object with the prefix and cleaned URL.
 */
const processUrl = (url: string) => {
    const prefix = url.split('://')[0] as supportedFormatsType;
    const replacedUrl = url.replace(new RegExp(`^${prefix}://`), '');

    // Apply the Safari fix (if needed) to the URL
    const cleanUrl = needsUrlCheck ? checkUrl(replacedUrl) : replacedUrl;
    return { prefix, url: cleanUrl };
}
/**
 * Handles the Vector Text Protocol for version 4.
 * 
 * @param requestParameters - The parameters for the request including the URL.
 * @param controller - An AbortController instance to manage the request lifecycle.
 * @returns A promise resolving to a GetResourceResponse containing a FeatureCollection or undefined.
 * @throws Will throw an error if the URL is invalid or if any other error occurs during data processing.
 */
const VectorTextProtocolV4 = async (
    requestParameters: RequestParameters,
    controller: AbortController
): Promise<GetResourceResponse<FeatureCollection | undefined>> => {
    const { prefix, url } = processUrl(requestParameters.url);

    if (url) {
        try {
            // Process the data and return the response
            const data = await processData(url, prefix, controller);
            return { data };
        } catch (e) {
            // Catch and rethrow errors with additional context
            throw new Error((e as any) || 'Unknown Error');
        }
    } else {
        // Handle invalid URL case
        throw new Error('Invalid URL: ' + requestParameters.url);
    }
};

/**
 * Handles the Vector Text Protocol for version 3.
 * 
 * @param requestParameters - The parameters for the request including the URL.
 * @param callback - A callback function to handle the response or error.
 * @returns An object with a cancel function to abort the request.
 */
const VectorTextProtocolV3 = (
    requestParameters: RequestParameters,
    callback: (e: string | null, d?: FeatureCollection) => void
) => {
    const controller = new AbortController();
    const { prefix, url } = processUrl(requestParameters.url);


    if (url) {
        processData(url, prefix, controller)
            .then(data => callback(null, data))
            .catch(e => callback(e))
    }

    // Return an object with a cancel method to abort the request
    return { cancel: () => { controller.abort() } };
};

/**
 * Selects the appropriate Vector Text Protocol version based on the type of controller provided.
 * 
 * @param requestParameters - The parameters for the request including the URL.
 * @param controller - Either an AbortController or a callback function.
 * @returns Either a Promise for V4 or an object with a cancel method for V3.
 */
export const VectorTextProtocol = (
    requestParameters: RequestParameters,
    controller: AbortController | ((e: string | null, d?: FeatureCollection) => void)
): Promise<GetResourceResponse<FeatureCollection | undefined>> | { cancel: () => void } => {
    if (controller instanceof AbortController) {
        return VectorTextProtocolV4(requestParameters, controller);
    } else {
        return VectorTextProtocolV3(requestParameters, controller)
    }
}

/**
 * Add options to a URL for the Vector Text Protocol.
 * 
 * @param url - The URL to add options to.
 * @param options - The options to add to the URL.
 * @returns A string with the updated URL.
 */
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
        mapLibrary.addProtocol(type, VectorTextProtocol as (requestParameters: RequestParameters, controller: AbortController) => Promise<GetResourceResponse<any>>);
    })
};

export const vectorFormats = supportedFormats;
export { supportedFormatsType } from './converter';