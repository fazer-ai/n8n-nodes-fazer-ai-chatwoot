import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeApiError,
	NodeOperationError,
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
import { chatwootApiRequest, getAccountId, getChatwootBaseUrl } from './shared/transport';
import {
	ChatwootInbox,
	ChatwootPayloadResponse,
} from './methods/resourceMapping';
import { verifyWebhookSignature } from './shared/webhookSignature';

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

	const baseUrl = await getChatwootBaseUrl.call(this);

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
		name: `#${inbox.id} - ${inbox.name}`,
		value: String(inbox.id),
		url: `${baseUrl}/app/accounts/${accountId}/settings/inboxes/${inbox.id}`,
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
		url: `${baseUrl}/app/accounts/${accountId}/settings/inboxes`,
	})

	return { results };
}

// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool
export class ChatwootTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chatwoot fazer.ai Trigger',
		name: 'chatwootTrigger',
		icon: { light: 'file:../../icons/fazer-ai.svg', dark: 'file:../../icons/fazer-ai-dark.svg' },
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
				name: 'fazerAiChatwootApi',
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
				path: '={{$nodeId}}',
			},
		],
		properties: [
			accountSelector,
			webhookEventsSelector,
			{
				displayName: `These events require <a href="https://github.com/fazer-ai/chatwoot/pkgs/container/chatwoot" target="_blank">Chatwoot fazer.ai</a>. If your instance runs it, they'll be delivered normally.`,
				name: 'notice',
				type: 'notice',
				default: '',
				typeOptions: {
					theme: 'info',
				},
				displayOptions: {
					show: {
						events: [
							'internal_chat_channel_updated',
							'internal_chat_message_created',
							'internal_chat_message_deleted',
							'internal_chat_message_updated',
							'kanban_task_created',
							'kanban_task_deleted',
							'kanban_task_overdue',
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
			},
			{
				displayName: 'Verify Webhook Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: false,
				description: 'Whether to verify the HMAC-SHA256 signature on incoming webhooks using the per-webhook secret. Requires Chatwoot fazer.ai v4.12.0 or newer. Leave disabled if your instance does not sign outgoing webhooks, otherwise all events will be rejected.',
			},
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
				const webhookUrl = this.getNodeWebhookUrl('default')!;
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

				let exactMatch: IDataObject | undefined;

				// Build the legacy URL to clean up webhooks from the old path format.
				// Old: /webhook/{webhookId}/webhook
				// New: /webhook/{webhookId}/{nodeId}
				const legacyUrl = webhookUrl.replace(/\/[^/]+$/, '/webhook');

				// Delete webhooks matching the current or legacy URL, keeping only
				// an exact match (same URL, name, and subscriptions) for reuse.
				for (const webhook of webhooks) {
					const urlMatch = webhook.url === webhookUrl;
					const legacyUrlMatch = webhook.url === legacyUrl;

					if (!urlMatch && !legacyUrlMatch) continue;

					if (urlMatch) {
						const currentSubscriptions = (webhook.subscriptions as string[]) || [];
						const sortedCurrent = [...currentSubscriptions].sort();
						const sortedExpected = [...events].sort();

						if (
							!exactMatch &&
							JSON.stringify(sortedCurrent) === JSON.stringify(sortedExpected) &&
							webhook.name === expectedName
						) {
							exactMatch = webhook;
							continue;
						}
					}

					try {
						await deleteWebhook(this, accountId, webhook.id as number);
					} catch {
						// Ignore — may have been removed externally
					}
				}

				if (exactMatch) {
					const webhookData = this.getWorkflowStaticData('node');
					webhookData.webhookId = exactMatch.id;
					if (exactMatch.secret) {
						webhookData.webhookSecret = exactMatch.secret;
					} else {
						delete webhookData.webhookSecret;
					}
					return true;
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default')!;
				const accountId = extractAccountId(this);
				const inboxId = extractInboxId(this);
				const events = this.getNodeParameter('events');
				const webhookName = getWebhookName(this);

				// Defensively delete any remaining webhooks with this URL or
				// the legacy URL format
				const webhookData = this.getWorkflowStaticData('node');
				const legacyUrl = webhookUrl.replace(/\/[^/]+$/, '/webhook');
				try {
					const existing = await fetchWebhooks(this, accountId);
					for (const wh of existing) {
						if (wh.url === webhookUrl || wh.url === legacyUrl) {
							await deleteWebhook(this, accountId, wh.id as number);
						}
					}
				} catch {
					// Best-effort cleanup — checkExists should have handled this
				}
				delete webhookData.webhookId;

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

				let webhookSecret: unknown;
				if (response.payload && typeof response.payload === 'object') {
					const payload = response.payload as IDataObject;
					if (payload.webhook && typeof payload.webhook === 'object') {
						webhookSecret = (payload.webhook as IDataObject).secret;
					} else if (payload.secret) {
						webhookSecret = payload.secret;
					}
				} else if (response.secret) {
					webhookSecret = response.secret;
				}

				if (webhookSecret && typeof webhookSecret === 'string') {
					webhookData.webhookSecret = webhookSecret;
				} else {
					delete webhookData.webhookSecret;
				}

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const accountId = extractAccountId(this);
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						await deleteWebhook(this, accountId, webhookData.webhookId as number);
					} catch {
						// Ignore — webhook may have been removed externally
					}
					delete webhookData.webhookId;
					delete webhookData.webhookSecret;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const isTestMode = this.getMode() === 'manual';
		const verifySignature = this.getNodeParameter('verifySignature', false) as boolean;

		if (!isTestMode && verifySignature) {
			const webhookData = this.getWorkflowStaticData('node');
			const secret = webhookData.webhookSecret as string | undefined;

			if (secret) {
				const req = this.getRequestObject();
				const rawBody: string =
					(req as unknown as { rawBody?: Buffer }).rawBody?.toString('utf-8')
					?? JSON.stringify(bodyData);

				const headers = this.getHeaderData();
				const result = verifyWebhookSignature({
					secret,
					signatureHeader: headers['x-chatwoot-signature'] as string | undefined,
					timestampHeader: headers['x-chatwoot-timestamp'] as string | undefined,
					rawBody,
				});

				if (!result.valid) {
					throw new NodeOperationError(
						this.getNode(),
						`Webhook signature verification failed: ${result.reason}`,
					);
				}
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		};
	}
}
