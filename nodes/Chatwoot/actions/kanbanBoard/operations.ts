import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getKanbanBoardId } from '../../shared/transport';
import type { KanbanBoardOperation } from './types';

export async function executeKanbanBoardOperation(
	context: IExecuteFunctions,
	operation: KanbanBoardOperation,
	itemIndex: number,
): Promise<INodeExecutionData> {
	switch (operation) {
		case 'create':
			return createBoard(context, itemIndex);
		case 'delete':
			return deleteBoard(context, itemIndex);
		case 'get':
			return getBoard(context, itemIndex);
		case 'list':
			return listBoards(context, itemIndex);
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
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const name = context.getNodeParameter('name', itemIndex);
	const description = context.getNodeParameter('description', itemIndex, '');
	const automations = context.getNodeParameter('automations', itemIndex, {}) as IDataObject;

	const body = {name, description}
	if(automations.settings){
		Object.assign(body, {settings: automations.settings});
	}

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/boards`,
		body,
	) as IDataObject;

	return { json: result };
}

async function getBoard(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}`,
	) as IDataObject;

	return { json: result };
}

async function listBoards(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const sort = context.getNodeParameter('sort', itemIndex);
	const order = context.getNodeParameter('order', itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/boards`,
		undefined,
		{sort, order},
	) as IDataObject;

	return { json: result };
}

async function updateBoard(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);
	const name = context.getNodeParameter('name', itemIndex);
	const description = context.getNodeParameter('description', itemIndex, '');
	const automations = context.getNodeParameter('automations', itemIndex, {}) as IDataObject;

	const body = {name, description}
	if(automations.settings){
		Object.assign(body, {settings: automations.settings});
	}

	const result = await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}`,
		body,
	) as IDataObject;

	return { json: result };
}

async function deleteBoard(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}`,
	) as IDataObject;

	return { json: result };
}

async function updateBoardAgents(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);
	const agentIds = context.getNodeParameter('agentIds', itemIndex) as number[];

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/update_agents`,
		{ agent_ids: agentIds },
	) as IDataObject;

	return { json: result };
}

async function updateBoardInboxes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);
	const inboxIds = context.getNodeParameter('inboxIds', itemIndex) as number[];

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/update_inboxes`,
		{ inbox_ids: inboxIds },
	) as IDataObject;

	return { json: result };
}
