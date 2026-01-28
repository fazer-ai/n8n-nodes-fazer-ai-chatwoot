import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getKanbanBoardId, getKanbanStepId } from '../../shared/transport';
import type { KanbanStepOperation } from './types';

export async function executeKanbanStepOperation(
	context: IExecuteFunctions,
	operation: KanbanStepOperation,
	itemIndex: number,
): Promise<INodeExecutionData> {
	switch (operation) {
		case 'create':
			return createStep(context, itemIndex);
		case 'delete':
			return deleteStep(context, itemIndex);
		case 'list':
			return listSteps(context, itemIndex);
		case 'update':
			return updateStep(context, itemIndex);
	}
}

async function createStep(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);
	const name = context.getNodeParameter('name', itemIndex);
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps`,
		{ step:
			{
				name,
				description: additionalFields.description ?? '',
				color: additionalFields.color ?? `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
				cancelled: additionalFields.cancelled ?? false,
			}
		},
	) as IDataObject;

	return { json: result };
}

async function listSteps(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps`,
	) as IDataObject;

	return { json: result };
}

async function updateStep(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);
	const stepId = getKanbanStepId.call(context, itemIndex);
	const updateFields = context.getNodeParameter('updateStepFields', itemIndex, {}) as IDataObject;

	const step: IDataObject = {};

	if (updateFields.name) step.name = updateFields.name;
	if (updateFields.description) step.description = updateFields.description;
	if (updateFields.color) step.color = updateFields.color;
	if (updateFields.cancelled !== undefined) step.cancelled = updateFields.cancelled;

	const result = await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps/${stepId}`,
		{ step },
	) as IDataObject;

	return { json: result };
}

async function deleteStep(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardId = getKanbanBoardId.call(context, itemIndex);
	const stepId = getKanbanStepId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps/${stepId}`,
	) as IDataObject;

	return { json: result };
}
