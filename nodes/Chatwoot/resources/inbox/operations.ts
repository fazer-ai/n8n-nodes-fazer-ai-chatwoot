import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest, getAccountId, getInboxId, getWhatsappSpecialProviderInboxId } from '../../shared/transport';
import { InboxOperation } from './types';

export async function executeInboxOperation(
  context: IExecuteFunctions,
  operation: InboxOperation,
  itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
  switch (operation) {
	case 'get':
		return getInbox(context, itemIndex);
  case 'list':
    return listInboxes(context, itemIndex);
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
): Promise<IDataObject | IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);

	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes`,
	)) as IDataObject;

	return (response.payload as IDataObject[]) || response;
}

async function getInbox(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getInboxId.call(context, itemIndex);

	return (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}`,
	)) as IDataObject;
}

async function onWhatsapp(context: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getWhatsappSpecialProviderInboxId.call(context, itemIndex);
	const phoneNumber = context.getNodeParameter('phoneNumber', itemIndex);

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}/on_whatsapp`,
		{ phone_number: phoneNumber },
	)) as IDataObject;
}

async function whatsappDisconnect(context: IExecuteFunctions, itemIndex: number): Promise<IDataObject>{
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getWhatsappSpecialProviderInboxId.call(context, itemIndex);

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}/disconnect_channel_provider`,
	)) as IDataObject;
}

async function whatsappGetQrCode(context: IExecuteFunctions, itemIndex: number):  Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const inboxId = getWhatsappSpecialProviderInboxId.call(context, itemIndex);

	await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/inboxes/${inboxId}/setup_channel_provider`,
	);

	const maxAttempts = 6;
	const pollInterval = 15000;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const response = (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/inboxes/${inboxId}`
		)) as IDataObject;

		const provider_connection = response.provider_connection as IDataObject;

		if (provider_connection?.connection === 'connecting' && provider_connection.qr_data_url) {
			const qrDataUrl = provider_connection.qr_data_url as string;

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
					success: true,
					message: 'QR Code generated successfully',
					connection: 'connecting',
					__binaryData: binaryData,
				};
			}

			return {
				success: true,
				message: 'QR Code URL retrieved successfully',
				connection: 'connecting',
				qr_code_url: qrDataUrl,
			};
		}

		if (provider_connection?.connection === 'connected') {
			return {
				success: true,
				message: 'Channel already connected',
				connection: 'connected',
			};
		}

		if (attempt < maxAttempts - 1) {
			const waitUntil = Date.now() + pollInterval;
			while (Date.now() < waitUntil) {
				await new Promise((resolve) => resolve(undefined));
			}
		}
	}

	return {
		success: false,
		message: `Timeout waiting for QR code after ${maxAttempts} attempts`,
	};
}
