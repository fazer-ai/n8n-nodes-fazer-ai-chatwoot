import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	inboxSelector,
	conversationSelector,
	contactSelector,
	conversationStatusOptions,
	customAttributesField,
} from '../../shared/descriptions';

const showOnlyForConversation = {
	resource: ['conversation'],
};

const conversationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForConversation,
		},
		options: [
			{
				name: 'Add Label',
				value: 'addLabel',
				description: 'Append a label to conversation',
				action: 'Append a label to conversation',
			},
			{
				name: 'Assign Agent',
				value: 'assignAgent',
				description: 'Assign an agent to conversation',
				action: 'Assign agent to conversation',
			},
			{
				name: 'Assign Team',
				value: 'assignTeam',
				description: 'Assign a team to conversation',
				action: 'Assign team to conversation',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new conversation',
				action: 'Create conversation',
			},
			{
				name: 'Destroy Custom Attributes',
				value: 'destroyCustomAttributes',
				description: 'Reset custom attributes in conversation',
				action: 'Reset custom attributes in conversation',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific conversation',
				action: 'Get conversation',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List conversations',
				action: 'List conversations',
			},
			{
				name: 'List Messages',
				value: 'listMessages',
				description: 'List messages in conversation',
				action: 'List messages in conversation',
			},
			{
				name: 'Remove Label',
				value: 'removeLabel',
				description: 'Remove a label from conversation',
				action: 'Remove label from conversation',
			},
			{
				name: 'Send File',
				value: 'sendFile',
				description: 'Send a file message in conversation',
				action: 'Send file message in conversation',

			},
			{
				name: 'Send Message',
				value: 'sendMessage',
				description: 'Send a text message in conversation',
				action: 'Send text message in conversation',
			},
			{
				name: 'Set Custom Attributes',
				value: 'setCustomAttributes',
				description: 'Set custom attributes on conversation',
				action: 'Set custom attributes on conversation',
			},
			{
				name: 'Set Priority',
				value: 'setPriority',
				description: 'Set priority for conversation',
				action: 'Set conversation priority',
			},
			{
				name: 'Toggle Status',
				value: 'toggleStatus',
				description: 'Toggle conversation status between open, pending, resolved, and snoozed',
				action: 'Toggle conversation status',
			},
			{
				name: 'Update Labels',
				value: 'updateLabels',
				description: 'Update labels to conversation',
				action: 'Update labels to conversation',
			},
			{
				name: 'Update Last Seen',
				value: 'updateLastSeen',
				description: 'Update the last seen timestamp of the conversation',
				action: 'Update last seen timestamp',
			},
			{
				name: 'Update Presence',
				value: 'updatePresence',
				description: 'Define presence status as off, typing or recording',
				action: 'Define presence status',
			},
		],
		default: 'list',
	},
];

const conversationFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForConversation,
		},
	},
	{
		...inboxSelector,
		required: false,
		description: 'Optionally filter by inbox',
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['list'],
			},
		},
	},
	{
		...conversationSelector,
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['get', 'toggleStatus', 'assignAgent', 'assignTeam', 'updateLabels', 'setCustomAttribute', 'setPriority'],
			},
		},
	},
	{
		...conversationStatusOptions,
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['toggleStatus'],
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Assignee Type',
				name: 'assignee_type',
				type: 'options',
				default: 'all',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Me', value: 'me' },
					{ name: 'Unassigned', value: 'unassigned' },
				],
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'open',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Open', value: 'open' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Resolved', value: 'resolved' },
					{ name: 'Snoozed', value: 'snoozed' },
				],
			},
		],
	},
	{
		displayName: 'Agent Name or ID',
		name: 'agentId',
		type: 'options',
		default: '',
		required: true,
		description: 'Select the agent to assign. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'loadAgentsOptions',
		},
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['assignAgent'],
			},
		},
	},
	{
		displayName: 'Team Name or ID',
		name: 'teamId',
		type: 'options',
		default: '',
		required: true,
		description: 'Select the team to assign. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'loadTeamsOptions',
		},
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['assignTeam'],
			},
		},
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options
		displayName: 'Labels',
		name: 'labels',
		type: 'multiOptions',
		default: [],
		description: 'Select labels to add. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'loadLabelsOptions',
		},
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['updateLabels'],
			},
		},
	},
	{
		...inboxSelector,
		required: false,
		description: 'Inbox to create the conversation in (optional)',
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['create'],
			},
		},
	},
	{
		...contactSelector,
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: [],
			},
		},
		options: [
			{
				...customAttributesField,
			},
			{
				displayName: 'Source ID',
				name: 'source_id',
				type: 'string',
				default: '',
				description: 'Source ID for the conversation',
			},
		],
	},
	{
		displayName: 'Custom Attributes',
		name: 'customAttributes',
		type: 'json',
		default: '{}',
		required: true,
		description: 'Custom attributes as JSON object (key-value pairs)',
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['setCustomAttribute'],
			},
		},
	},
	{
		displayName: 'Priority',
		name: 'priority',
		type: 'options',
		default: 'null',
		required: true,
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{ name: 'None', value: 'null' },
			{ name: 'Low', value: 'low' },
			{ name: 'Medium', value: 'medium' },
			{ name: 'High', value: 'high' },
			{ name: 'Urgent', value: 'urgent' },
		],
		description: 'Priority level for the conversation',
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['setPriority'],
			},
		},
	},
	{
		displayName: 'Snooze Until',
		name: 'snoozeUntil',
		type: 'dateTime',
		default: '',
		description: 'Timestamp until which the conversation is snoozed',
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['toggleStatus'],
				status: ['snoozed'],
			},
		},
	}
];

export const conversationDescription: INodeProperties[] = [
	...conversationOperations,
	...conversationFields,
];
