import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import {
	chatwootApiRequest,
	getAccountId,
	getContactId,
	getConversationId,
} from '../../shared/transport';
import { CustomAttributeOperation } from './types';

export async function executeCustomAttributeOperation(
	context: IExecuteFunctions,
	operation: CustomAttributeOperation,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
  switch (operation) {
    case 'createDefinition':
      return createDefinition(context, itemIndex);
    case 'getDefinitions':
      return getDefinitions(context, itemIndex);
    case 'setOnContact':
      return setOnContact(context, itemIndex);
    case 'setOnConversation':
      return setOnConversation(context, itemIndex);
    case 'deleteDefinition':
      return deleteDefinition(context, itemIndex);
  }
}

async function createDefinition(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);

	const attributeModel = context.getNodeParameter('attributeModel', itemIndex) as string;
	const attributeDisplayName = context.getNodeParameter('attributeDisplayName', itemIndex) as string;
	const attributeKey = context.getNodeParameter('attributeKey', itemIndex) as string;
	const attributeType = context.getNodeParameter('attributeType', itemIndex) as string;
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	const body: IDataObject = {
		attribute_display_name: attributeDisplayName,
		attribute_key: attributeKey,
		attribute_display_type: attributeType,
		attribute_model: attributeModel === 'contact_attribute' ? 0 : 1,
	};

	if (attributeType === 'list') {
		const attributeValuesInput = context.getNodeParameter('attributeValues', itemIndex) as
			| string
			| string[];
		const attributeValues = (
			Array.isArray(attributeValuesInput)
				? attributeValuesInput
				: [attributeValuesInput]
		).filter((value) => value !== '');

		if (attributeValues.length) {
			body.attribute_values = attributeValues;
		}
	}

	const attributeDescription = additionalFields.attributeDescription as string | undefined;
	if (attributeDescription) {
		body.attribute_description = attributeDescription;
	}

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
		body,
	)) as IDataObject;
}

async function getDefinitions(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject[]> {
	const accountId = getAccountId.call(context, itemIndex);
	const attributeModel = context.getNodeParameter('attributeModel', itemIndex) as string;

	const query: IDataObject = {
		attribute_model: attributeModel,
	};

	return (await chatwootApiRequest.call(
		context,
		'GET',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions`,
		undefined,
		query,
	)) as IDataObject[];
}

async function setOnContact(
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

async function setOnConversation(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const conversationId = getConversationId.call(context, itemIndex);
	const customAttributes = JSON.parse(
		context.getNodeParameter('customAttributes', itemIndex) as string,
	);

	return (await chatwootApiRequest.call(
		context,
		'POST',
		`/api/v1/accounts/${accountId}/conversations/${conversationId}/custom_attributes`,
		{ custom_attributes: customAttributes },
	)) as IDataObject;
}

async function deleteDefinition(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const accountId = getAccountId.call(context, itemIndex);
	const attributeKey = context.getNodeParameter('attributeKey', itemIndex) as string;

	await chatwootApiRequest.call(
		context,
		'DELETE',
		`/api/v1/accounts/${accountId}/custom_attribute_definitions/${attributeKey}`,
	);

	return { success: true };
}
