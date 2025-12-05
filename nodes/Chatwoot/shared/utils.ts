/**
 * Utility functions for Chatwoot node
 */

/**
 * Parse custom attributes from JSON string to object
 */
export function parseCustomAttributes(customAttributes: string): Record<string, unknown> {
	try {
		return JSON.parse(customAttributes) as Record<string, unknown>;
	} catch {
		return {};
	}
}

/**
 * Parse raw JSON body
 */
export function parseJsonBody(jsonBody: string): Record<string, unknown> {
	try {
		return JSON.parse(jsonBody) as Record<string, unknown>;
	} catch {
		return {};
	}
}

/**
 * Build query params from additional fields
 */
export function buildQueryParams(additionalFields: Record<string, unknown>): Record<string, unknown> {
	const params: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(additionalFields)) {
		if (value !== undefined && value !== null && value !== '') {
			params[key] = value;
		}
	}

	return params;
}
