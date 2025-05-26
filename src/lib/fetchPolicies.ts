import fetch from 'node-fetch';

/**
 * The function fetches policies data from a remote URL using async/await in TypeScript.
 * @param {string} url - The `url` parameter in the `fetchPoliciesFromRemoteUrl` function is a string
 * that represents the URL from which policies will be fetched.
 * @returns The function `fetchPoliciesFromRemoteUrl` is returning the data fetched from the provided
 * URL after converting it to JSON format.
 */
export const fetchPoliciesFromRemoteUrl = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}