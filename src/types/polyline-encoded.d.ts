declare module 'polyline-encoded' {
    const polyline: {
        decode(polyline: string): [number, number][];
        encode(coordinates: [number, number][]): string;
    };
    export default polyline;
}
