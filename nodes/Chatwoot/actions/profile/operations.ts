import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { chatwootApiRequest } from '../../shared/transport';
import { ProfileOperation } from './types';

export async function executeProfileOperation(
  context: IExecuteFunctions,
  operation: ProfileOperation,
): Promise<INodeExecutionData> {
  switch (operation) {
    case 'get':
      return getProfile(context);
  }
}

async function getProfile(
	context: IExecuteFunctions,
): Promise<INodeExecutionData> {
	return {
    json: (await chatwootApiRequest.call(
	  	context,
	  	'GET',
	  	'/api/v1/profile',
	  )) as IDataObject
  };
}
