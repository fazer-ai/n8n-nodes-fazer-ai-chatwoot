import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, kanbanBoardSelector } from '../../shared/descriptions';

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
				operation: ['create', 'update'],
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
				operation: ['create', 'update'],
			},
		},
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
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Order',
		name: 'order',
		type: 'options',
		default: 'desc',
		options: [
			{ name: 'Ascending', value: 'asc' },
			{ name: 'Descending', value: 'desc' },
		],
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Agents to Assign',
		name: 'agentIds',
		type: 'multiOptions',
		default: [],
		required: true,
		description: 'Select the agents to assign to this board. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'loadAgentsOptions',
		},
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['updateAgents'],
			},
		},
	},
	{
		displayName: 'Inboxes to Link',
		name: 'inboxIds',
		type: 'multiOptions',
		default: [],
		required: true,
		description: 'Select the inboxes to link to this board. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'loadInboxesOptions',
		},
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

export { executeKanbanBoardOperation } from './operations';
