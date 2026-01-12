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
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {});

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

	let additionalAttributes: IDataObject | undefined = undefined;
	if (additionalFields && Object.keys(additionalFields).length > 0) {
		const { socialProfiles, ...rest } = additionalFields as IDataObject & { socialProfiles?: IDataObject };
		additionalAttributes = { ...rest };
		if (socialProfiles?.profiles) {
			additionalAttributes.social_profiles = socialProfiles.profiles;
		}
	}

	const body: IDataObject = {
		name,
		phone_number: phoneNumber,
		email,
		additional_attributes: additionalAttributes,
	};

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/contacts`,
			body,
		)) as IDataObject
	};
}

// TODO: Figure out a way to clear phone number and email
async function updateContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const name = context.getNodeParameter('nameOptional', itemIndex, '');
	const phoneNumber = context.getNodeParameter('phoneNumber', itemIndex, '');
	const email = context.getNodeParameter('email', itemIndex, '');
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {});

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

	let additionalAttributes: IDataObject | undefined = undefined;
	if (additionalFields && Object.keys(additionalFields).length > 0) {
		const { socialProfiles, ...rest } = additionalFields as IDataObject & { socialProfiles?: IDataObject };
		additionalAttributes = { ...rest };
		if (socialProfiles?.profiles) {
			additionalAttributes.social_profiles = socialProfiles.profiles;
		}
	}

	const body: IDataObject = {
		name: name || undefined,
		phone_number: phoneNumber || undefined,
		email: email || undefined,
		additional_attributes: additionalAttributes,
	};

	return {
		json: (await chatwootApiRequest.call(
			context,
			'PUT',
			`/api/v1/accounts/${accountId}/contacts/${contactId}`,
			body,
		)) as IDataObject
	};
}

async function getContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/contacts/${contactId}`,
		)) as IDataObject
	};
}

async function deleteContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'DELETE',
			`/api/v1/accounts/${accountId}/contacts/${contactId}`,
		)) as IDataObject
	};
}

async function listContacts(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const page = context.getNodeParameter('page', itemIndex, 1);

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/contacts`,
			undefined,
			{ page },
		)) as IDataObject
	};
}

async function searchContacts(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const searchQuery = context.getNodeParameter('searchQuery', itemIndex);
	const page = context.getNodeParameter('page', itemIndex, 1);

	const query: IDataObject = { q: searchQuery, page };

	return {
		json: (await chatwootApiRequest.call(
			context,
			'GET',
			`/api/v1/accounts/${accountId}/contacts/search`,
			undefined,
			query,
		)) as IDataObject
	};
}

async function setCustomAttributes(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const specifyMode = context.getNodeParameter('specifyCustomAttributes', itemIndex) as string;

	let customAttributes: IDataObject;

	if (specifyMode === 'keypair') {
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

	return {
		json: (await chatwootApiRequest.call(
			context,
			'PATCH',
			`/api/v1/accounts/${accountId}/contacts/${contactId}`,
			{ custom_attributes: { ...customAttributes } }
		)) as IDataObject
	};
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

	return {
		json: (await chatwootApiRequest.call(
			context,
			'POST',
			`/api/v1/accounts/${accountId}/contacts/${contactId}/destroy_custom_attributes`,
			{ custom_attributes: customAttributesToDestroy },
		)) as IDataObject
	};
}
