import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
	chatwootApiRequest,
	getAccountId,
	getConversationId,
} from '../../shared/transport';
import { MessageOperation } from './types';

export async function executeMessageOperation(
  context: IExecuteFunctions,
  operation: MessageOperation,
  itemIndex: number,
): Promise<INodeExecutionData> {
  switch (operation) {
    case 'send':
      return sendMessage(context, itemIndex);
    case 'getAll':
      return getAllMessages(context, itemIndex);
    case 'delete':
      return deleteMessage(context, itemIndex);
    case 'setTyping':
      return setTypingStatus(context, itemIndex);
    case 'updatePresence':
      return updatePresence(context, itemIndex);
  }
}

async function sendMessage(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);

	const content = context.getNodeParameter('content', itemIndex) as string;
	const messageType = context.getNodeParameter('messageType', itemIndex) as string;
	const isPrivate = context.getNodeParameter('private', itemIndex, false) as boolean;

	const body: IDataObject = {
		content,
		message_type: messageType,
		private: isPrivate,
	};

	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	if (additionalFields.content_type) {
		body.content_type = additionalFields.content_type;
	}
	if (additionalFields.content_attributes) {
		body.content_attributes = JSON.parse(additionalFields.content_attributes as string);
	}
	if (additionalFields.template_params) {
		body.template_params = JSON.parse(additionalFields.template_params as string);
	}

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
		body,
	) as IDataObject;

	return { json: result };
}

async function getAllMessages(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const options = context.getNodeParameter('options', itemIndex, {}) as IDataObject;

	const query: IDataObject = {};
	if (options.before) query.before = options.before;
	if (options.after) query.after = options.after;

	const response = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
		undefined,
		query,
	) as IDataObject;

	const result = (response.payload as IDataObject[]) || response;
	return { json: result as unknown as IDataObject };
}

async function deleteMessage(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const messageId = context.getNodeParameter('messageId', itemIndex) as number;

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages/${messageId}`,
	);

	return { json: { success: true } };
}

async function setTypingStatus(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const typingStatus = context.getNodeParameter('typingStatus', itemIndex) as string;

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_typing_status`,
		{ typing_status: typingStatus },
	) as IDataObject;

	return { json: result };
}

async function updatePresence(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/update_last_seen`,
	) as IDataObject;

	return { json: result };
}
