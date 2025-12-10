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
import { getAccounts, getInboxes } from './listSearch';
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

function extractInboxId(context: IHookFunctions): number | undefined {
	const inboxIdParam = context.getNodeParameter('inboxId') as
		| string
		| number
		| { mode: string; value: string }
		| undefined;

	if (!inboxIdParam) return undefined;

	if (typeof inboxIdParam === 'object' && inboxIdParam.value !== undefined) {
		return Number(inboxIdParam.value);
	}
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
							searchListMethod: 'getInboxes',
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
			getAccounts,
			getInboxes,
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const accountId = extractAccountId(this);
				const events = this.getNodeParameter('events') as string[];
				const expectedName = getWebhookName(this);

				const webhooks = await fetchWebhooks(this, accountId);

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

						// Webhook exists but with different config, delete it
						try {
							await deleteWebhook(this, accountId, webhook.id as number);
						} catch (error) {
							throw new NodeApiError(this.getNode(), error as JsonObject);
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
						inbox_id: inboxId ?? null,
					},
				};

				const response = await createWebhook(this, accountId, body);
				const webhookData = this.getWorkflowStaticData('node');

				const payload = (response as IDataObject).payload as IDataObject;
				const webhook = payload.webhook as IDataObject;
				webhookData.webhookId = webhook.id;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const accountId = extractAccountId(this);
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						await deleteWebhook(this, accountId, webhookData.webhookId as number);
					} catch (error) {
						throw new NodeApiError(this.getNode(), error as JsonObject);
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
