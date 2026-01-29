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

const getProfileFields: INodeProperties[] = [
	{
		displayName: 'Show Access Token',
		name: 'showAccessToken',
		type: 'boolean',
		default: false,
		description: 'Whether to show the access token in the response. When disabled, the token is masked.',
		displayOptions: {
			show: {
				...showOnlyForProfile,
				operation: ['get'],
			},
		},
	},
];

export const profileDescription: INodeProperties[] = [
	...profileOperations,
	...getProfileFields,
];

export { executeProfileOperation } from './operations';
