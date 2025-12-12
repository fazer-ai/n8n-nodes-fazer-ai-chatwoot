import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId } from '../../shared/transport';
import type { KanbanStepOperation } from './types';

type ResourceLocatorParam = string | number | { mode: string; value: string };

function getResourceLocatorValue(param: ResourceLocatorParam): number {
	if (typeof param === 'object' && param.value !== undefined) {
		return Number(param.value);
	}
	return Number(param);
}

export async function executeKanbanStepOperation(
	context: IExecuteFunctions,
	operation: KanbanStepOperation,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'create':
			return createStep(context, itemIndex);
		case 'delete':
			return deleteStep(context, itemIndex);
		case 'getAll':
			return getAllSteps(context, itemIndex);
		case 'update':
			return updateStep(context, itemIndex);
	}
}

async function createStep(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);
	const name = context.getNodeParameter('stepName', itemIndex) as string;
	const additionalFields = context.getNodeParameter('stepAdditionalFields', itemIndex, {}) as IDataObject;

	const step: IDataObject = { name };

	if (additionalFields.description) step.description = additionalFields.description;
	if (additionalFields.color) step.color = additionalFields.color;
	if (additionalFields.cancelled !== undefined) step.cancelled = additionalFields.cancelled;

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps`,
		{ step },
	)) as IDataObject;
}

async function getAllSteps(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);

	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps`,
	)) as IDataObject;

	if (Array.isArray(response)) {
		return response as IDataObject[];
	}
	return (response.steps as IDataObject[]) ||
		(response.payload as IDataObject[]) ||
		[];
}

async function updateStep(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);
	const stepIdParam = context.getNodeParameter('stepId', itemIndex) as ResourceLocatorParam;
	const stepId = getResourceLocatorValue(stepIdParam);
	const updateFields = context.getNodeParameter('updateStepFields', itemIndex, {}) as IDataObject;

	const step: IDataObject = {};

	if (updateFields.name) step.name = updateFields.name;
	if (updateFields.description) step.description = updateFields.description;
	if (updateFields.color) step.color = updateFields.color;
	if (updateFields.cancelled !== undefined) step.cancelled = updateFields.cancelled;

	return (await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps/${stepId}`,
		{ step },
	)) as IDataObject;
}

async function deleteStep(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);
	const stepIdParam = context.getNodeParameter('stepId', itemIndex) as ResourceLocatorParam;
	const stepId = getResourceLocatorValue(stepIdParam);

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/kanban/boards/${boardId}/steps/${stepId}`,
	);

	return { success: true, deleted: stepId };
}
