import {
    RequestParameters,
    ResponseCallback,
    default as MapLibrary
} from 'maplibre-gl';

import { FeatureCollection } from 'geojson';
import { Converter, supportedFormatsType, supportedFormats } from './converter';
import { Actor } from './worker/actor';

// Safari changes https:// to http// for some reason, so this is broken in Safari and iPhone
// So to fix this we add it back
const needsUrlCheck = (new URL('test://http://example.com')).href !== 'test://http://example.com';
const checkUrl = (url: string): string | undefined => {
    const safariFixRegex = new RegExp('^(https?)(\/\/)')
    const cleanUrl = url.replace(safariFixRegex, '$1:$2');
    return cleanUrl;
}

// https://github.com/maplibre/maplibre-gl-js/blob/ddf69421c6ae34c808afefec309a5beecdb7500e/src/index.ts#L151
export const VectorTextProtocol = (requestParameters: RequestParameters, callback: ResponseCallback<FeatureCollection>) => {
    const controller = new AbortController();
    const prefix = requestParameters.url.split('://')[0] as supportedFormatsType;
    const url = requestParameters.url.replace(new RegExp(`^${prefix}://`), '');

    // Apply the Safari fix
    const cleanUrl = needsUrlCheck ? checkUrl(url) : url;

    if (cleanUrl) {
        fetch(cleanUrl, { signal: controller.signal })
            .then(response => {
                if (response.status == 200) {
                    response.text().then(rawData => {
                        let converter: Actor | Converter;
                        let fn;
                        if (['kml', 'tcx', 'gpx'].indexOf(prefix) >= 0) {
                            // XML used the DOM, which isn't available to web workers
                            converter = new Converter(prefix, rawData);
                            fn = converter.convert()
                        } else {
                            converter = new Actor('Converter', [prefix, rawData]);
                            fn = converter.exec('convert')();
                        }
                        fn.then(data => {
                            callback(null, data as FeatureCollection, null, null);
                        }).catch((e: Error) => {
                            callback(e);
                        });
                    });
                } else {
                    callback(new Error(`Data fetch error: ${response.statusText}`));
                }
            })
            .catch(e => {
                callback(new Error(e));
            });
    }
    return { cancel: () => { controller.abort() } };
};

export const addProtocols = (mapLibrary: typeof MapLibrary) => {
    supportedFormats.forEach(type => {
        mapLibrary.addProtocol(type, VectorTextProtocol);
    })
};