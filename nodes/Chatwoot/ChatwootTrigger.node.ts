import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

import { accountSelector } from './shared/descriptions';
import { searchAccounts, searchInboxes } from './listSearch';
import {
	fetchWebhooks,
	createWebhook,
	deleteWebhook,
} from './resources/webhook';

function extractAccountId(context: IHookFunctions): number {
	const accountIdParam = context.getNodeParameter('accountId') as
		| string
		| number
		| { mode: string; value: string };

	if (typeof accountIdParam === 'object' && accountIdParam.value !== undefined) {
		return Number(accountIdParam.value);
	}
	return Number(accountIdParam);
}

function extractInboxId(context: IHookFunctions): number | null {
	const inboxIdParam = context.getNodeParameter('inboxId') as
		| string
		| number
		| { mode: string; value: string };

	if (typeof inboxIdParam === 'object') {
		if (!inboxIdParam.value || inboxIdParam.value === '') return null;
		return Number(inboxIdParam.value);
	}

	if (inboxIdParam === '' || inboxIdParam === 0) return null;
	return Number(inboxIdParam);
}

function getWebhookName(context: IHookFunctions): string {
	const nodeName = context.getNode().name;
	const mode = context.getActivationMode();
	return mode === 'manual' ? `[N8N-TEST] ${nodeName}` : `[N8N] ${nodeName}`;
}

// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool
export class ChatwootTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chatwoot fazer.ai Trigger',
		name: 'chatwootTrigger',
		icon: 'file:../../icons/chatwoot.svg',
		group: ['trigger'],
		version: 1,
		description: 'Handle Chatwoot events via webhooks',
		defaults: {
			name: 'Chatwoot fazer.ai Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'chatwootApi',
				required: true,
			},
		],
		codex: {
			categories: ['Communication', 'Utility'],
		},
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			accountSelector,
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'Contact Created',
						value: 'contact_created',
					},
					{
						name: 'Contact Updated',
						value: 'contact_updated',
					},
					{
						name: 'Conversation Created',
						value: 'conversation_created',
					},
					{
						name: 'Conversation Status Changed',
						value: 'conversation_status_changed',
					},
					{
						name: 'Conversation Typing Off',
						value: 'conversation_typing_off',
					},
					{
						name: 'Conversation Typing On',
						value: 'conversation_typing_on',
					},
					{
						name: 'Conversation Updated',
						value: 'conversation_updated',
					},
					{
						name: 'Message Created',
						value: 'message_created',
					},
					{
						name: 'Message Updated',
						value: 'message_updated',
					},
					{
						name: 'Provider Event Received',
						value: 'provider_event_received',
					},
					{
						name: 'Webwidget Triggered',
						value: 'webwidget_triggered',
					},
				],
				default: [],
				required: true,
				description: 'The events to listen for',
			},
			{
				displayName: 'Inbox',
				name: 'inboxId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				description: 'The ID of the inbox to filter events for. If not selected, triggers for all inboxes.',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'All Inboxes',
						typeOptions: {
							searchListMethod: 'searchInboxes',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 1',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '^[0-9]+$',
									errorMessage: 'The ID must be a number',
								},
							},
						],
					},
				],
			}
		],
	};

	methods = {
		listSearch: {
			searchAccounts,
			searchInboxes,
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const accountId = extractAccountId(this);
				const events = this.getNodeParameter('events') as string[];
				const expectedName = getWebhookName(this);

				let webhooks: IDataObject[];
				try {
					webhooks = await fetchWebhooks(this, accountId);
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: `Failed to fetch webhooks: ${(error as Error).message}`,
					});
				}

				if (!Array.isArray(webhooks)) {
					throw new NodeApiError(this.getNode(), { webhooks } as JsonObject, {
						message: `Unexpected response from Chatwoot API: webhooks is not an array. Received: ${JSON.stringify(webhooks)}`,
					});
				}

				for (const webhook of webhooks) {
					if (webhook.url === webhookUrl) {
						const currentSubscriptions = (webhook.subscriptions as string[]) || [];
						const sortedCurrent = [...currentSubscriptions].sort();
						const sortedExpected = [...events].sort();

						if (
							JSON.stringify(sortedCurrent) === JSON.stringify(sortedExpected) &&
							webhook.name === expectedName
						) {
							const webhookData = this.getWorkflowStaticData('node');
							webhookData.webhookId = webhook.id;
							return true;
						}
						try {
							await deleteWebhook(this, accountId, webhook.id as number);
						} catch (error) {
							throw new NodeApiError(this.getNode(), error as JsonObject, {
								message: `Failed to delete existing webhook: ${(error as Error).message}`,
							});
						}
						return false;
					}
				}
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const accountId = extractAccountId(this);
				const inboxId = extractInboxId(this);
				const events = this.getNodeParameter('events');
				const webhookName = getWebhookName(this);

				const body: IDataObject = {
					webhook: {
						name: webhookName,
						url: webhookUrl,
						subscriptions: events,
						inbox_id: inboxId,
					},
				};

				let response: IDataObject;
				try {
					response = await createWebhook(this, accountId, body) as IDataObject;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: `Failed to create webhook: ${(error as Error).message}`,
					});
				}

				const webhookData = this.getWorkflowStaticData('node');

				let webhookId: unknown;
				if (response.payload && typeof response.payload === 'object') {
					const payload = response.payload as IDataObject;
					if (payload.webhook && typeof payload.webhook === 'object') {
						webhookId = (payload.webhook as IDataObject).id;
					} else if (payload.id) {
						webhookId = payload.id;
					}
				} else if (response.id) {
					webhookId = response.id;
				}

				if (!webhookId) {
					throw new NodeApiError(this.getNode(), response as JsonObject, {
						message: `Failed to extract webhook ID from response. Response: ${JSON.stringify(response)}`,
					});
				}

				webhookData.webhookId = webhookId;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const accountId = extractAccountId(this);
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						await deleteWebhook(this, accountId, webhookData.webhookId as number);
					} catch (error) {
						throw new NodeApiError(this.getNode(), error as JsonObject, {
							message: `Failed to delete webhook: ${(error as Error).message}`,
						});
					}
					delete webhookData.webhookId;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		return {
			workflowData: [
				this.helpers.returnJsonArray(bodyData),
			],
		};
	}
}
