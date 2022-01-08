import {
    RequestParameters,
    ResponseCallback,
    default as MapLibrary
} from 'maplibre-gl';

import { FeatureCollection } from 'geojson';
import { Converter, supportedFormatsType, supportedFormats } from './converter';

// https://github.com/maplibre/maplibre-gl-js/blob/ddf69421c6ae34c808afefec309a5beecdb7500e/src/index.ts#L151

export const VectorTextProtocol = (requestParameters: RequestParameters, callback: ResponseCallback<FeatureCollection>) => {
    const prefix = requestParameters.url.split('://')[0];
    const url = requestParameters.url.replace(new RegExp(`^${prefix}://`), '');

    fetch(url)
        .then(response => {
            if (response.status == 200) {
                response.text().then(rawData => {
                    let converter = new Converter(prefix as supportedFormatsType, rawData);
                    converter.convert().then(data => {
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
    return { cancel: () => { } };
};

export const addProtocols = (mapLibrary: typeof MapLibrary) => {
    supportedFormats.forEach(type => {
        mapLibrary.addProtocol(type, VectorTextProtocol);
    })
};


