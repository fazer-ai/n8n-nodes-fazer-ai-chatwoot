import type { INodeProperties } from 'n8n-workflow';
import {
	accountSelector,
	inboxSelector,
	conversationSelector,
	contactSelector,
	conversationStatusOptions,
	customAttributesField,
	responseFilterFields,
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
				name: 'Add Labels',
				value: 'setLabels',
				description: 'Add labels to a conversation',
				action: 'Add labels to conversation',
			},
			{
				name: 'Assign Agent',
				value: 'assignAgent',
				description: 'Assign an agent to a conversation',
				action: 'Assign agent to conversation',
			},
			{
				name: 'Assign Team',
				value: 'assignTeam',
				description: 'Assign a team to a conversation',
				action: 'Assign team to conversation',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new conversation',
				action: 'Create conversation',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific conversation',
				action: 'Get conversation',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many conversations',
				action: 'Get many conversations',
			},
			{
				name: 'Set Custom Attribute',
				value: 'setCustomAttribute',
				description: 'Set custom attributes on a conversation',
				action: 'Set custom attribute on conversation',
			},
			{
				name: 'Toggle Status',
				value: 'toggleStatus',
				description: 'Toggle conversation status (resolved/open)',
				action: 'Toggle conversation status',
			},
		],
		default: 'getAll',
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
				operation: ['getAll'],
			},
		},
	},
	{
		...conversationSelector,
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['get', 'toggleStatus', 'assignAgent', 'assignTeam', 'setLabels', 'setCustomAttribute'],
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
				operation: ['getAll'],
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
			loadOptionsMethod: 'getAgents',
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
			loadOptionsMethod: 'getTeams',
		},
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['assignTeam'],
			},
		},
	},
	{
		displayName: 'Label Names or IDs',
		name: 'labels',
		type: 'multiOptions',
		default: [],
		description: 'Select labels to add. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getLabels',
		},
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['setLabels'],
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
		...responseFilterFields,
		displayOptions: {
			show: {
				...showOnlyForConversation,
				operation: ['get', 'getAll', 'setCustomAttribute'],
			},
		},
	},
];

export const conversationDescription: INodeProperties[] = [
	...conversationOperations,
	...conversationFields,
];
