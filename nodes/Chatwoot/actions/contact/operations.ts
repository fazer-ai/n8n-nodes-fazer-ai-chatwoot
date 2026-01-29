import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
  chatwootApiRequest,
	getAccountId,
	getContactId,
} from '../../shared/transport';
import { ContactOperation } from './types';

const E164_REGEX = /^\+[1-9]\d{1,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function executeContactOperation(
  context: IExecuteFunctions,
  operation: ContactOperation,
  itemIndex: number,
): Promise<INodeExecutionData> {
  switch (operation) {
    case 'create':
      return createContact(context, itemIndex);
    case 'get':
      return getContact(context, itemIndex);
		case 'update':
			return updateContact(context, itemIndex);
    case 'delete':
      return deleteContact(context, itemIndex);
    case 'list':
      return listContacts(context, itemIndex);
    case 'search':
      return searchContacts(context, itemIndex);
    case 'listConversations':
      return listContactConversations(context, itemIndex);
    case 'merge':
      return mergeContacts(context, itemIndex);
    case 'listLabels':
      return listContactLabels(context, itemIndex);
    case 'addLabels':
      return addLabelsToContact(context, itemIndex);
    case 'updateLabels':
      return updateContactLabels(context, itemIndex);
    case 'removeLabels':
      return removeLabelsFromContact(context, itemIndex);
    case 'setCustomAttributes':
      return setCustomAttributes(context, itemIndex);
    case 'destroyCustomAttributes':
			return destroyCustomAttributes(context, itemIndex);
	}
}

async function createContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);

	const name = context.getNodeParameter('name', itemIndex, '');
	const phoneNumber = context.getNodeParameter('phoneNumber', itemIndex, '');
	const email = context.getNodeParameter('email', itemIndex, '');
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	if (!name) {
		throw new NodeOperationError(
			context.getNode(),
			'Contact name is required',
			{ itemIndex },
		);
	}

	if (phoneNumber && !E164_REGEX.test(String(phoneNumber))) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid phone number format. Expected E.164 format (e.g., +5511999999999), got: ${phoneNumber}`,
			{ itemIndex },
		);
	}

	if (email && !EMAIL_REGEX.test(String(email))) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid email address format: ${email}`,
			{ itemIndex },
		);
	}

	const { identifier, avatarUrl, blocked, socialProfiles, extraAdditionalAttributes, ...restAdditionalFields } = additionalFields as IDataObject & { socialProfiles?: IDataObject; extraAdditionalAttributes?: { attributes?: Array<{ key: string; value: string }> } };

	let additionalAttributes: IDataObject | undefined = undefined;
	if (Object.keys(restAdditionalFields).length > 0 || socialProfiles || extraAdditionalAttributes?.attributes?.length) {
		additionalAttributes = { ...restAdditionalFields };
		if (socialProfiles?.profiles) {
			additionalAttributes.social_profiles = socialProfiles.profiles;
		}
		if (extraAdditionalAttributes?.attributes) {
			for (const attr of extraAdditionalAttributes.attributes) {
				if (attr.key) {
					additionalAttributes[attr.key] = attr.value;
				}
			}
		}
	}

	let customAttributes: IDataObject | undefined = undefined;
	const specifyMode = context.getNodeParameter('specifyCustomAttributesCreate', itemIndex, 'none') as string;

	if (specifyMode === 'definition') {
		const attributes = context.getNodeParameter(
			'customAttributesDefinitionCreate.attributes',
			itemIndex,
			[],
		) as Array<{ key: string; value: string }>;

		customAttributes = {};
		for (const attr of attributes) {
			if (attr.key) {
				customAttributes[attr.key] = attr.value;
			}
		}
	} else if (specifyMode === 'keypair') {
		const attributeParameters = context.getNodeParameter(
			'customAttributesParametersCreate.attributes',
			itemIndex,
			[],
		) as Array<{ name: string; value: string }>;

		customAttributes = {};
		for (const attr of attributeParameters) {
			if (attr.name) {
				customAttributes[attr.name] = attr.value;
			}
		}
	} else if (specifyMode === 'json') {
		const jsonValue = context.getNodeParameter('customAttributesJsonCreate', itemIndex, '{}') as string;
		customAttributes = JSON.parse(jsonValue);
	}

	const body: IDataObject = {
		name,
		phone_number: phoneNumber || undefined,
		email: email || undefined,
		additional_attributes: additionalAttributes,
		identifier: identifier || undefined,
		avatar_url: avatarUrl || undefined,
		blocked: blocked !== undefined ? blocked : undefined,
		custom_attributes: customAttributes && Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
	};

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/contacts`,
		body,
	) as IDataObject;

	if (!phoneNumber && !email && !identifier) {
		context.addExecutionHints({
			message: 'Contact created without phone number, email, or identifier. The contact will not appear in search results until at least one of these fields is set.',
			type: 'warning',
			location: 'outputPane',
		});
	}

	return { json: result };
}

// TODO: Figure out a way to clear phone number and email
async function updateContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const name = context.getNodeParameter('name', itemIndex, '');
	const phoneNumber = context.getNodeParameter('phoneNumber', itemIndex, '');
	const email = context.getNodeParameter('email', itemIndex, '');
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	if (phoneNumber && !E164_REGEX.test(String(phoneNumber))) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid phone number format. Expected E.164 format (e.g., +5511999999999), got: ${phoneNumber}`,
			{ itemIndex },
		);
	}

	if (email && !EMAIL_REGEX.test(String(email))) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid email address format: ${email}`,
			{ itemIndex },
		);
	}

	const { identifier, avatarUrl, blocked, socialProfiles, extraAdditionalAttributes, ...restAdditionalFields } = additionalFields as IDataObject & { socialProfiles?: IDataObject; extraAdditionalAttributes?: { attributes?: Array<{ key: string; value: string }> } };

	let additionalAttributes: IDataObject | undefined = undefined;
	if (Object.keys(restAdditionalFields).length > 0 || socialProfiles || extraAdditionalAttributes?.attributes?.length) {
		additionalAttributes = { ...restAdditionalFields };
		if (socialProfiles?.profiles) {
			additionalAttributes.social_profiles = socialProfiles.profiles;
		}
		if (extraAdditionalAttributes?.attributes) {
			for (const attr of extraAdditionalAttributes.attributes) {
				if (attr.key) {
					additionalAttributes[attr.key] = attr.value;
				}
			}
		}
	}

	// Handle custom_attributes
	let customAttributes: IDataObject | undefined = undefined;
	const specifyMode = context.getNodeParameter('specifyCustomAttributesUpdate', itemIndex, 'none') as string;

	if (specifyMode === 'definition') {
		const attributes = context.getNodeParameter(
			'customAttributesDefinitionUpdate.attributes',
			itemIndex,
			[],
		) as Array<{ key: string; value: string }>;

		customAttributes = {};
		for (const attr of attributes) {
			if (attr.key) {
				customAttributes[attr.key] = attr.value;
			}
		}
	} else if (specifyMode === 'keypair') {
		const attributeParameters = context.getNodeParameter(
			'customAttributesParametersUpdate.attributes',
			itemIndex,
			[],
		) as Array<{ name: string; value: string }>;

		customAttributes = {};
		for (const attr of attributeParameters) {
			if (attr.name) {
				customAttributes[attr.name] = attr.value;
			}
		}
	} else if (specifyMode === 'json') {
		const jsonValue = context.getNodeParameter('customAttributesJsonUpdate', itemIndex, '{}') as string;
		customAttributes = JSON.parse(jsonValue);
	}

	const body: IDataObject = {
		name: name || undefined,
		phone_number: phoneNumber || undefined,
		email: email || undefined,
		additional_attributes: additionalAttributes,
		identifier: identifier || undefined,
		avatar_url: avatarUrl || undefined,
		blocked: blocked !== undefined ? blocked : undefined,
		custom_attributes: customAttributes && Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
	};

	const result = await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/contacts/${contactId}`,
		body,
	) as IDataObject;

	return { json: result };
}

async function getContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts/${contactId}`,
	) as IDataObject;

	return { json: result };
}

async function deleteContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/contacts/${contactId}`,
	) as IDataObject;

	return { json: result };
}

async function listContacts(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const page = context.getNodeParameter('page', itemIndex, 1);
	const sort = context.getNodeParameter('sort', itemIndex, 'last_activity_at') as string;
	const sortOrder = context.getNodeParameter('sortOrder', itemIndex, 'asc') as string;
	const includeContactInboxes = context.getNodeParameter('includeContactInboxes', itemIndex, false) as boolean;

	const sortValue = sortOrder === 'desc' ? `-${sort}` : sort;

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts`,
		undefined,
		{
			page,
			sort: sortValue,
			include_contact_inboxes: includeContactInboxes,
		},
	) as IDataObject;

	return { json: result };
}

async function searchContacts(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const searchQuery = context.getNodeParameter('searchQuery', itemIndex);
	const page = context.getNodeParameter('page', itemIndex, 1);

	const query: IDataObject = { q: searchQuery, page };

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts/search`,
		undefined,
		query,
	) as IDataObject;

	return { json: result };
}

async function setCustomAttributes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const specifyMode = context.getNodeParameter('specifyCustomAttributes', itemIndex) as string;

	let customAttributes: IDataObject;

	if (specifyMode === 'definition') {
		const attributes = context.getNodeParameter(
			'customAttributesDefinition.attributes',
			itemIndex,
			[],
		) as Array<{ key: string; value: string }>;

		customAttributes = {};
		for (const attr of attributes) {
			if (attr.key) {
				customAttributes[attr.key] = attr.value;
			}
		}
	} else if (specifyMode === 'keypair') {
		const attributeParameters = context.getNodeParameter(
			'customAttributesParameters.attributes',
			itemIndex,
			[],
		) as Array<{ name: string; value: string }>;

		customAttributes = {};
		for (const attr of attributeParameters) {
			if (attr.name) {
				customAttributes[attr.name] = attr.value;
			}
		}
	} else {
		const jsonValue = context.getNodeParameter('customAttributesJson', itemIndex) as string;
		customAttributes = JSON.parse(jsonValue);
	}

	const result = await chatwootApiRequest.call(
		context,
		'PATCH',
		`/api/v1/accounts/${accountId}/contacts/${contactId}`,
		{ custom_attributes: { ...customAttributes } }
	) as IDataObject;

	return { json: result };
}

async function destroyCustomAttributes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const customAttributesToDestroy = context.getNodeParameter(
		'customAttributesToDestroy',
		itemIndex,
	) as string[];

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/contacts/${contactId}/destroy_custom_attributes`,
		{ custom_attributes: customAttributesToDestroy },
	) as IDataObject;

	return { json: result };
}

async function listContactConversations(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts/${contactId}/conversations`,
	) as IDataObject;

	return { json: result };
}

async function mergeContacts(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);

	const baseContactIdParam = context.getNodeParameter('baseContactId', itemIndex) as { value: string } | string;
	const baseContactId = typeof baseContactIdParam === 'object' ? baseContactIdParam.value : baseContactIdParam;

	const mergeeContactIdParam = context.getNodeParameter('mergeeContactId', itemIndex) as { value: string } | string;
	const mergeeContactId = typeof mergeeContactIdParam === 'object' ? mergeeContactIdParam.value : mergeeContactIdParam;

	if (baseContactId === mergeeContactId) {
		throw new NodeOperationError(
			context.getNode(),
			'Base contact and mergee contact cannot be the same',
			{ itemIndex },
		);
	}

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/actions/contact_merge`,
		{
			base_contact_id: Number(baseContactId),
			mergee_contact_id: Number(mergeeContactId),
		},
	) as IDataObject;

	return { json: result };
}

async function listContactLabels(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	const result = await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts/${contactId}/labels`,
	) as IDataObject;

	return { json: result };
}

async function updateContactLabels(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const labels = context.getNodeParameter('labels', itemIndex) as string[];

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/contacts/${contactId}/labels`,
		{ labels },
	) as IDataObject;

	return { json: result };
}

async function addLabelsToContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const labelsToAdd = context.getNodeParameter('labels', itemIndex) as string[];

	const existingLabels = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts/${contactId}/labels`,
	)) as { payload: string[] };

	const currentLabels = existingLabels.payload || [];
	const newLabels = [...new Set([...currentLabels, ...labelsToAdd])];

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/contacts/${contactId}/labels`,
		{ labels: newLabels },
	) as IDataObject;

	return { json: result };
}

async function removeLabelsFromContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const labelsToRemove = context.getNodeParameter('labels', itemIndex) as string[];

	const existingLabels = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts/${contactId}/labels`,
	)) as { payload: string[] };

	const currentLabels = existingLabels.payload || [];
	const labelsToRemoveSet = new Set(labelsToRemove);
	const newLabels = currentLabels.filter((label) => !labelsToRemoveSet.has(label));

	const result = await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/contacts/${contactId}/labels`,
		{ labels: newLabels },
	) as IDataObject;

	return { json: result };
}
