import type { INodeProperties } from 'n8n-workflow';
import { accountSelector, teamSelector, agentSelector, teamMemberSelector } from '../../shared/descriptions';

const showOnlyForTeam = {
	resource: ['team'],
};

const teamOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForTeam,
		},
		options: [
			{
				name: 'Assign Agent',
				value: 'assignAgent',
				description: 'Assign agents to a team',
				action: 'Assign agent to team',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new team',
				action: 'Create team',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a team',
				action: 'Delete team',
			},
			{
				name: 'Get Team Members',
				value: 'getTeamMembers',
				description: 'Get all members of a team',
				action: 'Get team members',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all teams',
				action: 'List teams',
			},
			{
				name: 'Unassign Agent',
				value: 'unassignAgent',
				description: 'Remove an agent from a team',
				action: 'Unassign agent from team',
			},
		],
		default: 'create',
	},
];

const teamFields: INodeProperties[] = [
	{
		...accountSelector,
		displayOptions: {
			show: showOnlyForTeam,
		},
	},
	{
		...teamSelector,
		displayOptions: {
			show: {
				...showOnlyForTeam,
				operation: ['delete', 'getTeamMembers', 'assignAgent', 'unassignAgent'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the team',
		displayOptions: {
			show: {
				...showOnlyForTeam,
				operation: ['create'],
			},
		},
	},
	{
		...agentSelector,
		displayOptions: {
			show: {
				...showOnlyForTeam,
				operation: ['assignAgent'],
			},
		},
	},
	{
		...teamMemberSelector,
		displayOptions: {
			show: {
				...showOnlyForTeam,
				operation: ['unassignAgent'],
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
				...showOnlyForTeam,
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Allow Auto Assign',
				name: 'allow_auto_assign',
				type: 'boolean',
				default: true,
				description: 'Whether to allow automatic assignment of conversations to this team',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the team',
			},
		],
	},
];

export const teamDescription: INodeProperties[] = [
	...teamOperations,
	...teamFields,
];
