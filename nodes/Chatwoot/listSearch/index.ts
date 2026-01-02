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
	channel_type?: string;
	provider?: string;
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
	id:	number;
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

interface ChatwootKanbanBoard {
	id: number;
	name: string;
}

interface ChatwootKanbanStep {
	id: number;
	name: string;
	description: string,
	cancelled: boolean;
}

interface ChatwootKanbanTask {
	id: number;
	title: string;
}

function extractResourceLocatorValue(
	context: ILoadOptionsFunctions,
	paramName: string,
): string | null {
	try {
		const param = context.getNodeParameter(paramName, 0) as
			| string
			| { mode: string; value: string };

		if (!param) return null;
		if (typeof param === 'string') return param;
		if (typeof param === 'object' && param.value) return String(param.value);
		return null;
	} catch {
		//  NOTE: Parameter not found or not set - return null as fallback
		return null;
	}
}

/**
 * Get all accounts available to the user (for resourceLocator)
 */
export async function searchAccounts(
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
export async function searchInboxes(
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
 * Get all WhatsApp Baileys and Z-API inboxes for the selected account (for resourceLocator)
 */
export async function searchWhatsappSpecialProvidersInboxes(
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

	const filteredInboxes = (inboxes as ChatwootInbox[]).filter(
		(inbox: ChatwootInbox) =>
			inbox.channel_type === 'Channel::Whatsapp' && (inbox.provider === 'baileys' || inbox.provider === 'zapi'),
	);

	let results = filteredInboxes.map((inbox: ChatwootInbox) => ({
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

	return { results };
}

/**
 * Get all conversations for the selected account/inbox (for resourceLocator)
 */
export async function searchConversations(
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
export async function searchContacts(
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
export async function loadAgentsOptions(
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
 * Get all inboxes for the selected account (for loadOptions)
 */
export async function loadInboxesOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return [];
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes`,
	)) as ChatwootPayloadResponse<ChatwootInbox>;
	const inboxes = response.payload ||[];

	return (inboxes as ChatwootInbox[]).map((inbox: ChatwootInbox) => ({
		name: inbox.name,
		value: inbox.id,
	}));
}

/**
 * Get all agents for the selected account (for resourceLocator)
 */
export async function searchAgents(
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
		`/api/v1/accounts/${accountId}/agents`,
	)) as ChatwootAgent[];
	const agents = response || [];

	let results = agents.map((agent: ChatwootAgent) => ({
		name: agent.name || agent.email || `Agent ${agent.id}`,
		value: String(agent.id),
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
 * Get all teams for the selected account (for loadOptions)
 */
export async function loadTeamsOptions(
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
 * Get all teams for the selected account (for resourceLocator)
 */
export async function searchTeams(
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
		`/api/v1/accounts/${accountId}/teams`,
	)) as ChatwootTeam[];
	const teams = response || [];

	let results = teams.map((team: ChatwootTeam) => ({
		name: team.name,
		value: String(team.id),
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

interface ChatwootTeamMember {
	id: number;
	name?: string;
	email?: string;
}

/**
 * Get all members of the selected team (for loadOptions)
 */
export async function loadTeamMembersOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	const teamId = extractResourceLocatorValue(this, 'teamId');
	if (!accountId || !teamId) {
		return [];
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`,
	)) as ChatwootTeamMember[];
	const members = response || [];

	return members.map((member: ChatwootTeamMember) => ({
		name: member.name || member.email || `Agent ${member.id}`,
		value: member.id,
	}));
}

/**
 * Get all members of the selected team (for resourceLocator/listSearch)
 */
export async function searchTeamMembers(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	const teamId = extractResourceLocatorValue(this, 'teamId');
	if (!accountId || !teamId) {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`,
	)) as ChatwootTeamMember[];
	const members = response || [];

	let results = members.map((member: ChatwootTeamMember) => ({
		name: member.name || member.email || `Agent ${member.id}`,
		value: String(member.id),
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
 * Get all labels for the selected account (for loadOptions)
 */
export async function loadLabelsOptions(
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
 * Search labels for the selected account (for resourceLocator)
 */
export async function searchLabels(
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
		`/api/v1/accounts/${accountId}/labels`,
	)) as ChatwootPayloadResponse<ChatwootLabel> | ChatwootLabel[];
	const labels =
		(response as ChatwootPayloadResponse<ChatwootLabel>).payload ||
		(response as ChatwootLabel[]) ||
		[];

	let results = (labels as ChatwootLabel[]).map((label: ChatwootLabel) => ({
		name: label.title,
		value: String(label.id),
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

interface ChatwootCustomAttributeDefinition {
	id: number;
	attribute_key: string;
	attribute_display_name: string;
	attribute_model: number;
}

export async function loadContactCustomAttributeDefinitionsOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return [];
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
		undefined,
		{ attribute_model: 'contact_attribute' },
	)) as ChatwootCustomAttributeDefinition[];

	return (response || []).map((attr: ChatwootCustomAttributeDefinition) => ({
		name: attr.attribute_display_name,
		value: attr.attribute_key,
	}));
}

/**
 * Get custom attribute definitions based on selected model
 */
export async function loadCustomAttributeDefinitionsOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return [];
	}

	const attributeModel = this.getNodeParameter('attributeModel', 0) as string;

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
		undefined,
		{ attribute_model: attributeModel },
	)) as ChatwootCustomAttributeDefinition[];

	return (response || []).map((attr: ChatwootCustomAttributeDefinition) => ({
		name: attr.attribute_display_name,
		value: attr.id,
	}));
}

/**
 * Get all webhooks for the selected account (for resourceLocator)
 */
export async function searchWebhooks(
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
export async function loadResponseFieldsOptions(
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
		// NOTE: API call failed - return empty fields list as graceful fallback
		return [];
	}

	const fields = Object.keys(sampleResponse as Record<string, unknown>);

	return fields.sort().map((field) => ({
		name: field,
		value: field,
	}));
}

export async function searchKanbanBoards(
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
		`/api/v1/accounts/${accountId}/kanban/boards`,
	)) as { boards?: ChatwootKanbanBoard[] } | ChatwootKanbanBoard[];

	const boards =
		(response as { boards?: ChatwootKanbanBoard[] }).boards ||
		(response as ChatwootKanbanBoard[]) ||
		[];

	let results = boards.map((board: ChatwootKanbanBoard) => ({
		name: board.name,
		value: String(board.id),
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

export async function searchKanbanSteps(
	this: ILoadOptionsFunctions,
): Promise<INodeListSearchResult> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	const boardId = extractResourceLocatorValue(this, 'kanbanBoardId');

	if (!accountId || !boardId) {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps`,
	)) as { steps?: ChatwootKanbanStep[] } | ChatwootKanbanStep[];

	const steps =
		(response as { steps?: ChatwootKanbanStep[] }).steps ||
		(response as ChatwootKanbanStep[]) ||
		[];

	const results = steps.map((step: ChatwootKanbanStep) => ({
		name: (step.cancelled ? `(Cancelled) ` : '') + step.name + (step.description ? `: ${step.description}` : ''),
		value: String(step.id),
	}));

	return { results };
}

export async function searchKanbanTasks(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = extractResourceLocatorValue(this, 'accountId');
	if (!accountId) {
		return { results: [] };
	}

	const boardId = extractResourceLocatorValue(this, 'boardId');

	let endpoint = `/api/v1/accounts/${accountId}/kanban/tasks`;
	if (boardId) {
		endpoint += `?board_id=${boardId}`;
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		endpoint,
	)) as { tasks?: ChatwootKanbanTask[] } | ChatwootKanbanTask[];

	const tasks =
		(response as { tasks?: ChatwootKanbanTask[] }).tasks ||
		(response as ChatwootKanbanTask[]) ||
		[];

	let results = tasks.map((task: ChatwootKanbanTask) => ({
		name: task.title,
		value: String(task.id),
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
