import { NodeOperationError, type IDataObject, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { asyncSleep, chatwootApiRequest, getAccountId, getInboxId, getWhatsappSpecialProviderInboxId } from '../../shared/transport';
import { InboxOperation } from './types';

export async function executeInboxOperation(
  context: IExecuteFunctions,
  operation: InboxOperation,
  itemIndex: number,
): Promise<INodeExecutionData> {
  switch (operation) {
	case 'get':
		return getInbox(context, itemIndex);
  case 'list':
    return listInboxes(context, itemIndex);
	case 'listAgents':
		return listInboxAgents(context, itemIndex);
	case 'addAgents':
		return addInboxAgents(context, itemIndex);
	case 'updateAgents':
		return updateInboxAgents(context, itemIndex);
	case 'removeAgents':
		return removeInboxAgents(context, itemIndex);
	case 'onWhatsapp':
		return onWhatsapp(context, itemIndex);
	case 'whatsappDisconnect':
		return whatsappDisconnect(context, itemIndex);
	case 'whatsappGetQrCode':
		return whatsappGetQrCode(context, itemIndex);
  }
}

async function listInboxes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes`,
	) as IDataObject;

	return { json: result };
}

async function getInbox(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getInboxId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}`,
	) as IDataObject;

	return { json: result };
}

async function listInboxAgents(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getInboxId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/inbox_members/${inboxId}`,
	) as IDataObject;

	return { json: result };
}

async function addInboxAgents(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getInboxId.call(context, itemIndex);
	const userIds = context.getNodeParameter('userIds', itemIndex) as number[];

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/inbox_members`,
		{ inbox_id: inboxId, user_ids: userIds },
	) as IDataObject;

	return { json: result };
}

async function updateInboxAgents(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getInboxId.call(context, itemIndex);
	const userIds = context.getNodeParameter('userIds', itemIndex) as number[];

	const result = await chatwootApiRequest.call(
		context,
		'PATCH',
		`/api/v1/accounts/${accountId}/inbox_members`,
		{ inbox_id: inboxId, user_ids: userIds },
	) as IDataObject;

	return { json: result };
}

async function removeInboxAgents(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getInboxId.call(context, itemIndex);
	const userIds = context.getNodeParameter('userIds', itemIndex) as number[];

	const result = await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/inbox_members`,
		{ inbox_id: inboxId, user_ids: userIds },
	) as IDataObject;

	return { json: result };
}

async function onWhatsapp(context: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getWhatsappSpecialProviderInboxId.call(context, itemIndex);
	const phoneNumber = context.getNodeParameter('phoneNumber', itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}/on_whatsapp`,
		{ phone_number: phoneNumber },
	) as IDataObject;

	return { json: result };
}

async function whatsappDisconnect(context: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData>{
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getWhatsappSpecialProviderInboxId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}/disconnect_channel_provider`,
	) as IDataObject;

	return { json: result };
}

async function whatsappGetQrCode(context: IExecuteFunctions, itemIndex: number):  Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getWhatsappSpecialProviderInboxId.call(context, itemIndex);

	await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}/setup_channel_provider`,
	);

	const maxAttempts = 20;
	const pollInterval = 3000;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const response = (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/inboxes/${inboxId}`
		)) as IDataObject;

		const providerConnection = response.provider_connection as IDataObject;
		const connectionStatus = providerConnection?.connection as string;

		if (connectionStatus === 'connecting' && providerConnection.qr_data_url) {
			const qrDataUrl = providerConnection.qr_data_url as string;

			const dataUrlMatch = qrDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);

			if (dataUrlMatch) {
				const mimeType = dataUrlMatch[1];
				const base64Data = dataUrlMatch[2];

				const binaryBuffer = Buffer.from(base64Data, 'base64');

				const binaryData = await context.helpers.prepareBinaryData(
					binaryBuffer,
					'qr-code.png',
					mimeType,
				);

				return {
					json: {
						message: 'QR Code generated successfully',
						connection: 'connecting',
						qr_code_url: qrDataUrl,
					},
					binary: {
						file: binaryData,
					}
				};
			}

			return {
				json: {
					message: 'QR Code URL retrieved successfully',
					connection: 'connecting',
					qr_code_url: qrDataUrl,
				}
			};
		}

		if (connectionStatus === 'open') {
			context.addExecutionHints({
				message: 'This WhatsApp inbox is already connected and ready to send/receive messages.',
				type: 'info',
				location: 'outputPane',
			});

			return {
				json:{
					message: 'Channel already connected',
					connection: 'open',
				}
			};
		}

		if (connectionStatus === 'reconnecting') {
			// Connection is being re-established, keep polling
		}

		if (attempt < maxAttempts - 1) {
			await asyncSleep(pollInterval);
		}
	}

	throw new NodeOperationError(
		context.getNode(),
		`Timeout waiting for QR code after ${maxAttempts} attempts`,
		{ itemIndex },
	);
}
