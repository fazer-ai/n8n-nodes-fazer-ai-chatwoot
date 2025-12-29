import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, responseFilterFields } from '../../shared/descriptions';

const resource = 'kanbanStep';

const kanbanStepOperations: INodeProperties[] = [
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
				description: 'Create a new step (column) in a board',
				action: 'Create a kanban step',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a step from a board',
				action: 'Delete a kanban step',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List steps from a board',
				action: 'List kanban steps',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a step in a board',
				action: 'Update a kanban step',
			},
		],
		default: 'create',
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

const kanbanStepFields: INodeProperties[] = [
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
				operation: ['create', 'list', 'update', 'delete'],
			},
		},
	},
	{
		...stepIdField,
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['update', 'delete'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'stepName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the step (column)',
		displayOptions: {
			show: {
				resource: [resource],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'stepAdditionalFields',
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
				displayName: 'Cancelled',
				name: 'cancelled',
				type: 'boolean',
				default: false,
				description: 'Whether this step represents cancelled tasks',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#3498db',
				description: 'Color for the step column',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the step',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateStepFields',
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
				displayName: 'Cancelled',
				name: 'cancelled',
				type: 'boolean',
				default: false,
				description: 'Whether this step represents cancelled tasks',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#3498db',
				description: 'New color for the step',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description for the step',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the step',
			},
		],
	},
	{
		...responseFilterFields,
		displayOptions: {
			show: { resource: [resource] },
		},
	},
];

export const kanbanStepDescription: INodeProperties[] = [
	...kanbanStepOperations,
	...kanbanStepFields,
];
