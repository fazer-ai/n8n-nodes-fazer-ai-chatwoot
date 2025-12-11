import type { IDataObject } from 'n8n-workflow';

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

/**
 * Extract all keys from an object
 */
export function extractAllKeys(obj: IDataObject, prefix = ''): string[] {
	const keys: string[] = [];

	for (const key of Object.keys(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		keys.push(fullKey);

		const value = obj[key];
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			keys.push(...extractAllKeys(value as IDataObject, fullKey));
		}
	}

	return keys;
}

/**
 * Filter response data based on selectFields or exceptFields (top-level only)
 */
export function filterResponseFields(
	data: IDataObject | IDataObject[],
	selectFields?: string[],
	exceptFields?: string[],
): IDataObject | IDataObject[] {
	if ((!selectFields || selectFields.length === 0) && (!exceptFields || exceptFields.length === 0)) {
		return data;
	}

	const filterSingleObject = (obj: IDataObject): IDataObject => {
		if (selectFields && selectFields.length > 0) {
			const result: IDataObject = {};
			for (const field of selectFields) {
				if (field in obj) {
					result[field] = obj[field];
				}
			}
			return result;
		} else if (exceptFields && exceptFields.length > 0) {
			const result: IDataObject = { ...obj };
			for (const field of exceptFields) {
				delete result[field];
			}
			return result;
		}
		return obj;
	};

	if (Array.isArray(data)) {
		return data.map(filterSingleObject);
	}

	return filterSingleObject(data);
}
