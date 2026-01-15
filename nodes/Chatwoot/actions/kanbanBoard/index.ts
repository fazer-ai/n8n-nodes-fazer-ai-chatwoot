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
		displayName: 'Automations',
		name: 'automations',
		type: 'fixedCollection',
		placeholder: 'Configure board automations',
		default: {},
		// NOTE: Prevents the field from collapsing when editing other fields like name or description
		typeOptions: {
			multipleValues: false,
		},
		displayOptions: {
			show: {
				...showOnlyForKanbanBoard,
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Settings',
				name: 'settings',
				values: [
					{
						displayName: 'Auto-Assign Conversation to Agent',
						name: 'auto_assign_agent_to_conversation',
						description: 'Whether to automatically assign an agent to all unassigned conversations linked to a task when that agent is assigned to the task',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Auto-Assign Task to Agent',
						name: 'auto_assign_task_to_agent',
						description: 'Whether to automatically assign a task to an available online agent when the task is created without an assigned agent',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Auto-Complete Task on Conversation Resolve',
						name: 'auto_complete_task_on_conversation_resolve',
						description: 'Whether to automatically move a task to the completed step when its linked conversation is resolved',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Auto-Create Task for New Conversations',
						name: 'auto_create_task_for_conversation',
						description: 'Whether to automatically create a task when a new conversation is created in any of the board\'s assigned inboxes',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Auto-Resolve Conversations on Task End',
						name: 'auto_resolve_conversation_on_task_end',
						description: 'Whether to automatically resolve all linked conversations when a task is moved to a completed or cancelled step',
						type: 'boolean',
						default: true,
					},
				],
			},
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
