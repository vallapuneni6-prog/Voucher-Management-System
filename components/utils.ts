/**
 * Converts a data URI to a Blob, which is more reliable for downloads.
 * @param dataURI The data URI string to convert.
 * @returns A Blob object or null if conversion fails.
 */
export const dataURItoBlob = (dataURI: string): Blob | null => {
    try {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    } catch (error) {
        console.error("Failed to convert data URI to Blob", error);
        return null;
    }
};
