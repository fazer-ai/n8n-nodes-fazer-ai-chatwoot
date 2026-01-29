import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, ILoadOptionsFunctions, IHookFunctions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

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
	const credentials = await this.getCredentials('fazerAiChatwootApi');
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
		return await this.helpers.httpRequestWithAuthentication.call(this, 'fazerAiChatwootApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Chatwoot API error: ${(error as Error).message}`,
		});
	}
}

/**
 * Async sleep helper for adding delays between operations.
 * NOTE: Uses setTimeout which is restricted on n8n Cloud.
 * This feature only works on self-hosted n8n installations.
 */
export function asyncSleep(ms: number): Promise<void> {
	// eslint-disable-next-line @n8n/community-nodes/no-restricted-globals
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to get the ID from a resourceLocator parameter
 */
function getResourceId(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	itemIndex: number,
	parameterName: string,
): string {
	try {
		const param = this.getNodeParameter(parameterName, itemIndex) as
		| string
		| number
		| { mode: string; value: string };

		if (!param) {
			throw new NodeOperationError(this.getNode(), 'Parameter is missing');
		}

		if (typeof param === 'object') {
			return param.value || '';
		}
		if (typeof param === 'number') {
			return String(param);
		}
		return param;
	}
	catch {
		throw new NodeOperationError(
			this.getNode(),
			`The parameter "${parameterName}" is required and must be a valid ID.`,
		);
	}
}

/**
 * Helper to get the account ID from parameters (handles resourceLocator)
 */
export function getAccountId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'accountId');
}

/**
 * Helper to get the inbox ID from parameters (handles resourceLocator)
 */
export function getInboxId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'inboxId');
}

/**
 * Helper to get the inbox ID from parameters (handles resourceLocator)
 */
export function getWhatsappSpecialProviderInboxId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'whatsappSpecialInboxId');
}

/**
 * Helper to get the conversation ID from parameters (handles resourceLocator)
 */
export function getConversationId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'conversationId');
}

/**
 * Helper to get the contact ID from parameters (handles resourceLocator)
 */
export function getContactId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'contactId');
}

/**
 * Helper to get the label ID from parameters (handles resourceLocator)
 */
export function getLabelId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'labelId');
}

/**
 * Helper to get the webhook ID from parameters (handles resourceLocator)
 */
export function getWebhookId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'webhookId');
}

/**
 * Helper to get the team ID from parameters (handles resourceLocator)
 */
export function getTeamId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'teamId');
}

/**
 * Helper to get the agent ID from parameters (handles resourceLocator)
 */
export function getAgentId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'agentId');
}

/**
 * Helper to get the team member ID from parameters (handles resourceLocator)
 */
export function getTeamMemberId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'teamMemberId');
}

/**
 * Helper to get the kanban board ID from parameters (handles resourceLocator)
 */
export function getKanbanBoardId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'kanbanBoardId');
}

/**
 * Helper to get the kanban step ID from parameters (handles resourceLocator)
 */
export function getKanbanStepId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'kanbanStepId');
}

/**
 * Helper to get kanban task ID from parameters (handles resourceLocator)
 */
export function getKanbanTaskId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'kanbanTaskId');
}

/**
 * Helper to get the message ID from parameters (handles resourceLocator)
 */
export function getMessageId(this: IExecuteFunctions | ILoadOptionsFunctions, itemIndex: number): string {
	return getResourceId.call(this, itemIndex, 'messageId');
}
