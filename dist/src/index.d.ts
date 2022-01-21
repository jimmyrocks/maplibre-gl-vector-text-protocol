import { RequestParameters, ResponseCallback, default as MapLibrary } from 'maplibre-gl';
import { FeatureCollection } from 'geojson';
export declare const VectorTextProtocol: (requestParameters: RequestParameters, callback: ResponseCallback<FeatureCollection>) => {
    cancel: () => void;
};
export declare const addProtocols: (mapLibrary: typeof MapLibrary) => void;
