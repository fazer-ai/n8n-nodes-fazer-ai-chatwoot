import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
	chatwootApiRequest,
	getAccountId,
	getInboxId,
	getConversationId,
	getContactId,
} from '../../shared/transport';
import { ConversationOperation } from './types';

export async function executeConversationOperation(
	context: IExecuteFunctions,
	operation: ConversationOperation,
	itemIndex: number,
): Promise<INodeExecutionData> {
  switch (operation) {
    case 'create':
      return createConversation(context, itemIndex);
    case 'get':
      return getConversation(context, itemIndex);
    case 'list':
      return listConversations(context, itemIndex);
    case 'toggleStatus':
      return toggleConversationStatus(context, itemIndex);
    case 'assignAgent':
      return assignConversationAgent(context, itemIndex);
    case 'assignTeam':
      return assignConversationTeam(context, itemIndex);
    case 'updateLabels':
      return setConversationLabels(context, itemIndex);
    case 'setCustomAttributes':
      return setConversationCustomAttributes(context, itemIndex);
    case 'setPriority':
      return setConversationPriority(context, itemIndex);
		default:
			throw new Error(`The operation "${operation}" is not implemented yet!`);
  }
}

async function createConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	const body: IDataObject = {
		contact_id: contactId,
	};

	const inboxId = getInboxId.call(context, itemIndex);
	if (inboxId) {
		body.inbox_id = inboxId;
	}

	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	Object.assign(body, additionalFields);

	if (typeof body.customAttributes === 'string') {
		body.custom_attributes = JSON.parse(body.customAttributes as string);
		delete body.customAttributes;
	}

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations`,
			body,
		)) as IDataObject
	};
}

async function getConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
		)) as IDataObject
	};
}

async function listConversations(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;

	const query: IDataObject = {};
	if (filters.status) query.status = filters.status;
	if (filters.assignee_type) query.assignee_type = filters.assignee_type;
	if (filters.page) query.page = filters.page;

	const inboxId = getInboxId.call(context, itemIndex);
	if (inboxId) {
		query.inbox_id = inboxId;
	}

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/conversations`,
			undefined,
			query,
		)) as IDataObject
	};
}

async function toggleConversationStatus(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const status = context.getNodeParameter('status', itemIndex);
	const snoozeUntilRaw = context.getNodeParameter('snoozeUntil', itemIndex, null) as string | null;

	const body: IDataObject = { status };

	if (snoozeUntilRaw) {
		const snoozeDate = new Date(snoozeUntilRaw);
		body.snoozed_until = Math.floor(snoozeDate.getTime() / 1000);
	}

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_status`,
			body,
		)) as IDataObject
	};
}

async function assignConversationAgent(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const agentId = context.getNodeParameter('agentId', itemIndex) as number;

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
			{ assignee_id: agentId },
		)) as IDataObject
	};
}

async function assignConversationTeam(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const teamId = context.getNodeParameter('teamId', itemIndex) as number;

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
			{ team_id: teamId },
		)) as IDataObject
	};
}

async function setConversationLabels(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const labels = context.getNodeParameter('labels', itemIndex) as string[];

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
			{ labels },
		)) as IDataObject
	};
}

async function setConversationCustomAttributes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const customAttributes = JSON.parse(
		context.getNodeParameter('customAttributes', itemIndex) as string,
	);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/custom_attributes`,
			{ custom_attributes: customAttributes },
		)) as IDataObject
	};
}

async function setConversationPriority(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const priorityValue = context.getNodeParameter('priority', itemIndex) as string;

	const priority = priorityValue === 'null' ? null : priorityValue;

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_priority`,
			{ priority },
		)) as IDataObject
	};
}
