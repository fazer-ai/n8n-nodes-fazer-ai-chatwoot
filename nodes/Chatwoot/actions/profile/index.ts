import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProfile = {
	resource: ['profile'],
};

const profileOperations: INodeProperties[] = [
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
				name: 'Get Profile',
				value: 'get',
				description: 'Get the current user profile information',
				action: 'Get profile',
			},
		],
		default: 'get',
	},
];

export const profileDescription: INodeProperties[] = [
	...profileOperations,
];

export { executeProfileOperation } from './operations';
