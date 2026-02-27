declare namespace App {
    interface Locals {
        apiUrl: string;
        runtime?: {
            env?: Record<string, unknown> & {
                API_URL?: string;
            };
        };
    }
}
