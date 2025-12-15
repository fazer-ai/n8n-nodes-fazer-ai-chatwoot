import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
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
): Promise<IDataObject | IDataObject[]> {
  switch (operation) {
    case 'create':
      return createContact(context, itemIndex);
    case 'get':
      return getContact(context, itemIndex);
    case 'getAll':
      return getAllContacts(context, itemIndex);
    case 'update':
      return updateContact(context, itemIndex);
    case 'delete':
      return deleteContact(context, itemIndex);
    case 'search':
      return searchContacts(context, itemIndex);
    case 'setCustomAttribute':
      return setCustomAttribute(context, itemIndex);
    }
}

async function createContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
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

	const body: IDataObject = {
		name,
		phone_number: phoneNumber,
		email,
		additional_attributes: {
			...additionalFields,
			social_profiles: (additionalFields.socialProfiles as IDataObject)?.profiles ?? {},
		},
	};
	delete (body.additional_attributes as IDataObject).socialProfiles;

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/contacts`,
		body,
	)) as IDataObject;
}

async function getContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	return (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts/${contactId}`,
	)) as IDataObject;
}

async function getAllContacts(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);
	const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const limit = context.getNodeParameter('limit', itemIndex, 50) as number;

	const query: IDataObject = {};
	if (!returnAll) {
		query.per_page = limit;
	}

	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts`,
		undefined,
		query,
	)) as IDataObject;

	return (response.payload as IDataObject[]) || response;
}

async function updateContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	const body: IDataObject = {};
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	Object.assign(body, additionalFields);

	if (typeof body.customAttributes === 'string') {
		body.custom_attributes = JSON.parse(body.customAttributes as string);
		delete body.customAttributes;
	}

	return (await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/contacts/${contactId}`,
		body,
	)) as IDataObject;
}

async function deleteContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/contacts/${contactId}`,
	);

	return { success: true };
}

async function searchContacts(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);
	const searchQuery = context.getNodeParameter('searchQuery', itemIndex) as string;
	const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const limit = context.getNodeParameter('limit', itemIndex, 50) as number;

	const query: IDataObject = { q: searchQuery };
	if (!returnAll) {
		query.per_page = limit;
	}

	const response = (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/contacts/search`,
		undefined,
		query,
	)) as IDataObject;

	return (response.payload as IDataObject[]) || response;
}

async function setCustomAttribute(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const contactId = getContactId.call(context, itemIndex);
	const customAttributes = JSON.parse(
		context.getNodeParameter('customAttributes', itemIndex) as string,
	);

	return (await chatwootApiRequest.call(
		context,
		'PUT',
		`/api/v1/accounts/${accountId}/contacts/${contactId}`,
		{ custom_attributes: customAttributes },
	)) as IDataObject;
}

