import { NodeOperationError, type IDataObject, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import {
	asyncSleep,
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
			return sendFileToConversation(context, itemIndex);
		case 'listMessages':
			return listConversationMessages(context, itemIndex);
		case 'listAttachments':
			return listConversationAttachments(context, itemIndex);
		case 'downloadAttachment':
			return downloadAttachment(context, itemIndex);
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
		case 'updateAttachmentMeta':
			return updateAttachmentMeta(context, itemIndex);
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

function calculateDynamicWait(messageContent: string): number {
	const charsPerSecond = 18.75; // 250 WPM
	const maxWaitTime = 12;
	const waitTime = messageContent.length / charsPerSecond;
	return Math.min(waitTime, maxWaitTime);
}

interface WaitOptions {
	accountId: string;
	conversationId: string;
	waitSeconds: number;
	showStatusWhileWaiting: boolean;
	isZapiInbox: boolean;
	statusType?: 'typing' | 'recording';
}

async function waitWithStatusIndicator(
	context: IExecuteFunctions,
	options: WaitOptions,
): Promise<void> {
	const {
		accountId,
		conversationId,
		waitSeconds,
		showStatusWhileWaiting,
		isZapiInbox,
		statusType = 'typing',
	} = options;

	if (waitSeconds <= 0) return;

	if (isZapiInbox) {
		await asyncSleep(waitSeconds * 1000);
		return;
	}

	if (!showStatusWhileWaiting) {
		await asyncSleep(waitSeconds * 1000);
		return;
	}

	const setStatus = async (active: boolean) => {
		let typingStatus: 'on' | 'off' | 'recording';
		if (!active) {
			typingStatus = 'off';
		} else {
			typingStatus = statusType === 'recording' ? 'recording' : 'on';
		}
		await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/toggle_typing_status`,
			{ typing_status: typingStatus },
		);
	};

	const refreshInterval = 20000;
	let remaining = waitSeconds * 1000;

	await setStatus(true);
	while (remaining > 0) {
		const sleepTime = Math.min(remaining, refreshInterval);
		await asyncSleep(sleepTime);
		remaining -= sleepTime;
		if (remaining > 0) {
			await setStatus(true);
		}
	}
	await setStatus(false);
}

async function detectZapiInbox(
	context: IExecuteFunctions,
	itemIndex: number,
	accountId: string,
): Promise<boolean> {
	const inboxId = getInboxId.call(context, itemIndex);
	if (!inboxId) return false;

	const inbox = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}`,
	)) as IDataObject;

	return inbox.provider === 'zapi';
}

function parseContentAttributesFromInput(
	context: IExecuteFunctions,
	itemIndex: number,
	additionalFields: IDataObject,
): IDataObject | undefined {
	if (!additionalFields.content_attributes) {
		return undefined;
	}

	const contentAttrsConfig = additionalFields.content_attributes as IDataObject;
	const values = contentAttrsConfig.values as IDataObject;

	if (!values) {
		return undefined;
	}

	const inputMethod = values.inputMethod as string;

	if (inputMethod === 'json') {
		const jsonString = values.json as string;
		if (jsonString && jsonString.trim() !== '{}' && jsonString.trim() !== '') {
			try {
				return JSON.parse(jsonString);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					`Invalid JSON in content attributes: ${(error as Error).message}`,
				);
			}
		}
	} else if (inputMethod === 'pairs') {
		const attributes = values.attributes as IDataObject;
		if (attributes && attributes.attribute) {
			const pairs = attributes.attribute as Array<{ name: string; value: string }>;
			if (Array.isArray(pairs) && pairs.length > 0) {
				const contentAttributes: IDataObject = {};
				for (const pair of pairs) {
					if (pair.name && pair.name.trim() !== '') {
						contentAttributes[pair.name] = pair.value;
					}
				}
				return contentAttributes;
			}
		}
	}

	return undefined;
}

interface SendMessageOptions {
	accountId: string;
	conversationId: string;
	content: string;
	isPrivate?: boolean;
	contentAttributes?: IDataObject;
	waitSeconds?: number;
	showTypingWhileWaiting?: boolean;
	isZapiInbox?: boolean;
}

async function sendSingleMessage(
	context: IExecuteFunctions,
	options: SendMessageOptions,
): Promise<IDataObject> {
	const {
		accountId,
		conversationId,
		content,
		isPrivate,
		contentAttributes,
		waitSeconds = 0,
		showTypingWhileWaiting = false,
		isZapiInbox = false,
	} = options;

	if (isZapiInbox && waitSeconds > 0 && showTypingWhileWaiting) {
		const msgContentAttrs: IDataObject = contentAttributes ? { ...contentAttributes } : {};
		msgContentAttrs.zapi_args = { delayTyping: Math.round(waitSeconds) };

		const body: IDataObject = {
			content,
			content_attributes: msgContentAttrs,
		};
		if (isPrivate) {
			body.private = isPrivate;
		}

		const result = (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
			body,
		)) as IDataObject;

		await asyncSleep(waitSeconds * 1000);
		return result;
	}

	await waitWithStatusIndicator(context, {
		accountId,
		conversationId,
		waitSeconds,
		showStatusWhileWaiting: showTypingWhileWaiting,
		isZapiInbox,
		statusType: 'typing',
	});

	const body: IDataObject = { content };
	if (isPrivate) {
		body.private = isPrivate;
	}
	if (contentAttributes && Object.keys(contentAttributes).length > 0) {
		body.content_attributes = contentAttributes;
	}

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
		body,
	)) as IDataObject;
}

async function sendSplitMessages(
	context: IExecuteFunctions,
	itemIndex: number,
	accountId: string,
	conversationId: string,
	content: string,
	additionalFields: IDataObject,
	contentAttributes: IDataObject | undefined,
): Promise<INodeExecutionData> {
	let splitChar = (additionalFields.split_character as string) ?? '\\n\\n';
	splitChar = splitChar
		.replace(/\\n/g, '\n')
		.replace(/\\t/g, '\t')
		.replace(/\\r/g, '\r');

	const messages = content.split(splitChar).filter((msg: string) => msg.trim() !== '');
	const responses: IDataObject[] = [];

	const waitMode = (additionalFields.wait_before_sending as string) ?? 'none';
	const fixedWaitTime = (additionalFields.wait_time_seconds as number) ?? 2;
	const showTypingWhileWaiting = (additionalFields.typing_while_waiting as boolean) ?? true;

	const isZapiInbox = waitMode !== 'none' && showTypingWhileWaiting
		? await detectZapiInbox(context, itemIndex, accountId)
		: false;

	for (const message of messages) {
		let waitSeconds = 0;
		if (waitMode !== 'none') {
			waitSeconds = waitMode === 'fixed' ? fixedWaitTime : calculateDynamicWait(message);
		}

		const result = await sendSingleMessage(context, {
			accountId,
			conversationId,
			content: message,
			isPrivate: additionalFields.private as boolean,
			contentAttributes,
			waitSeconds,
			showTypingWhileWaiting,
			isZapiInbox,
		});

		responses.push(result);
	}

	return { json: { requests: responses } };
}

async function sendMessageToConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const content = context.getNodeParameter('content', itemIndex, '') as string;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const replyToParam = context.getNodeParameter('replyToMessageId', itemIndex, { mode: 'list', value: '' }) as { mode: string; value: string };
	const replyToMessageId = replyToParam.value ? Number(replyToParam.value) : undefined;

	const isReaction = additionalFields.is_reaction as boolean;
	if (!content && !isReaction) {
		throw new NodeOperationError(
			context.getNode(),
			'Content is required.',
			{ itemIndex },
		);
	}

	let contentAttributes = parseContentAttributesFromInput(context, itemIndex, additionalFields);

	if (replyToMessageId) {
		contentAttributes = contentAttributes ?? {};
		contentAttributes.in_reply_to = replyToMessageId;
	}

	if (isReaction) {
		if (!replyToMessageId) {
			throw new NodeOperationError(
				context.getNode(),
				'Reply To is required when Is Reaction is enabled. A reaction must be in response to a specific message.',
				{ itemIndex },
			);
		}
		contentAttributes = contentAttributes ?? {};
		contentAttributes.is_reaction = true;
	}

	if (additionalFields.split_message) {
		return sendSplitMessages(
			context,
			itemIndex,
			accountId,
			conversationId,
			content,
			additionalFields,
			contentAttributes,
		);
	}

	const result = await sendSingleMessage(context, {
		accountId,
		conversationId,
		content,
		isPrivate: additionalFields.private as boolean,
		contentAttributes,
	});

	return { json: result };
}

async function sendFileToConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex) as string;
	const isRecordedAudio = context.getNodeParameter('isRecordedAudio', itemIndex, false) as boolean;
	const caption = context.getNodeParameter('fileCaption', itemIndex, '') as string;
	const options = context.getNodeParameter('sendFileOptions', itemIndex, {}) as IDataObject;

	const binaryData = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const fileName = binaryData.fileName || 'file';

	const waitMode = (options.wait_before_sending as string) ?? 'none';
	const waitSeconds = (options.wait_time_seconds as number) ?? 5;
	const showStatusWhileWaiting = (options.status_while_waiting as boolean) ?? true;
	const statusType = isRecordedAudio ? 'recording' : 'typing';

	const isZapiInbox = await detectZapiInbox(context, itemIndex, accountId);

	let contentAttributes: IDataObject | undefined;

	if (waitMode !== 'none' && waitSeconds > 0) {
		if (isZapiInbox && showStatusWhileWaiting) {
			contentAttributes = {
				zapi_args: {
					delayTyping: waitSeconds,
				},
			};
		} else {
			await waitWithStatusIndicator(context, {
				accountId,
				conversationId,
				waitSeconds,
				showStatusWhileWaiting,
				isZapiInbox,
				statusType,
			});
		}
	}

	const credentials = await context.getCredentials('fazerAiChatwootApi');
	let baseURL = credentials.url as string;
	if (baseURL.endsWith('/')) {
		baseURL = baseURL.slice(0, -1);
	}

	const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

	const formData: IDataObject = {
		'attachments[]': {
			value: buffer,
			options: {
				filename: fileName,
				contentType: binaryData.mimeType,
			},
		},
	};

	if (caption && !isRecordedAudio) {
		formData.content = caption;
	}

	if (options.private) {
		formData.private = 'true';
	}

	if (isRecordedAudio) {
		formData.is_recorded_audio = JSON.stringify([fileName]);
	}

	if (contentAttributes && Object.keys(contentAttributes).length > 0) {
		formData.content_attributes = JSON.stringify(contentAttributes);
	}

	// Add attachments metadata if provided
	const attachmentsMetadataConfig = options.attachments_metadata as IDataObject | undefined;
	if (attachmentsMetadataConfig?.metadata) {
		const metadataItems = attachmentsMetadataConfig.metadata as Array<{ key: string; value: string }>;
		for (const item of metadataItems) {
			if (item.key) {
				formData[`attachments_metadata[${fileName}][${item.key}]`] = item.value;
			}
		}
	}

	const result = await context.helpers.requestWithAuthentication.call(
		context,
		'fazerAiChatwootApi',
		{
			method: 'POST',
			uri: `${baseURL}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
			formData,
			json: true,
		},
	);

	if (isZapiInbox && waitMode !== 'none' && waitSeconds > 0 && showStatusWhileWaiting) {
		await asyncSleep(waitSeconds * 1000);
	}

	return { json: result as IDataObject };
}

async function listConversationAttachments(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);

	const response = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/attachments`,
	) as { payload?: IDataObject[] };

	const attachments = response.payload || [];

	return {
		json: {
			attachments,
			total: attachments.length,
		},
	};
}

async function updateAttachmentMeta(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);

	const messageIdParam = context.getNodeParameter('messageId', itemIndex) as { mode: string; value: string };
	const messageId = messageIdParam.value;

	const attachmentIdParam = context.getNodeParameter('attachmentId', itemIndex) as { mode: string; value: string };
	const attachmentId = attachmentIdParam.value;

	const metadataConfig = context.getNodeParameter('attachmentMeta', itemIndex, {}) as IDataObject;
	const metadataItems = (metadataConfig.metadata as Array<{ key: string; value: string }>) || [];

	const meta: IDataObject = {};
	for (const item of metadataItems) {
		if (item.key) {
			meta[item.key] = item.value;
		}
	}

	const result = await chatwootApiRequest.call(
		context,
		'PATCH',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}`,
		{ meta },
	) as IDataObject;

	return { json: result };
}

async function downloadAttachment(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const downloadMode = context.getNodeParameter('downloadMode', itemIndex) as string;
	const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;

	let fileUrl: string;
	let attachment: IDataObject | undefined;

	if (downloadMode === 'byUrl') {
		fileUrl = context.getNodeParameter('attachmentUrl', itemIndex) as string;
		if (!fileUrl) {
			throw new NodeOperationError(
				context.getNode(),
				'Attachment URL is required',
				{ itemIndex },
			);
		}
	} else {
		const accountId = getAccountId.call(context, itemIndex);
		const conversationId = getConversationId.call(context, itemIndex);

		const attachmentIdParam = context.getNodeParameter('attachmentId', itemIndex) as { mode: string; value: string };
		const attachmentId = String(attachmentIdParam.value);

		const response = await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/conversations/${conversationId}/attachments`,
		) as { payload?: IDataObject[] };

		const attachments = response.payload || [];

		attachment = attachments.find(
			(a) => String((a as IDataObject).id) === attachmentId,
		) as IDataObject | undefined;

		if (!attachment) {
			throw new NodeOperationError(
				context.getNode(),
				`Attachment with ID ${attachmentId} not found in conversation`,
				{ itemIndex },
			);
		}

		fileUrl = attachment.data_url as string;
		if (!fileUrl) {
			throw new NodeOperationError(
				context.getNode(),
				'Attachment does not have a download URL',
				{ itemIndex },
			);
		}
	}

	const fileName = decodeURIComponent(fileUrl.split('/').pop() || 'attachment');
	const mimeType = (attachment?.file_type as string) || 'application/octet-stream';

	const fileResponse = await context.helpers.httpRequest({
		method: 'GET',
		url: fileUrl,
		encoding: 'arraybuffer',
		returnFullResponse: true,
	});

	const binaryData = await context.helpers.prepareBinaryData(
		Buffer.from(fileResponse.body as ArrayBuffer),
		fileName,
		mimeType,
	);

	return {
		json: attachment ?? { url: fileUrl },
		binary: { [binaryPropertyName]: binaryData },
	};
}
