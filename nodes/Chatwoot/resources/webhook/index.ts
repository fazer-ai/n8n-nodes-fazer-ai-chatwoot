import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	inboxSelector,
	webhookSelector,
	webhookEventsSelect,
} from '../../shared/descriptions';

const showOnlyForWebhook = {
	resource: ['webhook'],
};

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForWebhook,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new webhook',
				action: 'Create webhook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook',
				action: 'Delete webhook',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many webhooks',
				action: 'Get webhooks',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a webhook',
				action: 'Update webhook',
			},
		],
		default: 'getAll',
	},
];

export const webhookFields: INodeProperties[] = [
	// ============================================
	// Account Selection (all operations)
	// ============================================
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForWebhook,
		},
	},

	// ============================================
	// Webhook Selector (update/delete)
	// ============================================
	{
		...webhookSelector,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['update', 'delete'],
			},
		},
	},

	// ============================================
	// Webhook URL (create/update)
	// ============================================
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://your-webhook-url.com/webhook',
		description: 'The URL to receive webhook events',
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
			},
		},
	},

	// ============================================
	// Events Selector (create/update)
	// ============================================
	{
		...webhookEventsSelect,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
			},
		},
	},

	// ============================================
	// Optional Inbox Filter (create/update)
	// ============================================
	{
		displayName: 'Filter by Inbox',
		name: 'filterByInbox',
		type: 'boolean',
		default: false,
		description: 'Whether to filter events to a specific inbox',
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
			},
		},
	},
	{
		...inboxSelector,
		required: false,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
				filterByInbox: [true],
			},
		},
	},

	// ============================================
	// Auto-setup Webhook Option (like Telegram)
	// ============================================
	{
		displayName: 'Auto-Setup Webhook',
		name: 'autoSetup',
		type: 'boolean',
		default: false,
		// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
		description: 'Automatically setup the webhook when enabling the workflow (similar to Telegram). Note: This requires a trigger node.',
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create'],
			},
		},
	},
];

export const webhookDescription: INodeProperties[] = [
	...webhookOperations,
	...webhookFields,
];
