const DEFAULT_API_URL = "http://localhost:8080";

function normalizeApiUrl(input: string): string {
    let value = input.trim();

    if (
        value.length >= 2 &&
        ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
    ) {
        value = value.slice(1, -1).trim();
    }

    return value.replace(/\/+$/, "");
}

function parseApiUrl(value: unknown): string | null {
    if (typeof value !== "string" || value.trim() === "") {
        return null;
    }

    const normalized = normalizeApiUrl(value);
    return normalized === "" ? null : normalized;
}

export function resolveApiUrl(runtimeApiUrl?: unknown): string {
    return parseApiUrl(runtimeApiUrl) ?? parseApiUrl(import.meta.env.API_URL) ?? DEFAULT_API_URL;
}
