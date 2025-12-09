import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodePropertyOptions,
} from 'n8n-workflow';
import { chatwootApiRequest } from '../shared/transport';

interface ChatwootAccount {
	id: number;
	name: string;
}

interface ChatwootInbox {
	id: number;
	name: string;
}

interface ChatwootConversation {
	id: number;
	meta?: {
		sender?: {
			name?: string;
		};
	};
}

interface ChatwootContact {
	id: number;
	name?: string;
	email?: string;
}

interface ChatwootAgent {
	id: number;
	name?: string;
	email?: string;
}

interface ChatwootTeam {
	id: number;
	name: string;
}

interface ChatwootLabel {
	title: string;
}

interface ChatwootWebhook {
	id: number;
	url: string;
}

interface ChatwootProfileResponse {
	accounts?: ChatwootAccount[];
}

interface ChatwootPayloadResponse<T> {
	payload?: T[];
	data?: {
		payload?: T[];
	};
}

function extractResourceLocatorValue(
	context: ILoadOptionsFunctions,
	paramName: string,
): string | undefined {
	try {
		const param = context.getNodeParameter(paramName, 0) as
			| string
			| { mode: string; value: string }
			| undefined;

		if (!param) return undefined;
		if (typeof param === 'string') return param;
		if (typeof param === 'object' && param.value) return String(param.value);
		return undefined;
	} catch {
		return undefined;
	}
}

/**
 * Get all accounts available to the user (for resourceLocator)
 */
export async function getAccounts(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		'/api/v1/profile',
	)) as ChatwootProfileResponse;
	const accounts = response.accounts || [];

	let results = accounts.map((account: ChatwootAccount) => ({
		name: account.name,
		value: String(account.id),
	}));

	if (filter) {
		const filterLower = filter.toLowerCase();
		results = results.filter(
			(item) =>
				item.name.toLowerCase().includes(filterLower) ||
				item.value.includes(filter),
		);
	}

	return { results };
}

/**
 * Get all inboxes for the selected account (for resourceLocator)
 */
export async function getInboxes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes`,
	)) as ChatwootPayloadResponse<ChatwootInbox> | ChatwootInbox[];
	const inboxes =
		(response as ChatwootPayloadResponse<ChatwootInbox>).payload ||
		(response as ChatwootInbox[]) ||
		[];

	let results = (inboxes as ChatwootInbox[]).map((inbox: ChatwootInbox) => ({
		name: inbox.name,
		value: String(inbox.id),
	}));

	if (filter) {
		const filterLower = filter.toLowerCase();
		results = results.filter(
			(item) =>
				item.name.toLowerCase().includes(filterLower) ||
				item.value.includes(filter),
		);
	}

	// FIXME: Add "All Inboxes" option only for webhook triggers.
	results.unshift({
		name: 'All Inboxes',
		value: '',
	})

	return { results };
}

/**
 * Get all conversations for the selected account/inbox (for resourceLocator)
 */
export async function getConversations(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return { results: [] };
	}

	const inboxId = extractResourceLocatorValue(this, 'inboxId');

	let endpoint = `/api/v1/accounts/${accountId}/conversations`;
	if (inboxId) {
		endpoint += `?inbox_id=${inboxId}`;
	}

	const response = (await chatwootApiRequest.call(this, 'GET', endpoint)) as
		| ChatwootPayloadResponse<ChatwootConversation>
		| ChatwootConversation[];
	const responseObj = response as ChatwootPayloadResponse<ChatwootConversation>;
	const conversations =
		responseObj.data?.payload ||
		responseObj.payload ||
		(response as ChatwootConversation[]) ||
		[];

	let results = (conversations as ChatwootConversation[]).map(
		(conv: ChatwootConversation) => ({
			name: `#${conv.id} - ${conv.meta?.sender?.name || 'Unknown'}`,
			value: String(conv.id),
		}),
	);

	if (filter) {
		const filterLower = filter.toLowerCase();
		results = results.filter(
			(item) =>
				item.name.toLowerCase().includes(filterLower) ||
				item.value.includes(filter),
		);
	}

	return { results };
}

/**
 * Get all contacts for the selected account (for resourceLocator)
 */
export async function getContacts(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/contacts`,
	)) as ChatwootPayloadResponse<ChatwootContact> | ChatwootContact[];
	const contacts =
		(response as ChatwootPayloadResponse<ChatwootContact>).payload ||
		(response as ChatwootContact[]) ||
		[];

	let results = (contacts as ChatwootContact[]).map(
		(contact: ChatwootContact) => ({
			name: contact.name || contact.email || `Contact ${contact.id}`,
			value: String(contact.id),
		}),
	);

	if (filter) {
		const filterLower = filter.toLowerCase();
		results = results.filter(
			(item) =>
				item.name.toLowerCase().includes(filterLower) ||
				item.value.includes(filter),
		);
	}

	return { results };
}

/**
 * Get all agents for the selected account (for loadOptions)
 */
export async function getAgents(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return [];
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/agents`,
	)) as ChatwootAgent[];
	const agents = response || [];

	return agents.map((agent: ChatwootAgent) => ({
		name: agent.name || agent.email || `Agent ${agent.id}`,
		value: agent.id,
	}));
}

/**
 * Get all teams for the selected account (for loadOptions)
 */
export async function getTeams(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return [];
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/teams`,
	)) as ChatwootTeam[];
	const teams = response || [];

	return teams.map((team: ChatwootTeam) => ({
		name: team.name,
		value: team.id,
	}));
}

/**
 * Get all labels for the selected account (for loadOptions)
 */
export async function getLabels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return [];
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/labels`,
	)) as ChatwootPayloadResponse<ChatwootLabel> | ChatwootLabel[];
	const labels =
		(response as ChatwootPayloadResponse<ChatwootLabel>).payload ||
		(response as ChatwootLabel[]) ||
		[];

	return (labels as ChatwootLabel[]).map((label: ChatwootLabel) => ({
		name: label.title,
		value: label.title,
	}));
}

/**
 * Get all webhooks for the selected account (for resourceLocator)
 */
export async function getWebhooks(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/webhooks`,
	)) as ChatwootPayloadResponse<ChatwootWebhook> | ChatwootWebhook[];
	const webhooks =
		(response as ChatwootPayloadResponse<ChatwootWebhook>).payload ||
		(response as ChatwootWebhook[]) ||
		[];

	let results = (webhooks as ChatwootWebhook[]).map(
		(webhook: ChatwootWebhook) => ({
			name: webhook.url,
			value: String(webhook.id),
		}),
	);

	if (filter) {
		const filterLower = filter.toLowerCase();
		results = results.filter(
			(item) =>
				item.name.toLowerCase().includes(filterLower) ||
				item.value.includes(filter),
		);
	}

	return { results };
}

/**
 * Get all response fields dynamically based on resource and operation
 * Makes a sample API call and extracts all available field names
 */
export async function getResponseFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const resource = this.getNodeParameter('resource', 0) as string;
	const operation = this.getNodeParameter('operation', 0) as string;
	const accountId = extractResourceLocatorValue(this, 'accountId');

	if (!accountId) {
		return [];
	}

	let sampleResponse: unknown;

	try {
		switch (resource) {
			case 'profile':
				sampleResponse = await chatwootApiRequest.call(this, 'GET', '/api/v1/profile');
				break;

			case 'account':
				if (operation === 'getAll') {
					const profile = (await chatwootApiRequest.call(
						this,
						'GET',
						'/api/v1/profile',
					)) as ChatwootProfileResponse;
					sampleResponse = profile.accounts?.[0] || {};
				} else {
					sampleResponse = await chatwootApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}`,
					);
				}
				break;

			case 'inbox': {
				const inboxResponse = (await chatwootApiRequest.call(
					this,
					'GET',
					`/api/v1/accounts/${accountId}/inboxes`,
				)) as ChatwootPayloadResponse<ChatwootInbox> | ChatwootInbox[];
				const inboxes =
					(inboxResponse as ChatwootPayloadResponse<ChatwootInbox>).payload ||
					(inboxResponse as ChatwootInbox[]) ||
					[];
				sampleResponse = inboxes[0] || {};
				break;
			}

			case 'contact': {
				const contactResponse = (await chatwootApiRequest.call(
					this,
					'GET',
					`/api/v1/accounts/${accountId}/contacts`,
					undefined,
					{ per_page: 1 },
				)) as ChatwootPayloadResponse<ChatwootContact> | ChatwootContact[];
				const contacts =
					(contactResponse as ChatwootPayloadResponse<ChatwootContact>).payload ||
					(contactResponse as ChatwootContact[]) ||
					[];
				sampleResponse = contacts[0] || {};
				break;
			}

			case 'conversation': {
				const convResponse = (await chatwootApiRequest.call(
					this,
					'GET',
					`/api/v1/accounts/${accountId}/conversations`,
					undefined,
					{ per_page: 1 },
				)) as ChatwootPayloadResponse<ChatwootConversation> | { data: { payload?: ChatwootConversation[] } };
				const conversations =
					(convResponse as ChatwootPayloadResponse<ChatwootConversation>).payload ||
					(convResponse as { data: { payload?: ChatwootConversation[] } }).data?.payload ||
					[];
				sampleResponse = conversations[0] || {};
				break;
			}

			case 'message': {
				const msgConvResponse = (await chatwootApiRequest.call(
					this,
					'GET',
					`/api/v1/accounts/${accountId}/conversations`,
					undefined,
					{ per_page: 1 },
				)) as ChatwootPayloadResponse<ChatwootConversation> | { data: { payload?: ChatwootConversation[] } };
				const msgConversations =
					(msgConvResponse as ChatwootPayloadResponse<ChatwootConversation>).payload ||
					(msgConvResponse as { data: { payload?: ChatwootConversation[] } }).data?.payload ||
					[];
				if (msgConversations.length > 0) {
					const messagesResponse = (await chatwootApiRequest.call(
						this,
						'GET',
						`/api/v1/accounts/${accountId}/conversations/${msgConversations[0].id}/messages`,
					)) as unknown[];
					sampleResponse = Array.isArray(messagesResponse) && messagesResponse.length > 0
						? messagesResponse[0]
						: {};
				} else {
					sampleResponse = {};
				}
				break;
			}

			case 'webhook': {
				const webhookResponse = (await chatwootApiRequest.call(
					this,
					'GET',
					`/api/v1/accounts/${accountId}/webhooks`,
				)) as ChatwootPayloadResponse<ChatwootWebhook> | ChatwootWebhook[];
				const webhooks =
					(webhookResponse as ChatwootPayloadResponse<ChatwootWebhook>).payload ||
					(webhookResponse as ChatwootWebhook[]) ||
					[];
				sampleResponse = webhooks[0] || {};
				break;
			}

			case 'customAttribute': {
				const attrResponse = (await chatwootApiRequest.call(
					this,
					'GET',
					`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
					undefined,
					{ attribute_model: 'contact_attribute' },
				)) as unknown[];
				sampleResponse = Array.isArray(attrResponse) && attrResponse.length > 0
					? attrResponse[0]
					: {};
				break;
			}

			case 'label': {
				const labelResponse = (await chatwootApiRequest.call(
					this,
					'GET',
					`/api/v1/accounts/${accountId}/labels`,
				)) as { payload?: unknown[] } | unknown[];
				const labels =
					(labelResponse as { payload?: unknown[] }).payload ||
					(labelResponse as unknown[]) ||
					[];
				sampleResponse = Array.isArray(labels) && labels.length > 0
					? labels[0]
					: {};
				break;
			}

			default:
				return [];
		}
	} catch {
		return [];
	}

	const fields = Object.keys(sampleResponse as Record<string, unknown>);

	return fields.sort().map((field) => ({
		name: field,
		value: field,
	}));
}
