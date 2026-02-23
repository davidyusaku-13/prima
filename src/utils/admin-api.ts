const API_URL = import.meta.env.API_URL ?? "http://localhost:8080";

type AdminRequestResult<T> = {
    unauthorized: boolean;
    data: T;
};

type RequestInitWithRequiredHeaders = RequestInit & {
    headers: HeadersInit;
};

function buildAuthRequest(token: string): RequestInitWithRequiredHeaders {
    return {
        headers: { Authorization: `Bearer ${token}` },
    };
}

export async function probeAdminAccess(token: string | null, path = "/admin"): Promise<boolean> {
    if (!token) {
        return false;
    }

    const response = await fetch(`${API_URL}${path}`, buildAuthRequest(token)).catch(() => null);
    return Boolean(response?.ok);
}

export async function fetchAdminJson<T>(
    token: string | null,
    path: string,
    fallback: T,
): Promise<AdminRequestResult<T>> {
    if (!token) {
        return {
            unauthorized: true,
            data: fallback,
        };
    }

    const response = await fetch(`${API_URL}${path}`, buildAuthRequest(token)).catch(() => null);

    if (!response || response.status === 401 || response.status === 403) {
        return {
            unauthorized: true,
            data: fallback,
        };
    }

    if (!response.ok) {
        return {
            unauthorized: false,
            data: fallback,
        };
    }

    const data = (await response.json()) as T;
    return {
        unauthorized: false,
        data,
    };
}
