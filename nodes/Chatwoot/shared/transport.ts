import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, ILoadOptionsFunctions, IHookFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Get the Chatwoot API base URL from credentials
 */
export async function getBaseUrl(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions): Promise<string> {
	const credentials = await this.getCredentials('chatwootApi');
	let url = credentials.url as string;
	// Remove trailing slash if present
	if (url.endsWith('/')) {
		url = url.slice(0, -1);
	}
	return url;
}

/**
 * Make an authenticated request to the Chatwoot API
 */
export async function chatwootApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<unknown> {
	const credentials = await this.getCredentials('chatwootApi');
	let baseURL = credentials.url as string;

	// Remove trailing slash if present
	if (baseURL.endsWith('/')) {
		baseURL = baseURL.slice(0, -1);
	}

	const options: IHttpRequestOptions = {
		method,
		baseURL,
		url: endpoint,
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'chatwootApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Chatwoot API error: ${(error as Error).message}`,
		});
	}
}

/**
 * Make an authenticated request with pagination support
 */
export async function chatwootApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: 'GET' | 'POST',
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
	dataKey?: string,
): Promise<unknown[]> {
	const returnData: unknown[] = [];
	let page = 1;
	const perPage = 100;

	query = query || {};
	query.page = page;
	query.per_page = perPage;

	let hasMore = true;

	while (hasMore) {
		const response = await chatwootApiRequest.call(this, method, endpoint, body, query);

		let items: unknown[];

		if (dataKey) {
			items = (response as IDataObject)[dataKey] as unknown[] || [];
		} else if (Array.isArray(response)) {
			items = response;
		} else if ((response as IDataObject).payload) {
			items = (response as IDataObject).payload as unknown[] || [];
		} else {
			const responseObj = response as IDataObject;
			const dataObj = responseObj.data as IDataObject | undefined;
			if (dataObj && dataObj.payload) {
				items = dataObj.payload as unknown[] || [];
			} else {
				items = [response];
			}
		}

		returnData.push(...items);

		// Check if there are more pages
		if (items.length < perPage) {
			hasMore = false;
		} else {
			page++;
			query.page = page;
		}

		// Safety limit
		if (page > 100) {
			hasMore = false;
		}
	}

	return returnData;
}

/**
 * Helper to get the account ID from parameters (handles resourceLocator)
 */
export function getAccountId(this: IExecuteFunctions, itemIndex: number): number {
	const param = this.getNodeParameter('accountId', itemIndex) as
		| string
		| number
		| { mode: string; value: string };

	if (typeof param === 'object' && param.value !== undefined) {
		return Number(param.value);
	}
	if (typeof param === 'string') {
		return Number(param);
	}
	return param as number;
}

/**
 * Helper to get the inbox ID from parameters (handles resourceLocator)
 */
export function getInboxId(this: IExecuteFunctions, itemIndex: number): number {
	const param = this.getNodeParameter('inboxId', itemIndex) as
		| string
		| number
		| { mode: string; value: string };

	if (typeof param === 'object' && param.value !== undefined) {
		return Number(param.value);
	}
	if (typeof param === 'string') {
		return Number(param);
	}
	return param as number;
}

/**
 * Helper to get the conversation ID from parameters (handles resourceLocator)
 */
export function getConversationId(this: IExecuteFunctions, itemIndex: number): number {
	const param = this.getNodeParameter('conversationId', itemIndex) as
		| string
		| number
		| { mode: string; value: string };

	if (typeof param === 'object' && param.value !== undefined) {
		return Number(param.value);
	}
	if (typeof param === 'string') {
		return Number(param);
	}
	return param as number;
}

/**
 * Helper to get the contact ID from parameters (handles resourceLocator)
 */
export function getContactId(this: IExecuteFunctions, itemIndex: number): number {
	const param = this.getNodeParameter('contactId', itemIndex) as
		| string
		| number
		| { mode: string; value: string };

	if (typeof param === 'object' && param.value !== undefined) {
		return Number(param.value);
	}
	if (typeof param === 'string') {
		return Number(param);
	}
	return param as number;
}

/**
 * Helper to get the webhook ID from parameters (handles resourceLocator)
 */
export function getWebhookId(this: IExecuteFunctions, itemIndex: number): number {
	const param = this.getNodeParameter('webhookId', itemIndex) as
		| string
		| number
		| { mode: string; value: string };

	if (typeof param === 'object' && param.value !== undefined) {
		return Number(param.value);
	}
	if (typeof param === 'string') {
		return Number(param);
	}
	return param as number;
}
