import type { INodeProperties } from 'n8n-workflow';
import {
  accountSelector,
  kanbanBoardSelector,
  kanbanStepSelector
} from '../../shared/descriptions';

const showOnlyForKanbanStep = {
	resource: ['kanbanStep'],
};

const kanbanStepOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { ...showOnlyForKanbanStep },
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

const kanbanStepFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: { ...showOnlyForKanbanStep },
		},
	},
	{
		...kanbanBoardSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanStep,
				operation: ['create', 'list', 'update', 'delete'],
			},
		},
	},
	{
		...kanbanStepSelector,
		displayOptions: {
			show: {
				...showOnlyForKanbanStep,
				operation: ['update', 'delete'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the step (column)',
		displayOptions: {
			show: {
				...showOnlyForKanbanStep,
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
				...showOnlyForKanbanStep,
				operation: ['create'],
			},
		},
		options: [
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
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the step',
			},
			{
				displayName: 'Cancelled',
				name: 'cancelled',
				type: 'boolean',
				default: true,
				description: 'Whether this step represents cancelled tasks',
			}
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
				...showOnlyForKanbanStep,
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
				typeOptions: {
					rows: 4,
				},
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
];

export const kanbanStepDescription: INodeProperties[] = [
	...kanbanStepOperations,
	...kanbanStepFields,
];

export { executeKanbanStepOperation } from './operations';
