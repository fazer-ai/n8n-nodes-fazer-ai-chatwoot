import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	inboxSelector,
	webhookSelector,
	webhookEventsSelect,
	responseFilterFields,
} from '../../shared/descriptions';

const showOnlyForWebhook = {
	resource: ['webhook'],
};

// Inbox selector with "All Inboxes" option for webhooks
const webhookInboxSelector: INodeProperties = {
	...inboxSelector,
	required: false,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select an inbox...',
			typeOptions: {
        searchListMethod: 'searchInboxes',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. 1 (leave empty for all)',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[0-9]*$',
						errorMessage: 'The ID must be a number or empty',
					},
				},
			],
		},
	],
};

const webhookOperations: INodeProperties[] = [
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

const webhookFields: INodeProperties[] = [
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
	{
		...webhookEventsSelect,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
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
			},
		},
	},
	{
		...webhookInboxSelector,
		displayOptions: {
			show: {
				...showOnlyForWebhook,
				operation: ['create', 'update'],
				filterByInbox: [true],
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
