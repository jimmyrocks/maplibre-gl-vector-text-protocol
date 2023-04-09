declare module '@tmcw/togeojson' {
    export function kml(doc: Document): FeatureCollection;
    export function gpx(doc: Document): FeatureCollection;
    export function tcx(doc: Document): FeatureCollection;
}


declare module 'csv2geojson' {
    export interface csvOptions {
        'latfield'?: string,
        'lonfield'?: string,
        'delimiter'?: string
    }

    export function csv2geojson(
        csvString: string,
        options: csvOptions,
        callback: (err: string, data: FeatureCollection) => void
    ): void
}

declare module 'web-worker:*' {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
}