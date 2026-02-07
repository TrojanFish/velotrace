/**
 * Utility for native sharing in PWA environment
 */

/**
 * Converts a data URL (base64) to a File object
 * Required for navigator.share to work with images
 */
export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: 'image/png' });
}

/**
 * Logic to handle native share sheet vs download fallback
 */
export async function shareReport(dataUrl: string, fileName: string, title: string = "VeloTrace Report") {
    // Check if Web Share API is available and can share files
    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            const file = await dataUrlToFile(dataUrl, fileName);
            const shareData: ShareData = {
                files: [file],
                title: title,
                text: "Check out my cycling insights from VeloTrace!",
            };

            // Test if sharing files is actually supported
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return { success: true, method: 'native' };
            }
        } catch (err) {
            // User might have cancelled (AbortError)
            if ((err as Error).name === 'AbortError') {
                return { success: true, method: 'cancel' };
            }
            console.error('Share failed:', err);
        }
    }

    // Fallback: Trigger download if sharing isn't supported or fails
    try {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return { success: true, method: 'download' };
    } catch (err) {
        console.error('Download failed:', err);
        return { success: false, method: 'fail' };
    }
}

