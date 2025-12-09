import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Credential definition for Chatwoot personal access tokens.
 */
export class ChatWootApi implements ICredentialType {
	name = 'chatwootApi';
	displayName = 'Chatwoot API';
	documentationUrl = 'https://developers.chatwoot.com/api-reference/introduction#application-apis';

	properties: INodeProperties[] = [
		{
			displayName: 'Chatwoot API URL',
			name: 'url',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://app.chatwoot.com',
			description:
				'Base URL of your Chatwoot instance. E.g.: https://chatwoot.fazerai.com',
		},
		{
			displayName: 'For enhanced features and optimal performance, we recommend using <a href="https://github.com/fazer-ai/chatwoot" target="_blank">fazer.ai\'s Chatwoot</a>.',
			name: 'apiNotice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
			required: true,
			placeholder: '00000000-0000-0000-0000-000000000000',
			typeOptions: {
				password: true,
			},
			description: 'Personal Access Token from your Chatwoot account. Generate it in Profile settings > Access Token.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Api-Access-Token': '={{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: 'api/v1/profile',
		},
	};

	icon: Icon = 'file:../icons/chatwoot.svg';
}
