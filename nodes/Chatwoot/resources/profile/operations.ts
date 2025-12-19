import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { chatwootApiRequest } from '../../shared/transport';
import { ProfileOperation } from './types';

export async function executeProfileOperation(
  context: IExecuteFunctions,
  operation: ProfileOperation,
): Promise<IDataObject | IDataObject[]> {
  switch (operation) {
    case 'get':
      return getProfile(context);
  }
}

async function getProfile(
	context: IExecuteFunctions,
): Promise<IDataObject> {
	return (await chatwootApiRequest.call(
		context,
		'GET',
		'/api/v1/profile',
	)) as IDataObject;
}
