import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId } from '../../shared/transport';
import type { KanbanTaskOperation } from './types';

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

export async function executeKanbanTaskOperation(
	context: IExecuteFunctions,
	operation: KanbanTaskOperation,
	itemIndex: number,
): Promise<INodeExecutionData> {
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
	const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
	const boardId = getResourceLocatorValue(boardIdParam);
	const stepIdParam = context.getNodeParameter('stepId', itemIndex) as ResourceLocatorParam;
	const stepId = getResourceLocatorValue(stepIdParam);
	const title = context.getNodeParameter('taskTitle', itemIndex) as string;
	const additionalFields = context.getNodeParameter('taskAdditionalFields', itemIndex, {}) as IDataObject;

	const task: IDataObject = {
		title,
		board_id: boardId,
		board_step_id: stepId,
	};

	if (additionalFields.description) task.description = additionalFields.description;
	if (additionalFields.priority) task.priority = additionalFields.priority;
	if (additionalFields.start_date) task.start_date = additionalFields.start_date;
	if (additionalFields.end_date) task.end_date = additionalFields.end_date;
	if (additionalFields.contact_ids) {
		task.contact_ids = parseCommaSeparatedIds(additionalFields.contact_ids as string);
	}
	if (additionalFields.conversation_ids) {
		task.conversation_ids = parseCommaSeparatedIds(additionalFields.conversation_ids as string);
	}
	if (additionalFields.assigned_agent_ids) {
		task.assigned_agent_ids = parseCommaSeparatedIds(additionalFields.assigned_agent_ids as string);
	}

	const body: IDataObject = { task };
	if (additionalFields.insert_before_task_id && Number(additionalFields.insert_before_task_id) > 0) {
		body.insert_before_task_id = additionalFields.insert_before_task_id;
	}

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/kanban/tasks`,
			body,
		)) as IDataObject
	};
}

async function getTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const taskIdParam = context.getNodeParameter('taskId', itemIndex) as ResourceLocatorParam;
	const taskId = getResourceLocatorValue(taskIdParam);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/kanban/tasks/${taskId}`,
		)) as IDataObject
	};
}

async function listTasks(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const filters = context.getNodeParameter('taskFilters', itemIndex, {}) as IDataObject;

	const query: IDataObject = {};

	try {
		const boardIdParam = context.getNodeParameter('boardId', itemIndex) as ResourceLocatorParam;
		if (boardIdParam && (typeof boardIdParam === 'object' ? boardIdParam.value : boardIdParam)) {
			query.board_id = getResourceLocatorValue(boardIdParam);
		}
	} catch {
		// NOTE: boardId is optional for getAllTasks - parameter may not be set
	}

	if (filters.board_step_id && Number(filters.board_step_id) > 0) {
		query.board_step_id = filters.board_step_id;
	}
	if (filters.priority) query.priority = filters.priority;
	if (filters.sort) query.sort = filters.sort;
	if (filters.order) query.order = filters.order;
	if (filters.assigned_agent_ids) {
		const agentIds = parseCommaSeparatedIds(filters.assigned_agent_ids as string);
		agentIds.forEach((id, index) => {
			query[`assigned_agent_ids[${index}]`] = id;
		});
	}

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/kanban/tasks`,
			undefined,
			query,
		)) as IDataObject
	};
}

async function updateTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const taskIdParam = context.getNodeParameter('taskId', itemIndex) as ResourceLocatorParam;
	const taskId = getResourceLocatorValue(taskIdParam);
	const updateFields = context.getNodeParameter('taskUpdateFields', itemIndex, {}) as IDataObject;

	const task: IDataObject = {};

	if (updateFields.title) task.title = updateFields.title;
	if (updateFields.description) task.description = updateFields.description;
	if (updateFields.priority) task.priority = updateFields.priority;
	if (updateFields.start_date) task.start_date = updateFields.start_date;
	if (updateFields.end_date) task.end_date = updateFields.end_date;
	if (updateFields.board_step_id && Number(updateFields.board_step_id) > 0) {
		task.board_step_id = updateFields.board_step_id;
	}
	if (updateFields.contact_ids) {
		task.contact_ids = parseCommaSeparatedIds(updateFields.contact_ids as string);
	}
	if (updateFields.conversation_ids) {
		task.conversation_ids = parseCommaSeparatedIds(updateFields.conversation_ids as string);
	}
	if (updateFields.assigned_agent_ids) {
		task.assigned_agent_ids = parseCommaSeparatedIds(updateFields.assigned_agent_ids as string);
	}

	return {
		json: (await chatwootApiRequest.call(
			context,
			'PUT',
			`/api/v1/accounts/${accountId}/kanban/tasks/${taskId}`,
			{ task },
		)) as IDataObject
	};
}

async function moveTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const taskIdParam = context.getNodeParameter('taskId', itemIndex) as ResourceLocatorParam;
	const taskId = getResourceLocatorValue(taskIdParam);

	const body: IDataObject = {};

	try {
		const targetStepIdParam = context.getNodeParameter('targetStepId', itemIndex) as ResourceLocatorParam;
		if (targetStepIdParam && (typeof targetStepIdParam === 'object' ? targetStepIdParam.value : targetStepIdParam)) {
			body.board_step_id = getResourceLocatorValue(targetStepIdParam);
		}
	} catch {
		// NOTE: targetStepId is optional - task can be moved by position only
	}

	const insertBeforeTaskId = context.getNodeParameter('insertBeforeTaskId', itemIndex, 0) as number;
	if (insertBeforeTaskId > 0) {
		body.insert_before_task_id = insertBeforeTaskId;
	}

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/kanban/tasks/${taskId}/move`,
			body,
		)) as IDataObject
	};
}

async function deleteTask(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const taskIdParam = context.getNodeParameter('taskId', itemIndex) as ResourceLocatorParam;
	const taskId = getResourceLocatorValue(taskIdParam);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'DELETE',
			`/api/v1/accounts/${accountId}/kanban/tasks/${taskId}`,
		)) as IDataObject
	};
}
