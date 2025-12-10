import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
	chatwootApiRequest,
	getAccountId,
	getInboxId,
	getWebhookId,
} from '../../shared/transport';

export async function executeWebhookOperation(
	context: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[] | undefined> {
  if (operation === 'create') {
    return createWebhook(context, itemIndex);
  } else if (operation === 'getAll') {
    return getAllWebhooks(context, itemIndex);
  } else if (operation === 'update') {
    return updateWebhook(context, itemIndex);
  } else if (operation === 'delete') {
    return deleteWebhook(context, itemIndex);
  } else {
    return undefined;
  }
}


async function createWebhook(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const useRawJson = context.getNodeParameter('useRawJson', itemIndex, false) as boolean;

	let body: IDataObject;
	if (useRawJson) {
		body = JSON.parse(context.getNodeParameter('jsonBody', itemIndex, '{}') as string);
	} else {
		const webhookUrl = context.getNodeParameter('webhookUrl', itemIndex) as string;
		const events = context.getNodeParameter('events', itemIndex) as string[];

		body = {
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
	}

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/webhooks`,
		body,
	)) as IDataObject;
}

async function getAllWebhooks(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);

	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/webhooks`,
	)) as IDataObject;

	return (response.payload as IDataObject[]) || response;
}

async function updateWebhook(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const webhookId = getWebhookId.call(context, itemIndex);
	const useRawJson = context.getNodeParameter('useRawJson', itemIndex, false) as boolean;

	let body: IDataObject;
	if (useRawJson) {
		body = JSON.parse(context.getNodeParameter('jsonBody', itemIndex, '{}') as string);
	} else {
		const webhookUrl = context.getNodeParameter('webhookUrl', itemIndex) as string;
		const events = context.getNodeParameter('events', itemIndex) as string[];

		body = {
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
	}

	return (await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/webhooks/${webhookId}`,
		body,
	)) as IDataObject;
}

async function deleteWebhook(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const webhookId = getWebhookId.call(context, itemIndex);

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/webhooks/${webhookId}`,
	);

	return { success: true };
}
