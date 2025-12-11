import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
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
): Promise<IDataObject | IDataObject[]> {
  switch (operation) {
    case 'create':
      return createConversation(context, itemIndex);
    case 'get':
      return getConversation(context, itemIndex);
    case 'getAll':
      return getAllConversations(context, itemIndex);
    case 'toggleStatus':
      return toggleConversationStatus(context, itemIndex);
    case 'assignAgent':
      return assignAgent(context, itemIndex);
    case 'assignTeam':
      return assignTeam(context, itemIndex);
    case 'addLabels':
      return addLabels(context, itemIndex);
  }
}

async function createConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const useRawJson = context.getNodeParameter('useRawJson', itemIndex, false) as boolean;

	let body: IDataObject;
	if (useRawJson) {
		body = JSON.parse(context.getNodeParameter('jsonBody', itemIndex, '{}') as string);
	} else {
		const contactId = getContactId.call(context, itemIndex);
		body = {
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
	}

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations`,
		body,
	)) as IDataObject;
}

async function getConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);

	return (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
	)) as IDataObject;
}

async function getAllConversations(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
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

	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations`,
		undefined,
		query,
	)) as IDataObject;

	const dataObj = response.data as IDataObject | undefined;
	return dataObj?.payload as IDataObject[] ||
		response.payload as IDataObject[] ||
		response;
}

async function toggleConversationStatus(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const status = context.getNodeParameter('status', itemIndex) as string;

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_status`,
		{ status },
	)) as IDataObject;
}

async function assignAgent(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const agentId = context.getNodeParameter('agentId', itemIndex) as number;

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
		{ assignee_id: agentId },
	)) as IDataObject;
}

async function assignTeam(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const teamId = context.getNodeParameter('teamId', itemIndex) as number;

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
		{ team_id: teamId },
	)) as IDataObject;
}

async function addLabels(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const labels = context.getNodeParameter('labels', itemIndex) as string[];

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
		{ labels },
	)) as IDataObject;
}
