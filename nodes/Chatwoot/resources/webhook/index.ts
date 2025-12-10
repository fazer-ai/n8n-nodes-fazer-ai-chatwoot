import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	inboxSelector,
	webhookSelector,
	webhookEventsSelect,
	rawJsonBody,
	responseFilterFields,
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
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForWebhook,
		},
	},
	{
		...webhookSelector,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['update', 'delete'],
			},
		},
	},
	{
		displayName: 'Use Raw JSON',
		name: 'useRawJson',
		type: 'boolean',
		default: false,
		description: 'Whether to use raw JSON body instead of fields',
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
			},
		},
	},
	{
		...rawJsonBody,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
				useRawJson: [true],
			},
		},
	},
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
				useRawJson: [false],
			},
		},
	},
	{
		...webhookEventsSelect,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
				useRawJson: [false],
			},
		},
	},
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
				useRawJson: [false],
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
				useRawJson: [false],
			},
		},
	},
	{
		displayName: 'Auto-Setup Webhook',
		name: 'autoSetup',
		type: 'boolean',
		default: false,
		description: 'Whether to automatically setup the webhook when enabling the workflow',
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create'],
				useRawJson: [false],
			},
		},
	},
	{
		...responseFilterFields,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['getAll'],
			},
		},
	},
];

export const webhookDescription: INodeProperties[] = [
	...webhookOperations,
	...webhookFields,
];

export { executeWebhookOperation } from './operations';
