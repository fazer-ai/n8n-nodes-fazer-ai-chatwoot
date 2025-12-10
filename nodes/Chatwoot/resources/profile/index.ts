import type { INodeProperties } from 'n8n-workflow';
import { responseFilterFields } from '../../shared/descriptions';

const showOnlyForProfile = {
	resource: ['profile'],
};

export const profileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProfile,
		},
		options: [
			{
				name: 'Fetch Profile',
				value: 'fetch',
				description: 'Fetch the current user profile',
				action: 'Fetch profile',
			},
		],
		default: 'fetch',
	},
];

export const profileFields: INodeProperties[] = [
	{
		...responseFilterFields,
		displayOptions: {
			show: {
				...showOnlyForProfile,
				operation: ['fetch'],
			},
		},
	},
];

export const profileDescription: INodeProperties[] = [
	...profileOperations,
	...profileFields,
];

export { executeProfileOperation } from './operations';
