import { NodeOperationError, type IDataObject, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import {
	chatwootApiRequest,
	getAccountId,
	getInboxId,
	getConversationId,
	getContactId,
} from '../../shared/transport';
import { ConversationOperation } from './types';

function parseCustomAttributes(context: IExecuteFunctions, itemIndex: number): IDataObject {
	const specifyMode = context.getNodeParameter('specifyCustomAttributes', itemIndex) as string;

	if (specifyMode === 'definition') {
		const attributes = context.getNodeParameter(
			'customAttributesDefinition.attributes',
			itemIndex,
			[],
		) as Array<{ key: string; value: string }>;

		const customAttributes: IDataObject = {};
		for (const attr of attributes) {
			if (attr.key) {
				customAttributes[attr.key] = attr.value;
			}
		}
		return customAttributes;
	} else if (specifyMode === 'keypair') {
		const attributes = context.getNodeParameter(
			'customAttributesKeypair.attributes',
			itemIndex,
			[],
		) as Array<{ name: string; value: string }>;

		const customAttributes: IDataObject = {};
		for (const attr of attributes) {
			if (attr.name) {
				customAttributes[attr.name] = attr.value;
			}
		}
		return customAttributes;
	} else {
		const jsonValue = context.getNodeParameter('customAttributesJson', itemIndex) as string;
		return JSON.parse(jsonValue) as IDataObject;
	}
}

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
			return listConversationMessages(context, itemIndex);
		case 'assignAgent':
			return assignConversationAgent(context, itemIndex);
		case 'assignTeam':
			return assignConversationTeam(context, itemIndex);
		case 'addLabels':
			return addLabelsToConversation(context, itemIndex);
		case 'removeLabels':
			return removeLabelsFromConversation(context, itemIndex);
		case 'updateLabels':
			return updateConversationLabels(context, itemIndex);
		case 'toggleStatus':
			return toggleConversationStatus(context, itemIndex);
		case 'setPriority':
			return setConversationPriority(context, itemIndex);
		case 'addCustomAttributes':
			return addCustomAttributesToConversation(context, itemIndex);
		case 'removeCustomAttributes':
			return removeCustomAttributesFromConversation(context, itemIndex);
		case 'setCustomAttributes':
			return setConversationCustomAttributes(context, itemIndex);
		case 'updateLastSeen':
			return updateConversationLastSeen(context, itemIndex);
		case 'updatePresence':
			return updateConversationPresence(context, itemIndex);
		case 'markUnread':
			return markConversationUnread(context, itemIndex);
	}
}

async function listConversationMessages(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const fetchAtLeast = context.getNodeParameter('fetchAtLeast', itemIndex, 20) as number;
	const options = context.getNodeParameter('listMessagesOptions', itemIndex, {}) as IDataObject;

	const allMessages: IDataObject[] = [];
	let beforeId = options.before as number | undefined;
	let hasMore = true;

	while (hasMore && allMessages.length < fetchAtLeast) {
		const query: IDataObject = {};
		if (beforeId) {
			query.before = beforeId;
		}

		const response = (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
			undefined,
			query,
		)) as IDataObject;

		const messages = (response.payload as IDataObject[]) || [];

		if (messages.length === 0) {
			hasMore = false;
		} else {
			allMessages.push(...messages);
			// Get the smallest message ID for the next pagination
			const lastMessage = messages[messages.length - 1];
			beforeId = lastMessage.id as number;
		}
	}

	return {
		json: {
			messages: allMessages,
			total: allMessages.length,
		},
	};
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

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations`,
		body,
	) as IDataObject;

	return { json: result };
}

async function getConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
	) as IDataObject;

	return { json: result };
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

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations`,
		undefined,
		query,
	) as IDataObject;

	return { json: result };
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

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_status`,
		body,
	) as IDataObject;

	return { json: result };
}

async function assignConversationAgent(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const agentId = context.getNodeParameter('agentId', itemIndex) as number;

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
		{ assignee_id: agentId },
	) as IDataObject;

	return { json: result };
}

async function assignConversationTeam(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const teamId = context.getNodeParameter('teamId', itemIndex) as number;

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
		{ team_id: teamId },
	) as IDataObject;

	return { json: result };
}

async function updateConversationLabels(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const labels = context.getNodeParameter('labels', itemIndex) as string[];

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
		{ labels },
	) as IDataObject;

	return { json: result };
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

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
		{ labels: newLabels },
	) as IDataObject;

	return { json: result };
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

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
		{ labels: newLabels },
	) as IDataObject;

	return { json: result };
}

async function setConversationCustomAttributes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const customAttributes = parseCustomAttributes(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/custom_attributes`,
		{ custom_attributes: customAttributes },
	) as IDataObject;

	return { json: result };
}

async function addCustomAttributesToConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const attributesToAdd = parseCustomAttributes(context, itemIndex);

	const conversation = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
	)) as IDataObject;

	const currentAttributes = (conversation.custom_attributes as IDataObject) || {};
	const mergedAttributes = { ...currentAttributes, ...attributesToAdd };

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/custom_attributes`,
		{ custom_attributes: mergedAttributes },
	) as IDataObject;

	return { json: result };
}

async function removeCustomAttributesFromConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const attributeKeysToRemove = context.getNodeParameter('customAttributeKeysToRemove', itemIndex) as string[];

	const conversation = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}`,
	)) as IDataObject;

	const currentAttributes = (conversation.custom_attributes as IDataObject) || {};
	const keysToRemoveSet = new Set(attributeKeysToRemove);
	const newAttributes: IDataObject = {};

	for (const [key, value] of Object.entries(currentAttributes)) {
		if (!keysToRemoveSet.has(key)) {
			newAttributes[key] = value;
		}
	}

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/custom_attributes`,
		{ custom_attributes: newAttributes },
	) as IDataObject;

	return { json: result };
}

async function setConversationPriority(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const priorityValue = context.getNodeParameter('priority', itemIndex) as string;

	const priority = priorityValue === 'null' ? null : priorityValue;

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_priority`,
		{ priority },
	) as IDataObject;

	return { json: result };
}

async function markConversationUnread(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/unread`,
	) as IDataObject;

	return { json: result };
}

async function updateConversationLastSeen(
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

async function updateConversationPresence(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getInboxId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const typingStatus = context.getNodeParameter('typingStatus', itemIndex) as string;
	const isPrivate = context.getNodeParameter('isPrivate', itemIndex) as boolean;

	// Fetch inbox details to check if presence will have an effect
	const inbox = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}`,
	)) as IDataObject;

	const channelType = inbox.channel_type as string;
	const provider = (inbox.provider as string) ?? '';
	const supportedProviders = ['whatsapp_cloud', 'baileys'];
	const isWhatsApp = channelType === 'Channel::Whatsapp';
	const isSupportedProvider = supportedProviders.includes(provider);
	const willHaveEffect = isWhatsApp && isSupportedProvider;

	const body = {
		typing_status: typingStatus,
		is_private: isPrivate,
	};

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_typing_status`,
		body,
	) as IDataObject;

	if (!willHaveEffect) {
		context.addExecutionHints({
			message: `Presence status was set, but will not be visible to the contact. This feature only works for WhatsApp inboxes with 'whatsapp_cloud' or 'baileys' providers. Current inbox: channel_type="${channelType}", provider="${provider || 'none'}".`,
			type: 'warning',
			location: 'outputPane',
		});
	}

	return { json: result };
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

	if (additionalFields.split_message) {
		const splitChar = (additionalFields.split_character as string) ?? '\n\n';
		const messages = content.split(splitChar).filter((msg: string) => msg.trim() !== '');
		const responses: IDataObject[] = [];

		for (const message of messages) {
			const body: IDataObject = {
				content: message,
			};
			if (additionalFields.private) {
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
			json: { requests: responses },
		};
	}
	else {
		const body: IDataObject = {
			content,
		};
		if (additionalFields.private) {
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
