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

import { chatwootApiRequest } from './shared/transport';
import { accountSelector } from './shared/descriptions';
import { getAccounts, getInboxes } from './listSearch';

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

				const accountIdParam = this.getNodeParameter('accountId') as string | number | { mode: string; value: string };
				let accountId: number;
				if (typeof accountIdParam === 'object' && accountIdParam.value !== undefined) {
					accountId = Number(accountIdParam.value);
				} else {
					accountId = Number(accountIdParam);
				}

				const events = this.getNodeParameter('events') as string[];

				const endpoint = `/api/v1/accounts/${accountId}/webhooks`;
				const response = await chatwootApiRequest.call(this, 'GET', endpoint);

				let webhooks: IDataObject[] = [];
				const responseData = response as IDataObject;

				if (Array.isArray(response)) {
					webhooks = response as IDataObject[];
				} else if (responseData && Array.isArray(responseData.payload)) {
					webhooks = responseData.payload as IDataObject[];
				}

				for (const webhook of webhooks) {
					if (webhook.url === webhookUrl) {
						const currentSubscriptions = (webhook.subscriptions as string[]) || [];
						const sortedCurrent = [...currentSubscriptions].sort();
						const sortedExpected = [...events].sort();

						const currentName = webhook.name;
						const nodeName = this.getNode().name;
						const mode = this.getActivationMode();
						const expectedName = mode === 'manual' ? `[N8N-TEST] ${nodeName}` : `[N8N] ${nodeName}`;

						if (
							JSON.stringify(sortedCurrent) === JSON.stringify(sortedExpected) &&
							currentName === expectedName
						) {
							const webhookData = this.getWorkflowStaticData('node');
							webhookData.webhookId = webhook.id;
							return true;
						} else {
							const deleteEndpoint = `/api/v1/accounts/${accountId}/webhooks/${webhook.id}`;
							try {
								await chatwootApiRequest.call(this, 'DELETE', deleteEndpoint);
							} catch (error) {
								throw new NodeApiError(this.getNode(), error as JsonObject);
							}
							return false;
						}
					}
				}
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');

				const accountIdParam = this.getNodeParameter('accountId') as string | number | { mode: string; value: string };
				let accountId: number;
				if (typeof accountIdParam === 'object' && accountIdParam.value !== undefined) {
					accountId = Number(accountIdParam.value);
				} else {
					accountId = Number(accountIdParam);
				}

				const inboxIdParam = this.getNodeParameter('inboxId') as string | number | { mode: string; value: string } | undefined;
				let inboxId: number | undefined;
				if (inboxIdParam) {
					if (typeof inboxIdParam === 'object' && inboxIdParam.value !== undefined) {
						inboxId = Number(inboxIdParam.value);
					} else {
						inboxId = Number(inboxIdParam);
					}
				}

				const events = this.getNodeParameter('events');
				const nodeName = this.getNode().name;
				const mode = this.getActivationMode();
				const webhookName = mode === 'manual' ? `[N8N-TEST] ${nodeName}` : `[N8N] ${nodeName}`;

				const endpoint = `/api/v1/accounts/${accountId}/webhooks`;

				const body: IDataObject = {
					webhook: {
						name: webhookName,
						url: webhookUrl,
						subscriptions: events,
					}
				};

				if (inboxId) {
					(body.webhook as IDataObject).inbox_id = inboxId;
				} else {
					(body.webhook as IDataObject).inbox_id = null;
				}

				const response = await chatwootApiRequest.call(this, 'POST', endpoint, body);
				const webhookData = this.getWorkflowStaticData('node');

				const payload = (response as IDataObject).payload as IDataObject;
				const webhook = payload.webhook as IDataObject;
				webhookData.webhookId = webhook.id;

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const accountIdParam = this.getNodeParameter('accountId') as string | number | { mode: string; value: string };
				let accountId: number;
				if (typeof accountIdParam === 'object' && accountIdParam.value !== undefined) {
					accountId = Number(accountIdParam.value);
				} else {
					accountId = Number(accountIdParam);
				}

				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					const endpoint = `/api/v1/accounts/${accountId}/webhooks/${webhookData.webhookId}`;
					try {
						await chatwootApiRequest.call(this, 'DELETE', endpoint);
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
