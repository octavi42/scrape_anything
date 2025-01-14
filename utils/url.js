export function extractWebLink(url) {
    try {
        // Use the URL constructor to parse the URL
        const parsedUrl = new URL(url);

        // Extract the protocol and host (base URL)
        const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

        return baseUrl;
    } catch (error) {
        console.error('Invalid URL provided:', url, error);
        return null; // Return null if the URL is invalid
    }
}
