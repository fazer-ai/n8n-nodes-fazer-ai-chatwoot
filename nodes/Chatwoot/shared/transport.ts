import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, ILoadOptionsFunctions, IHookFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

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
 * Helper to get the ID from a resourceLocator parameter
 */
function getResourceId(
	this: IExecuteFunctions,
	itemIndex: number,
	parameterName: string,
): number {
	const param = this.getNodeParameter(parameterName, itemIndex) as
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
 * Helper to get the account ID from parameters (handles resourceLocator)
 */
export function getAccountId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'accountId');
}

/**
 * Helper to get the inbox ID from parameters (handles resourceLocator)
 */
export function getInboxId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'inboxId');
}

/**
 * Helper to get the inbox ID from parameters (handles resourceLocator)
 */
export function getWhatsappSpecialProviderInboxId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'whatsappSpecialInboxId');
}

/**
 * Helper to get the conversation ID from parameters (handles resourceLocator)
 */
export function getConversationId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'conversationId');
}

/**
 * Helper to get the contact ID from parameters (handles resourceLocator)
 */
export function getContactId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'contactId');
}

/**
 * Helper to get the label ID from parameters (handles resourceLocator)
 */
export function getLabelId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'labelId');
}

/**
 * Helper to get the webhook ID from parameters (handles resourceLocator)
 */
export function getWebhookId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'webhookId');
}

/**
 * Helper to get the team ID from parameters (handles resourceLocator)
 */
export function getTeamId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'teamId');
}

/**
 * Helper to get the agent ID from parameters (handles resourceLocator)
 */
export function getAgentId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'agentId');
}

/**
 * Helper to get the team member ID from parameters (handles resourceLocator)
 */
export function getTeamMemberId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'teamMemberId');
}

/**
 * Helper to get the kanban board ID from parameters (handles resourceLocator)
 */
export function getKanbanBoardId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'kanbanBoardId');
}

/**
 * Helper to get the kanban step ID from parameters (handles resourceLocator)
 */
export function getKanbanStepId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'kanbanStepId');
}

/**
 * Helper to get kanban task ID from parameters (handles resourceLocator)
 */
export function getKanbanTaskId(this: IExecuteFunctions, itemIndex: number): number {
	return getResourceId.call(this, itemIndex, 'kanbanTaskId');
}
