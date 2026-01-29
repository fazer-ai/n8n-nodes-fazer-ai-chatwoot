import type { INodeProperties } from 'n8n-workflow';
import {
  accountSelector,
  inboxSelector,
  whatsappSpecialInboxInboxSelector,
  chatwootFazerAiOnlyOperation
} from '../../shared/descriptions';

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
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
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
				name: 'List Agents',
				value: 'listAgents',
				description: 'List agents assigned to an inbox',
				action: 'List agents in inbox',
			},
			{
				name: 'Add Agents',
				value: 'addAgents',
				description: 'Add agents to an inbox',
				action: 'Add agents to inbox',
			},
			{
				name: 'Update Agents',
				value: 'updateAgents',
				description: 'Replace all agents in an inbox (removes agents not in the list)',
				action: 'Update agents in inbox',
			},
			{
				name: 'Remove Agents',
				value: 'removeAgents',
				description: 'Remove agents from an inbox',
				action: 'Remove agents from inbox',
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
				action: 'Get WhatsApp inbox QR code for connection',
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
				operation: ['get', 'listAgents', 'addAgents', 'updateAgents', 'removeAgents'],
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
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options
		displayName: 'Agents',
		name: 'userIds',
		type: 'multiOptions',
		default: [],
		required: true,
		description: 'Select agents to add, update, or remove. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'loadAgentsOptions',
		},
		displayOptions: {
			show: {
				...showOnlyForInbox,
				operation: ['addAgents', 'updateAgents', 'removeAgents'],
			},
		},
	}
];

export const inboxDescription: INodeProperties[] = [
	...inboxOperations,
	...inboxFields,
];

export { executeInboxOperation } from './operations';
