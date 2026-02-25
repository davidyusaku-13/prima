const API_URL = import.meta.env.API_URL ?? "http://localhost:8080";

type AdminRequestResult<T> = {
    unauthorized: boolean;
    data: T;
};

export type AdminStatusRequestResult<T> = {
    unauthorized: boolean;
    httpStatus: number;
    ok: boolean;
    data: T;
};

type RequestMethod = "GET" | "POST";

type RequestOptions = {
    method?: RequestMethod;
    body?: string;
};

function buildAuthRequest(token: string, options: RequestOptions = {}): RequestInit {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (options.body) {
        headers["Content-Type"] = "application/json";
    }
    return {
        method: options.method ?? "GET",
        headers,
        body: options.body,
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

    const response = await fetch(`${API_URL}${path}`, buildAuthRequest(token, { method: "GET" })).catch(() => null);

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

async function parseJsonOrFallback<T>(response: Response, fallback: T): Promise<T> {
    try {
        return (await response.json()) as T;
    } catch {
        return fallback;
    }
}

export async function fetchAdminJsonWithStatus<T>(
    token: string | null,
    path: string,
    fallback: T,
): Promise<AdminStatusRequestResult<T>> {
    if (!token) {
        return {
            unauthorized: true,
            httpStatus: 401,
            ok: false,
            data: fallback,
        };
    }

    const response = await fetch(`${API_URL}${path}`, buildAuthRequest(token, { method: "GET" })).catch(() => null);
    if (!response) {
        return {
            unauthorized: false,
            httpStatus: 0,
            ok: false,
            data: fallback,
        };
    }

    if (response.status === 401 || response.status === 403) {
        return {
            unauthorized: true,
            httpStatus: response.status,
            ok: false,
            data: fallback,
        };
    }

    const data = await parseJsonOrFallback(response, fallback);
    return {
        unauthorized: false,
        httpStatus: response.status,
        ok: response.ok,
        data,
    };
}

export async function postAdminJson<T>(
    token: string | null,
    path: string,
    payload: unknown,
    fallback: T,
): Promise<AdminRequestResult<T>> {
    if (!token) {
        return {
            unauthorized: true,
            data: fallback,
        };
    }

    const response = await fetch(
        `${API_URL}${path}`,
        buildAuthRequest(token, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    ).catch(() => null);

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
