import type { IDataObject, IExecuteFunctions, IHookFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  chatwootApiRequest,
	getAccountId,
	getInboxId,
	getWebhookId,
} from '../../shared/transport';
import { WebhookOperation } from './types';

type WebhookContext = IExecuteFunctions | IHookFunctions;

export async function executeWebhookOperation(
  context: IExecuteFunctions,
  operation: WebhookOperation,
  itemIndex: number,
): Promise<INodeExecutionData> {
  switch (operation) {
    case 'create':
      return createWebhookOperation(context, itemIndex);
    case 'getAll':
      return getAllWebhooksOperation(context, itemIndex);
    case 'update':
      return updateWebhookOperation(context, itemIndex);
    case 'delete':
      return deleteWebhookOperation(context, itemIndex);
  }
}

export async function fetchWebhooks(
	context: WebhookContext,
	accountId: string | number,
): Promise<IDataObject[]> {
	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/webhooks`,
	)) as IDataObject;

	if (Array.isArray(response)) {
		return response as IDataObject[];
	}
	if (Array.isArray(response.webhooks)) {
		return response.webhooks as IDataObject[];
	}
	if (Array.isArray(response.payload)) {
		return response.payload as IDataObject[];
	}
	return [];
}

export async function createWebhook(
	context: WebhookContext,
	accountId: string | number,
	body: IDataObject,
): Promise<IDataObject> {
	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/webhooks`,
		body,
	)) as IDataObject;
}

export async function deleteWebhook(
	context: WebhookContext,
	accountId: string | number,
	webhookId: string | number,
): Promise<void> {
	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/webhooks/${webhookId}`,
	);
}

export async function updateWebhook(
	context: WebhookContext,
	accountId: string | number,
	webhookId: string | number,
	body: IDataObject,
): Promise<IDataObject> {
	return (await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/webhooks/${webhookId}`,
		body,
	)) as IDataObject;
}


async function createWebhookOperation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const body = buildWebhookBody(context, itemIndex);

	const result = await createWebhook(context, accountId, body);
	return { json: result };
}

async function getAllWebhooksOperation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const result = await fetchWebhooks(context, accountId);
	return { json: result as unknown as IDataObject };
}

async function updateWebhookOperation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const webhookId = getWebhookId.call(context, itemIndex);
	const body = buildWebhookBody(context, itemIndex);

	const result = await updateWebhook(context, accountId, webhookId, body);
	return { json: result };
}

async function deleteWebhookOperation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const webhookId = getWebhookId.call(context, itemIndex);

	await deleteWebhook(context, accountId, webhookId);
	return { json: { success: true } };
}

function buildWebhookBody(
	context: IExecuteFunctions,
	itemIndex: number,
): IDataObject {
	const webhookUrl = context.getNodeParameter('webhookUrl', itemIndex) as string;
	const events = context.getNodeParameter('events', itemIndex) as string[];

	const body: IDataObject = {
		url: webhookUrl,
		subscriptions: events,
	};

	const filterByInbox = context.getNodeParameter('filterByInbox', itemIndex, false) as boolean;
	if (filterByInbox) {
		const inboxId = getInboxId.call(context, itemIndex);
		if (inboxId) {
			body.inbox_id = inboxId;
		}
	}

	return body;
}
