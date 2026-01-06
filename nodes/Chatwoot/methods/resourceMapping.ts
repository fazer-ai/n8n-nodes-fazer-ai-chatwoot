import { ILoadOptionsFunctions } from "n8n-workflow";

export interface ChatwootAccount {
  id: number;
  name: string;
}

export interface ChatwootInbox {
  id: number;
  name: string;
  channel_type?: string;
  provider?: string;
}

export interface ChatwootConversation {
  id: number;
  meta?: {
    sender?: {
      name?: string;
    };
  };
}

export interface ChatwootContact {
  id: number;
  name?: string;
  email?: string;
}

export interface ChatwootAgent {
  id: number;
  name?: string;
  email?: string;
}

export interface ChatwootTeam {
  id: number;
  name: string;
}

export interface ChatwootLabel {
  id:	number;
  title: string;
}

export interface ChatwootWebhook {
  id: number;
  url: string;
}

export interface ChatwootProfileResponse {
  accounts?: ChatwootAccount[];
}

export interface ChatwootPayloadResponse<T> {
  payload?: T[];
  data?: {
    payload?: T[];
  };
}

export interface ChatwootKanbanBoard {
  id: number;
  name: string;
}

export interface ChatwootKanbanStep {
  id: number;
  name: string;
  description: string,
  cancelled: boolean;
}

export interface ChatwootKanbanTask {
  id: number;
  title: string;
}

export interface ChatwootTeamMember {
	id: number;
	name?: string;
	email?: string;
}

export interface ChatwootCustomAttributeDefinition {
	id: number;
	attribute_key: string;
	attribute_display_name: string;
	attribute_model: number;
}

export function extractResourceLocatorValue(
	context: ILoadOptionsFunctions,
	paramName: string,
): string | null {
	try {
		const param = context.getNodeParameter(paramName, 0) as
			| string
			| { mode: string; value: string };

		if (!param) return null;
		if (typeof param === 'string') return param;
		if (typeof param === 'object' && param.value) return String(param.value);
		return null;
	} catch {
		return null;
	}
}
