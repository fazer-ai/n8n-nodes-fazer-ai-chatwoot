import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId } from '../../shared/transport';
import type { KanbanBoardOperation } from './types';

type ResourceLocatorParam = string | number | { mode: string; value: string };

function getResourceLocatorValue(param: ResourceLocatorParam): number {
	if (typeof param === 'object' && param.value !== undefined) {
		return Number(param.value);
	}
	return Number(param);
}

function parseCommaSeparatedIds(value: string): number[] {
	if (!value || value.trim() === '') return [];
	return value.split(',').map((id) => Number(id.trim())).filter((id) => !isNaN(id));
}

export async function executeKanbanBoardOperation(
	context: IExecuteFunctions,
	operation: KanbanBoardOperation,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'create':
			return createBoard(context, itemIndex);
		case 'delete':
			return deleteBoard(context, itemIndex);
		case 'get':
			return getBoard(context, itemIndex);
		case 'getAll':
			return getAllBoards(context, itemIndex);
		case 'update':
			return updateBoard(context, itemIndex);
		case 'updateAgents':
			return updateBoardAgents(context, itemIndex);
		case 'updateInboxes':
			return updateBoardInboxes(context, itemIndex);
	}
}

async function createBoard(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const name = context.getNodeParameter('boardName', itemIndex) as string;
	const additionalFields = context.getNodeParameter('boardAdditionalFields', itemIndex, {}) as IDataObject;

	const board: IDataObject = { name };

	if (additionalFields.description) {
		board.description = additionalFields.description;
	}
	if (additionalFields.settings) {
		board.settings = typeof additionalFields.settings === 'string'
			? JSON.parse(additionalFields.settings)
			: additionalFields.settings;
	}
	if (additionalFields.inbox_ids) {
		board.inbox_ids = parseCommaSeparatedIds(additionalFields.inbox_ids as string);
	}

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/boards`,
		{ board },
	)) as IDataObject;
}

async function getBoard(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);

	return (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}`,
	)) as IDataObject;
}

async function getAllBoards(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);
	const filters = context.getNodeParameter('boardFilters', itemIndex, {}) as IDataObject;

	const query: IDataObject = {};
	if (filters.sort) query.sort = filters.sort;
	if (filters.order) query.order = filters.order;

	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/boards`,
		undefined,
		query,
	)) as IDataObject;

	if (Array.isArray(response)) {
		return response as IDataObject[];
	}
	return (response.boards as IDataObject[]) ||
		(response.payload as IDataObject[]) ||
		[];
}

async function updateBoard(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);
	const updateFields = context.getNodeParameter('updateBoardFields', itemIndex, {}) as IDataObject;

	const board: IDataObject = {};

	if (updateFields.name) board.name = updateFields.name;
	if (updateFields.description) board.description = updateFields.description;
	if (updateFields.settings) {
		board.settings = typeof updateFields.settings === 'string'
			? JSON.parse(updateFields.settings)
			: updateFields.settings;
	}
	if (updateFields.inbox_ids) {
		board.inbox_ids = parseCommaSeparatedIds(updateFields.inbox_ids as string);
	}

	return (await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}`,
		{ board },
	)) as IDataObject;
}

async function deleteBoard(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}`,
	);

	return { success: true, deleted: boardId };
}

async function updateBoardAgents(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);
	const agentIdsStr = context.getNodeParameter('agentIds', itemIndex) as string;
	const agentIds = parseCommaSeparatedIds(agentIdsStr);

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/update_agents`,
		{ agent_ids: agentIds },
	)) as IDataObject;
}

async function updateBoardInboxes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);
	const inboxIdsStr = context.getNodeParameter('inboxIds', itemIndex) as string;
	const inboxIds = parseCommaSeparatedIds(inboxIdsStr);

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/update_inboxes`,
		{ inbox_ids: inboxIds },
	)) as IDataObject;
}
