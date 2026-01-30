import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getChatwootBaseUrl, getConversationId, getInboxId, getKanbanBoardId, getMessageId, getTeamId } from '../shared/transport';
import {
	ChatwootAccount,
	ChatwootAgent,
	ChatwootAttachment,
	ChatwootContact,
	ChatwootConversation,
	ChatwootInbox,
	ChatwootKanbanBoard,
	ChatwootKanbanStep,
	ChatwootKanbanTask,
	ChatwootLabel,
	ChatwootMessage,
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
	const baseUrl = await getChatwootBaseUrl.call(this);

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		'/api/v1/profile',
	)) as ChatwootProfileResponse;
	const accounts = response.accounts || [];

	let results = accounts.map((account: ChatwootAccount) => ({
		name: `#${account.id} - ${account.name}`,
		value: String(account.id),
		url: `${baseUrl}/app/accounts/${account.id}/dashboard`,
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

	const baseUrl = await getChatwootBaseUrl.call(this);

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
		url: `${baseUrl}/app/accounts/${accountId}/settings/inboxes/${inbox.id}`,
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

	const baseUrl = await getChatwootBaseUrl.call(this);

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
		url: `${baseUrl}/app/accounts/${accountId}/settings/inboxes/${inbox.id}`,
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

	const baseUrl = await getChatwootBaseUrl.call(this);
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
				url: `${baseUrl}/app/accounts/${accountId}/conversations/${id}`,
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

	const baseUrl = await getChatwootBaseUrl.call(this);

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
		{
			q: filter || '',
			page,
			sort: '-last_activity_at',
			include_contact_inboxes: false,
		},
	)) as ChatwootPayloadResponse<ChatwootContact>;

	const results = response.payload.map(
		(contact: ChatwootContact) => ({
			name: `#${contact.id} - ${contact.name || contact.email || 'Contact'}`,
			value: String(contact.id),
			url: `${baseUrl}/app/accounts/${accountId}/contacts/${contact.id}`,
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

	const baseUrl = await getChatwootBaseUrl.call(this);

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
		url: `${baseUrl}/app/accounts/${accountId}/kanban/boards/${board.id}`,
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

	const baseUrl = await getChatwootBaseUrl.call(this);

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps`,
	)) as { steps?: ChatwootKanbanStep[] } | ChatwootKanbanStep[];

	const steps =
		(response as { steps?: ChatwootKanbanStep[] }).steps ||
		(response as ChatwootKanbanStep[]) ||
		[];

	const results = steps.map((step: ChatwootKanbanStep, index: number) => ({
		name: `Step ${index + 1} - ` + (step.cancelled ? `(Cancelled) ` : '') + step.name + (step.description ? `: ${step.description}` : ''),
		value: String(step.id),
		url: `${baseUrl}/app/accounts/${accountId}/kanban/boards/${boardId}`,
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

	const baseUrl = await getChatwootBaseUrl.call(this);

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/tasks`,
		undefined,
		{ board_id: boardId, sort: 'updated_at', order: 'desc' },
	)) as { tasks?: ChatwootKanbanTask[] } | ChatwootKanbanTask[];

	const tasks =
		(response as { tasks?: ChatwootKanbanTask[] }).tasks ||
		(response as ChatwootKanbanTask[]) ||
		[];

	const results = tasks.map((task: ChatwootKanbanTask) => {
		let suffix = '';
		// Always show step name if available
		if (task.board?.steps && task.board_step_id) {
			const stepIndex = task.board.steps.findIndex((s) => s.id === task.board_step_id);
			if (stepIndex !== -1) {
				const step = task.board.steps[stepIndex];
				suffix = ` (Step ${stepIndex + 1}: ${step.name})`;
			}
		}
		// Append status if cancelled/completed
		if (task.status === 'cancelled' || task.status === 'completed') {
			suffix += ` [${task.status}]`;
		}
		return {
			name: `#${task.id} - ${task.title}${suffix}`,
			value: String(task.id),
			url: `${baseUrl}/app/accounts/${accountId}/kanban/boards/${boardId}`,
		};
	});

	return { results };
}

/**
 * Get messages for the selected conversation (for resourceLocator)
 */
export async function searchMessages(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	const conversationId = getConversationId.call(this, 0);

	if (!accountId || !conversationId) {
		return { results: [] };
	}

	const baseUrl = await getChatwootBaseUrl.call(this);

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
	)) as { payload?: ChatwootMessage[] };

	const messages = (response.payload || []).reverse();

	let results = messages.map((message: ChatwootMessage) => {
		const preview = message.content
			? message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
			: '(no content)';
		return {
			name: `Message #${message.id} - ${preview}`,
			value: String(message.id),
			url: `${baseUrl}/app/accounts/${accountId}/conversations/${conversationId}?messageId=${message.id}`,
		};
	});

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
 * Get attachments for the selected conversation (for resourceLocator)
 */
export async function searchAttachments(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	const conversationId = getConversationId.call(this, 0);
	let messageId: string | undefined;
	try {
		messageId = getMessageId.call(this, 0);
	} catch {
		// Message not selected yet
	}

	if (!accountId || !conversationId) {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/attachments`,
	)) as { payload?: ChatwootAttachment[] };

	let attachments = (response.payload || []).reverse();

	if (messageId) {
		attachments = attachments.filter((a) => String(a.message_id) === messageId);
	}

	let results = attachments.map((attachment: ChatwootAttachment) => {
		const fileName = decodeURIComponent(attachment.data_url?.split('/').pop() || 'attachment');
		const type = attachment.file_type || 'file';
		return {
			name: `#${attachment.id} - ${type}: ${fileName}`,
			value: String(attachment.id),
		};
	});

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
