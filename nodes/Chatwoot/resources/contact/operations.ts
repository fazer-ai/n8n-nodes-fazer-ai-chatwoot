import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
  chatwootApiRequest,
	getAccountId,
	getContactId,
} from '../../shared/transport';
import { ContactOperation } from './types';

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
    }
}

async function createContact(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);

	const body: IDataObject = {
		name: context.getNodeParameter('name', itemIndex, '') as string,
		email: context.getNodeParameter('email', itemIndex, '') as string,
		phone_number: context.getNodeParameter('phoneNumber', itemIndex, '') as string,
	};

	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	Object.assign(body, additionalFields);

	if (typeof body.customAttributes === 'string') {
		body.custom_attributes = JSON.parse(body.customAttributes as string);
		delete body.customAttributes;
	}

	Object.keys(body).forEach((key) => {
		if (body[key] === '' || body[key] === undefined) {
			delete body[key];
		}
	});

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

