import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, kanbanBoardSelector, kanbanStepSelector, kanbanTaskSelector } from '../../shared/descriptions';

const showOnlyForKanbanTask = {
	resource: ['kanbanTask'],
};

const kanbanTaskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { ...showOnlyForKanbanTask },
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
				name: 'List',
				value: 'list',
				description: 'List tasks from a board',
				action: 'List kanban tasks',
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
		default: 'create',
	},
];

const kanbanTaskFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: { ...showOnlyForKanbanTask },
		},
	},
	{
		...kanbanBoardSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanTask,
				operation: ['create', 'delete'],
			},
		},
	},
	{
		...kanbanBoardSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanTask,
				operation: ['get', 'list', 'move', 'update'],
			},
		},
	},
	{
		...kanbanStepSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanTask,
				operation: ['create', 'move'],
			},
		},
	},
	{
		...kanbanTaskSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanTask,
				operation: ['get', 'update', 'delete', 'move'],
			},
		},
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		description: 'Title of the task',
		displayOptions: {
			show: {
				...showOnlyForKanbanTask,
				operation: ['create', 'update'],
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
				...showOnlyForKanbanTask,
				operation: ['create', 'update'],
			},
		},
		options: [
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
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				default: 'normal',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Normal', value: 'normal' },
					{ name: 'High', value: 'high' },
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
			{
				displayName: 'End Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'End/due date of the task',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForKanbanTask,
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				default: 'asc',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
			},
			{
				displayName: 'Sort By',
				name: 'sort',
				type: 'options',
				default: 'position',
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{ name: 'Manual', value: 'position' },
					{ name: 'Name', value: 'title' },
					{ name: 'Last Activity', value: 'updated_at' },
					{ name: 'Created At', value: 'created_at' },
					{ name: 'Priority', value: 'priority' },
					{ name: 'Due Date', value: 'due_date' },
				],
			},
		],
	},
];

export const kanbanTaskDescription: INodeProperties[] = [
	...kanbanTaskOperations,
	...kanbanTaskFields,
];
