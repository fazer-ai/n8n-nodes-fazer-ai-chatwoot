import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeApiError,
	JsonObject,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { accountSelector, webhookEventsSelector } from './shared/descriptions';
import { searchAccounts } from './methods/listSearch';
import {
	fetchWebhooks,
	createWebhook,
	deleteWebhook,
} from './actions/webhook';
import { chatwootApiRequest, getAccountId } from './shared/transport';
import {
	ChatwootInbox,
	ChatwootPayloadResponse,
} from './methods/resourceMapping';

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

	if (inboxIdParam === 'all' || inboxIdParam === '' || inboxIdParam === 0) return null;
	return Number(inboxIdParam);
}

function getWebhookName(context: IHookFunctions): string {
	const nodeName = context.getNode().name;
	const mode = context.getActivationMode();
	return mode === 'manual' ? `[N8N-TEST] ${nodeName}` : `[N8N] ${nodeName}`;
}

/**
 * Get all inboxes for the selected account (for resourceLocator)
 */
export async function searchInboxesForWebhook(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const accountId = getAccountId.call(this, 0);
	if (accountId === '') {
		return { results: [] };
	}

	const response = (await chatwootApiRequest.call(
		this,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes`,
	)) as ChatwootPayloadResponse<ChatwootInbox> | ChatwootInbox[];
	const inboxes =
		(response as ChatwootPayloadResponse<ChatwootInbox>).payload ||
		(response as ChatwootInbox[]) ||
		[];

	let results = (inboxes as ChatwootInbox[]).map((inbox: ChatwootInbox) => ({
		name: inbox.name,
		value: String(inbox.id),
	}));

	if (filter) {
		const filterLower = filter.toLowerCase();
		results = results.filter(
			(item) =>
				item.name.toLowerCase().includes(filterLower) ||
				item.value.includes(filter),
		);
	}

	results.unshift({
		name: 'All Inboxes',
		value: 'all',
	})

	return { results };
}

// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool
export class ChatwootTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chatwoot fazer.ai Trigger',
		name: 'chatwootTrigger',
		icon: 'file:../../icons/fazer-ai.svg',
		group: ['trigger'],
		version: 1,
		description: 'Handle Chatwoot events via webhooks',
		defaults: {
			name: 'Chatwoot fazer.ai Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
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
			webhookEventsSelector,
			{
				displayName: `These events require <a href="https://github.com/fazer-ai/chatwoot/pkgs/container/chatwoot" target="_blank">Chatwoot fazer.ai</a> and are not available in the standard Chatwoot release`,
				name: 'notice',
				type: 'notice',
				default: '',
				typeOptions: {
					theme: 'info',
				},
				displayOptions: {
					show: {
						events: [
							'kanban_task_created',
							'kanban_task_deleted',
							'kanban_task_updated',
							'provider_event_received',
							'message_incoming',
							'message_outgoing',
						],
					},
				},
			},
			{
				displayName: 'Inbox',
				name: 'inboxId',
				type: 'resourceLocator',
				default: { mode: 'list', value: 'all' },
				description: 'The ID of the inbox to filter events for. Choose "All Inboxes" to receive events from all inboxes.',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'All Inboxes',
						typeOptions: {
							searchListMethod: 'searchInboxesForWebhook',
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
			searchInboxesForWebhook,
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
