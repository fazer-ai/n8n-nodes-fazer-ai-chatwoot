import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getInboxId, getKanbanBoardId, getTeamId } from '../shared/transport';
import {
	ChatwootAccount,
	ChatwootAgent,
	ChatwootContact,
	ChatwootConversation,
	ChatwootInbox,
	ChatwootKanbanBoard,
	ChatwootKanbanStep,
	ChatwootKanbanTask,
	ChatwootLabel,
	ChatwootPayloadResponse,
	ChatwootPayloadResponseWithData,
	ChatwootProfileResponse,
	ChatwootTeam,
	ChatwootTeamMember,
	ChatwootWebhook
} from './resourceMapping';

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
		name: `#${account.id} - ${account.name}`,
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
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
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
		name: `#${inbox.id} - ${inbox.name}`,
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
 * Get all WhatsApp Baileys and Z-API inboxes for the selected account (for resourceLocator)
 */
export async function searchWhatsappSpecialProvidersInboxes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
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
		name: `#${inbox.id} - ${inbox.name}`,
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
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	const inboxId = getInboxId.call(this, 0);
	if (accountId === '' || inboxId === '') {
		return { results: [] };
	}

	const page = paginationToken ? Number(paginationToken) : 1;

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/conversations`,
		undefined,
		{ q: filter || '', page, inbox_id: inboxId || undefined },
	)) as ChatwootPayloadResponseWithData<ChatwootConversation>;

	const results = response.data.payload.map(
		({ id, meta }: ChatwootConversation) => {
			const { name, email, phone_number } = meta.sender;
			return {
				name: `#${id} - ${name || email || phone_number || 'Unknown'}`,
				value: String(id),
			};
		},
	);

	return { results };
}

/**
 * Get all contacts for the selected account (for resourceLocator)
 */
export async function searchContacts(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
		return { results: [] };
	}

	let endpoint = `/api/v1/accounts/${accountId}/contacts`;
	if (filter) {
		endpoint += '/search';
	}

	const page = paginationToken ? Number(paginationToken) : 1;
	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		endpoint,
		undefined,
		{ q: filter || '', page },
	)) as ChatwootPayloadResponse<ChatwootContact>;

	const results = response.payload.map(
		(contact: ChatwootContact) => ({
			name: `#${contact.id} - ${contact.name || contact.email || 'Contact'}`,
			value: String(contact.id),
		}),
	);

	return { results };
}

/**
 * Get all agents for the selected account (for resourceLocator)
 */
export async function searchAgents(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/agents`,
	)) as ChatwootAgent[];
	const agents = response || [];

	let results = agents.map((agent: ChatwootAgent) => ({
		name: `#${agent.id} - ${agent.name || agent.email || 'Agent'}`,
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
 * Get all teams for the selected account (for resourceLocator)
 */
export async function searchTeams(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/teams`,
	)) as ChatwootTeam[];
	const teams = response || [];

	let results = teams.map((team: ChatwootTeam) => ({
		name: `#${team.id} - ${team.name}`,
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

/**
 * Get all members of the selected team (for resourceLocator/listSearch)
 */
export async function searchTeamMembers(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	const teamId = getTeamId.call(this, 0);
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
		name: `#${member.id} - ${member.name || member.email || 'Agent'}`,
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
 * Search labels for the selected account (for resourceLocator)
 */
export async function searchLabels(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
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
		name: `#${label.id} - ${label.title}`,
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

/**
 * Get all webhooks for the selected account (for resourceLocator)
 */
export async function searchWebhooks(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
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
			name: `#${webhook.id} - ${webhook.url}`,
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
 * Get all kanban boards for the selected account (for resourceLocator)
 */
export async function searchKanbanBoards(
	this: ILoadOptionsFunctions,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
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

	const results = boards.map((board: ChatwootKanbanBoard) => ({
		name: `#${board.id} - ${board.name}`,
		value: String(board.id),
	}));

	return { results };
}

/**
 * Get all kanban steps for the selected board (for resourceLocator)
 */
export async function searchKanbanSteps(
	this: ILoadOptionsFunctions,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	const boardId = getKanbanBoardId.call(this, 0);

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
		name: `#${step.id} - ` + (step.cancelled ? `(Cancelled) ` : '') + step.name + (step.description ? `: ${step.description}` : ''),
		value: String(step.id),
	}));

	return { results };
}

/**
 * Get all kanban tasks for the selected board (for resourceLocator)
 */
export async function searchKanbanTasks(
	this: ILoadOptionsFunctions,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	const boardId = getKanbanBoardId.call(this, 0);

	if (!accountId || !boardId) {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/tasks`,
		undefined,
		{ board_id: boardId },
	)) as { tasks?: ChatwootKanbanTask[] } | ChatwootKanbanTask[];

	const tasks =
		(response as { tasks?: ChatwootKanbanTask[] }).tasks ||
		(response as ChatwootKanbanTask[]) ||
		[];

	const results = tasks.map((task: ChatwootKanbanTask) => ({
		name: `#${task.id} - ${task.title}`,
		value: String(task.id),
	}));

	return { results };
}
