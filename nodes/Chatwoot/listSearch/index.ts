import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodePropertyOptions,
} from 'n8n-workflow';
import { chatwootApiRequest } from '../shared/transport';

// Interfaces para os tipos de resposta da API
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

	// Apply filter if provided
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

	// Apply filter if provided
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

	// Apply filter if provided
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

	// Apply filter if provided
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

	// Apply filter if provided
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
