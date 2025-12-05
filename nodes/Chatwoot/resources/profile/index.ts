import type { INodeProperties } from 'n8n-workflow';

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
	// No additional fields needed for profile fetch
];

export const profileDescription: INodeProperties[] = [
	...profileOperations,
	...profileFields,
];
