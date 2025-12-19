import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, responseFilterFields } from '../../shared/descriptions';

const resource = 'kanbanTask';

const kanbanTaskOperations: INodeProperties[] = [
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
				description: 'Create a new task',
				action: 'Create a kanban task',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a task',
				action: 'Delete a kanban task',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific task',
				action: 'Get a kanban task',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many tasks',
				action: 'Get many kanban tasks',
			},
			{
				name: 'Move',
				value: 'move',
				description: 'Move a task to another step or position',
				action: 'Move a kanban task',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a task',
				action: 'Update a kanban task',
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

const stepIdField: INodeProperties = {
	displayName: 'Step',
	name: 'stepId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the step (column)',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a step...',
			typeOptions: {
				searchListMethod: 'searchKanbanSteps',
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

const taskIdField: INodeProperties = {
	displayName: 'Task',
	name: 'taskId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'Select the task',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a task...',
			typeOptions: {
				searchListMethod: 'searchKanbanTasks',
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

const kanbanTaskFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: { resource: [resource] },
		},
	},
	{
		...boardIdField,
		required: false,
		description: 'Filter tasks by board (optional)',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['getAll'],
			},
		},
	},
	{
		...boardIdField,
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
	},
	{
		...stepIdField,
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
	},
	{
		...taskIdField,
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['get', 'update', 'delete', 'move'],
			},
		},
	},
	{
		displayName: 'Title',
		name: 'taskTitle',
		type: 'string',
		default: '',
		required: true,
		description: 'Title of the task',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'taskAdditionalFields',
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
				displayName: 'Assigned Agent IDs',
				name: 'assigned_agent_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of agent IDs to assign',
				placeholder: 'e.g. 1,2',
			},
			{
				displayName: 'Contact IDs',
				name: 'contact_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of contact IDs to link',
				placeholder: 'e.g. 10,20,30',
			},
			{
				displayName: 'Conversation IDs',
				name: 'conversation_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of conversation IDs to link',
				placeholder: 'e.g. 100,200',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Detailed description of the task',
			},
			{
				displayName: 'End Date',
				name: 'end_date',
				type: 'dateTime',
				default: '',
				description: 'End/due date of the task',
			},
			{
				displayName: 'Insert Before Task ID',
				name: 'insert_before_task_id',
				type: 'number',
				default: 0,
				description: 'ID of task to insert before (for ordering)',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				default: 'medium',
				options: [
					{ name: 'High', value: 'high' },
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'Urgent', value: 'urgent' },
				],
			},
			{
				displayName: 'Start Date',
				name: 'start_date',
				type: 'dateTime',
				default: '',
				description: 'Start date of the task',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'taskUpdateFields',
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
				displayName: 'Assigned Agent IDs',
				name: 'assigned_agent_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of agent IDs',
				placeholder: 'e.g. 1,2',
			},
			{
				displayName: 'Contact IDs',
				name: 'contact_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of contact IDs',
				placeholder: 'e.g. 10,20,30',
			},
			{
				displayName: 'Conversation IDs',
				name: 'conversation_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of conversation IDs',
				placeholder: 'e.g. 100,200',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'New description for the task',
			},
			{
				displayName: 'End Date',
				name: 'end_date',
				type: 'dateTime',
				default: '',
				description: 'New end/due date',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				default: 'medium',
				options: [
					{ name: 'High', value: 'high' },
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'Urgent', value: 'urgent' },
				],
			},
			{
				displayName: 'Start Date',
				name: 'start_date',
				type: 'dateTime',
				default: '',
				description: 'New start date',
			},
			{
				displayName: 'Step ID',
				name: 'board_step_id',
				type: 'number',
				default: 0,
				description: 'Move to a different step (column)',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'New title for the task',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'taskFilters',
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
				displayName: 'Assigned Agent IDs',
				name: 'assigned_agent_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of agent IDs to filter by',
				placeholder: 'e.g. 1,2',
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
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				default: '',
				options: [
					{ name: 'All', value: '' },
					{ name: 'High', value: 'high' },
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'Urgent', value: 'urgent' },
				],
			},
			{
				displayName: 'Sort By',
				name: 'sort',
				type: 'options',
				default: 'updated_at',
				options: [
					{ name: 'Created At', value: 'created_at' },
					{ name: 'Priority', value: 'priority' },
					{ name: 'Title', value: 'title' },
					{ name: 'Updated At', value: 'updated_at' },
				],
			},
			{
				displayName: 'Step ID',
				name: 'board_step_id',
				type: 'number',
				default: 0,
				description: 'Filter by step (column) ID',
			},
		],
	},
	{
		...stepIdField,
		displayName: 'Target Step',
		name: 'targetStepId',
		required: false,
		description: 'The step (column) to move the task to',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['move'],
			},
		},
	},
	{
		displayName: 'Insert Before Task ID',
		name: 'insertBeforeTaskId',
		type: 'number',
		default: 0,
		description: 'ID of the task that should come after this one (for ordering). Leave 0 to append at the end.',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['move'],
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

export const kanbanTaskDescription: INodeProperties[] = [
	...kanbanTaskOperations,
	...kanbanTaskFields,
];
