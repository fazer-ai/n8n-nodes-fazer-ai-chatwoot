import { type IDataObject, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getKanbanBoardId, getKanbanStepId, getKanbanTaskId } from '../../shared/transport';
import type { KanbanTaskOperation } from './types';

export async function executeKanbanTaskOperation(
	context: IExecuteFunctions,
	operation: KanbanTaskOperation,
	itemIndex: number,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	switch (operation) {
		case 'create':
			return createTask(context, itemIndex);
		case 'delete':
			return deleteTask(context, itemIndex);
		case 'get':
			return getTask(context, itemIndex);
		case 'list':
			return listTasks(context, itemIndex);
		case 'move':
			return moveTask(context, itemIndex);
		case 'update':
			return updateTask(context, itemIndex);
	}
}

async function createTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);
	const stepId = getKanbanStepId.call(context, itemIndex);
	const title = context.getNodeParameter('title', itemIndex);
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {});

	const task: IDataObject = {
		title,
		board_id: boardId,
		board_step_id: stepId,
		...additionalFields,
	};

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/tasks`,
		{ task },
	) as IDataObject;

	return { json: result };
}

async function getTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const taskId = getKanbanTaskId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/tasks/${taskId}`,
	) as IDataObject;

	return { json: result };
}

async function listTasks(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);
	const filters = context.getNodeParameter('taskFilters', itemIndex, {}) as IDataObject;

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/tasks`,
		undefined,
		{
			board_id: boardId,
			...filters
		},
	) as IDataObject[];

	return result.map((task) => ({ json: task }));
}

async function updateTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const taskId = getKanbanTaskId.call(context, itemIndex);
	const title = context.getNodeParameter('title', itemIndex);
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {});

	const task: IDataObject = {
		title,
		...additionalFields,
	};

	const result = await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/kanban/tasks/${taskId}`,
		{ task },
	) as IDataObject;

	return { json: result };
}

async function moveTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const taskId = getKanbanTaskId.call(context, itemIndex);
	const stepId = getKanbanStepId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/tasks/${taskId}/move`,
		{ board_step_id: stepId, insert_before_task_id: null },
	) as IDataObject;

	return { json: result };
}

async function deleteTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const taskId = getKanbanTaskId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/kanban/tasks/${taskId}`,
	) as IDataObject;

	return { json: result };
}
