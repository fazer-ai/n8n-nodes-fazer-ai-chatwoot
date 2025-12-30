import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, agentSelector, inboxSelector, kanbanBoardSelector } from '../../shared/descriptions';

const showOnlyForKanbanBoard = {
	resource: ['kanbanBoard'],
};

const kanbanBoardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { ...showOnlyForKanbanBoard },
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
				name: 'List',
				value: 'list',
				description: 'List Kanban boards',
				action: 'List kanban boards',
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
		default: 'create',
	},
];

const kanbanBoardFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: { ...showOnlyForKanbanBoard },
		},
	},
	{
		...kanbanBoardSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['get', 'update', 'delete', 'updateAgents', 'updateInboxes'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the board',
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'Description of the board',
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateBoardFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
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
				...showOnlyForKanbanBoard,
				operation: ['list'],
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
		...agentSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['updateAgents'],
			},
		},
	},
	{
		...inboxSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['updateInboxes'],
			},
		},
	},
];

export const kanbanBoardDescription: INodeProperties[] = [
	...kanbanBoardOperations,
	...kanbanBoardFields,
];
