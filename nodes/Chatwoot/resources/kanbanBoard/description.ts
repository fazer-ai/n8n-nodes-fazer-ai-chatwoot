import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, responseFilterFields } from '../../shared/descriptions';

const resource = 'kanbanBoard';

const kanbanBoardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: [resource] },
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new Kanban board',
				action: 'Create a kanban board',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a Kanban board',
				action: 'Delete a kanban board',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific Kanban board',
				action: 'Get a kanban board',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many Kanban boards',
				action: 'Get many kanban boards',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a Kanban board',
				action: 'Update a kanban board',
			},
			{
				name: 'Update Agents',
				value: 'updateAgents',
				description: 'Update agents assigned to a board',
				action: 'Update kanban board agents',
			},
			{
				name: 'Update Inboxes',
				value: 'updateInboxes',
				description: 'Update inboxes linked to a board',
				action: 'Update kanban board inboxes',
			},
		],
		default: 'getAll',
	},
];

const boardIdField: INodeProperties = {
	displayName: 'Board',
	name: 'boardId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the board',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a board...',
			typeOptions: {
				searchListMethod: 'searchKanbanBoards',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. 1',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[0-9]+$',
						errorMessage: 'The ID must be a number',
					},
				},
			],
		},
	],
};

const kanbanBoardFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: { resource: [resource] },
		},
	},
	{
		...boardIdField,
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['get', 'update', 'delete', 'updateAgents', 'updateInboxes'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'boardName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the board',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'boardAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the board',
			},
			{
				displayName: 'Inbox IDs',
				name: 'inbox_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of inbox IDs to link',
				placeholder: 'e.g. 1,2,3',
			},
			{
				displayName: 'Settings (JSON)',
				name: 'settings',
				type: 'json',
				default: '{}',
				description: 'Custom settings as JSON',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateBoardFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description for the board',
			},
			{
				displayName: 'Inbox IDs',
				name: 'inbox_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of inbox IDs',
				placeholder: 'e.g. 1,2,3',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the board',
			},
			{
				displayName: 'Settings (JSON)',
				name: 'settings',
				type: 'json',
				default: '{}',
				description: 'Custom settings as JSON',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'boardFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				default: 'desc',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
			},
			{
				displayName: 'Sort By',
				name: 'sort',
				type: 'options',
				default: 'updated_at',
				options: [
					{ name: 'Created At', value: 'created_at' },
					{ name: 'Name', value: 'name' },
					{ name: 'Updated At', value: 'updated_at' },
				],
			},
		],
	},
	{
		displayName: 'Agent IDs',
		name: 'agentIds',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated list of agent IDs to assign to the board',
		placeholder: 'e.g. 1,2,3',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['updateAgents'],
			},
		},
	},
	{
		displayName: 'Inbox IDs',
		name: 'inboxIds',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated list of inbox IDs to link to the board',
		placeholder: 'e.g. 1,2,3',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['updateInboxes'],
			},
		},
	},
	{
		...responseFilterFields,
		displayOptions: {
			show: { resource: [resource] },
		},
	},
];

export const kanbanBoardDescription: INodeProperties[] = [
	...kanbanBoardOperations,
	...kanbanBoardFields,
];
