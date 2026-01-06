import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, inboxSelector, whatsappSpecialInboxInboxSelector, chatwootFazerAiOnlyOperation } from '../../shared/descriptions';

const showOnlyForInbox = {
	resource: ['inbox'],
};

const inboxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForInbox,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get information about a specific inbox',
				action: 'Get inbox info',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List many inboxes in an account',
				action: 'List inboxes',
			},
			{
				name: 'On WhatsApp',
				value: 'onWhatsapp',
				description: 'Check if a phone number is registered on WhatsApp',
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'Check if phone number is registered on WhatsApp',
			},
			{
				name: 'WhatsApp Disconnect',
				value: 'whatsappDisconnect',
				description: 'Disconnect WhatsApp inbox',
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'Disconnect WhatsApp inbox',
			},
			{
				name: 'WhatsApp Get Qr Code',
				value: 'whatsappGetQrCode',
				description: 'Get WhatsApp inbox QR code for connection',
				// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
				action: 'Get WhatsApp inbox qr code for connection',
			},
		],
		default: 'list',
	},
];

const inboxFields: INodeProperties[] = [
	{
		...chatwootFazerAiOnlyOperation('On WhatsApp'),
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['onWhatsapp'],
			},
		},
	},
	{
		...chatwootFazerAiOnlyOperation('WhatsApp Disconnect'),
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['whatsappDisconnect'],
			},
		},
	},
	{
		...chatwootFazerAiOnlyOperation('WhatsApp Get QR Code'),
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['whatsappGetQrCode'],
			},
		},
	},
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForInbox,
		},
	},
	{
		...inboxSelector,
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['get'],
			},
		},
	},
	{
		...whatsappSpecialInboxInboxSelector,
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['onWhatsapp', 'whatsappDisconnect', 'whatsappGetQrCode'],
			},
		},
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		description: 'Phone number to check on WhatsApp (e.g., +5511999999999)',
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['onWhatsapp'],
			},
		},
	}
];

export const inboxDescription: INodeProperties[] = [
	...inboxOperations,
	...inboxFields,
];
