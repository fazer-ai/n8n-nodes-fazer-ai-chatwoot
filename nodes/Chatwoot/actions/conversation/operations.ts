import { NodeOperationError, type IDataObject, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
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
		case 'sendMessage':
			return sendMessageToConversation(context, itemIndex);
		case 'sendFile':
			throw new NodeOperationError(
				context.getNode(),
				'The "Send File" operation is not implemented yet.',
			);
		case 'listMessages':
			throw new NodeOperationError(
				context.getNode(),
				'The "List Messages" operation is not implemented yet.',
			);
    case 'assignAgent':
      return assignConversationAgent(context, itemIndex);
    case 'assignTeam':
      return assignConversationTeam(context, itemIndex);
		case 'addLabels':
			return addLabelsToConversation(context, itemIndex);
		case 'removeLabels':
			return removeLabelsFromConversation(context, itemIndex);
    case 'updateLabels':
      return setConversationLabels(context, itemIndex);
    case 'toggleStatus':
      return toggleConversationStatus(context, itemIndex);
    case 'setPriority':
      return setConversationPriority(context, itemIndex);
    case 'setCustomAttributes':
      return setConversationCustomAttributes(context, itemIndex);
		case 'destroyCustomAttributes':
			throw new NodeOperationError(
				context.getNode(),
				'The "Destroy Custom Attributes" operation is not implemented yet.',
			);
		case 'updateLastSeen':
			throw new NodeOperationError(
				context.getNode(),
				'The "Update Last Seen" operation is not implemented yet.',
			);
		case 'updatePresence':
			throw new NodeOperationError(
				context.getNode(),
				'The "Update Presence" operation is not implemented yet.',
			);
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

async function addLabelsToConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const labelsToAdd = context.getNodeParameter('labels', itemIndex) as string[];

	const conversation = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
	)) as IDataObject;

	const currentLabels = (conversation.labels as string[]) || [];
	const newLabels = [...new Set([...currentLabels, ...labelsToAdd])];

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
			{ labels: newLabels },
		)) as IDataObject
	};
}

async function removeLabelsFromConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const labelsToRemove = context.getNodeParameter('labels', itemIndex) as string[];

	const conversation = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
	)) as IDataObject;

	const currentLabels = (conversation.labels as string[]) || [];
	const labelsToRemoveSet = new Set(labelsToRemove);
	const newLabels = currentLabels.filter((label) => !labelsToRemoveSet.has(label));

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
			{ labels: newLabels },
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

async function sendMessageToConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const content = context.getNodeParameter('content', itemIndex) as string;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	let contentAttributes: IDataObject | undefined;
	if (additionalFields.content_attributes) {
		const contentAttrsConfig = additionalFields.content_attributes as IDataObject;
		const values = contentAttrsConfig.values as IDataObject;

		if (values) {
			const inputMethod = values.inputMethod as string;

			if (inputMethod === 'json') {
				// JSON mode - parse the JSON string
				const jsonString = values.json as string;
				if (jsonString && jsonString.trim() !== '{}' && jsonString.trim() !== '') {
					try {
						contentAttributes = JSON.parse(jsonString);
					} catch (error) {
						throw new NodeOperationError(
							context.getNode(),
							`Invalid JSON in content attributes: ${(error as Error).message}`,
						);
					}
				}
			} else if (inputMethod === 'pairs') {
				// Key-Value Pairs mode
				const attributes = values.attributes as IDataObject;
				if (attributes && attributes.attribute) {
					const pairs = attributes.attribute as Array<{ name: string; value: string }>;
					if (Array.isArray(pairs) && pairs.length > 0) {
						contentAttributes = {};
						for (const pair of pairs) {
							if (pair.name && pair.name.trim() !== '') {
								contentAttributes[pair.name] = pair.value;
							}
						}
					}
				}
			}
		}
	}

	if (additionalFields.is_reaction) {
		if (!contentAttributes) {
			contentAttributes = {};
		}
		contentAttributes.is_reaction = true;
	}

	if(additionalFields.split_message) {
		const splitChar = (additionalFields.split_character as string) ?? '\n\n';
		const messages = content.split(splitChar).filter((msg: string) => msg.trim() !== '');
		const responses: IDataObject[] = [];

		for(const message of messages) {
			const body: IDataObject = {
				content: message,
			};
			if(additionalFields.private){
				body.private = additionalFields.private;
			}
			if (contentAttributes && Object.keys(contentAttributes).length > 0) {
				body.content_attributes = contentAttributes;
			}
			responses.push((await chatwootApiRequest.call(
				context,
				'POST',
				`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
				body,
			)) as IDataObject);
		}
		return {
			json: {requests: responses},
		};
	}
	else {
		const body: IDataObject = {
			content,
		};
		if(additionalFields.private){
			body.private = additionalFields.private;
		}
		if (contentAttributes && Object.keys(contentAttributes).length > 0) {
			body.content_attributes = contentAttributes;
		}

		return {
			json: (await chatwootApiRequest.call(
				context,
				'POST',
				`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
				body,
			)) as IDataObject
		};
	}
}
