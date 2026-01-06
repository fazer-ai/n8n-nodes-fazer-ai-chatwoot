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
      email?: string;
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
  assigned_agents: ChatwootAgent[];
  assigned_inboxes: ChatwootInbox[];
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
