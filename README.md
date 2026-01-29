# @fazer-ai/n8n-nodes-chatwoot

This is an n8n community node that lets you use [Chatwoot](https://www.chatwoot.com/) in your n8n workflows.

Chatwoot is an open-source customer engagement platform that helps businesses manage customer conversations across multiple channels. This node provides comprehensive integration with the Chatwoot API, allowing you to automate customer support workflows, manage contacts, handle conversations, and more.

> [!TIP]
> For enhanced features and optimal performance, we recommend using [fazer.ai's Chatwoot](https://github.com/fazer-ai/chatwoot), which includes additional capabilities like Kanban boards, WhatsApp integration with Baileys/Z-API providers, and more webhook events.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Nodes](#nodes)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Development](#development)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Use this package name to install:

```
@fazer-ai/n8n-nodes-chatwoot
```

## Nodes

This package includes two nodes:

### Chatwoot fazer.ai

The main node for interacting with the Chatwoot API. Supports all CRUD operations for managing your Chatwoot instance.

### Chatwoot fazer.ai Trigger

A webhook trigger node that listens for Chatwoot events. Automatically registers and manages webhooks in your Chatwoot instance.

## Operations

### Account

| Operation | Description                                                     |
| --------- | --------------------------------------------------------------- |
| Get       | Retrieve detailed information about a specific Chatwoot account |

### Contact

| Operation                 | Description                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Create                    | Create a new contact with name, phone (E.164 format), email, and custom attributes |
| Get                       | Get contact information                                                            |
| Update                    | Update contact details                                                             |
| Delete                    | Delete a contact                                                                   |
| List                      | List contacts with pagination                                                      |
| Search                    | Search for contacts by query                                                       |
| Set Custom Attributes     | Set custom attributes on a contact                                                 |
| Destroy Custom Attributes | Remove all custom attributes from a contact                                        |

### Conversation

| Operation                  | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| Create                     | Create a new conversation for a contact              |
| Get                        | Get a specific conversation                          |
| List                       | List conversations with filters                      |
| Send Message               | Send a text message in a conversation                |
| Send File                  | Send a file/attachment in a conversation             |
| List Messages              | List messages in a conversation with pagination      |
| List Attachments           | List attachments in a conversation                   |
| Assign Agent               | Assign an agent to a conversation                    |
| Assign Team                | Assign a team to a conversation                      |
| Add Labels                 | Append labels to a conversation (keeps existing)     |
| Remove Labels              | Remove specific labels from a conversation           |
| Update Labels              | Replace all labels on a conversation                 |
| Toggle Status              | Change status (open, pending, resolved, snoozed)     |
| Set Priority               | Set conversation priority                            |
| Add Custom Attributes      | Add custom attributes (keeps existing)               |
| Remove Custom Attributes   | Remove specific custom attributes                    |
| Set Custom Attributes      | Replace all custom attributes                        |
| Update Last Seen           | Update the last seen timestamp                       |
| Update Presence            | Set presence status (off, typing, recording)         |
| Mark Unread                | Mark conversation as unread                          |
| Update Attachment Metadata | Update metadata on attachments (e.g., transcription) |

### Custom Attribute

| Operation | Description                                                                     |
| --------- | ------------------------------------------------------------------------------- |
| Create    | Create a custom attribute definition (text, number, date, list, checkbox, link) |
| List      | List all custom attribute definitions                                           |
| Delete    | Delete a custom attribute definition                                            |

### Inbox

| Operation               | Description                                       |
| ----------------------- | ------------------------------------------------- |
| Get                     | Get information about a specific inbox            |
| List                    | List all inboxes in an account                    |
| On WhatsApp ⚡          | Check if a phone number is registered on WhatsApp |
| WhatsApp Disconnect ⚡  | Disconnect a WhatsApp inbox                       |
| WhatsApp Get QR Code ⚡ | Get QR code for WhatsApp inbox connection         |

> ⚡ These operations are only available with [fazer.ai's Chatwoot](https://github.com/fazer-ai/chatwoot)

### Kanban Board ⚡

| Operation      | Description                       |
| -------------- | --------------------------------- |
| Create         | Create a new Kanban board         |
| Get            | Get a specific Kanban board       |
| List           | List Kanban boards                |
| Update         | Update a Kanban board             |
| Delete         | Delete a Kanban board             |
| Update Agents  | Update agents assigned to a board |
| Update Inboxes | Update inboxes linked to a board  |

### Kanban Step ⚡

| Operation | Description                           |
| --------- | ------------------------------------- |
| Create    | Create a new step (column) in a board |
| List      | List steps from a board               |
| Update    | Update a step                         |
| Delete    | Delete a step                         |

### Kanban Task ⚡

| Operation | Description                 |
| --------- | --------------------------- |
| Create    | Create a new task           |
| Get       | Get a specific task         |
| List      | List tasks from a board     |
| Update    | Update a task               |
| Move      | Move a task to another step |
| Delete    | Delete a task               |

### Label

| Operation | Description        |
| --------- | ------------------ |
| Create    | Create a new label |
| List      | List all labels    |
| Update    | Update a label     |
| Delete    | Delete a label     |

### Profile

| Operation | Description                              |
| --------- | ---------------------------------------- |
| Get       | Get the current user profile information |

### Team

| Operation        | Description                 |
| ---------------- | --------------------------- |
| Create           | Create a new team           |
| Delete           | Delete a team               |
| List             | List all teams              |
| Get Team Members | Get all members of a team   |
| Assign Agent     | Assign an agent to a team   |
| Unassign Agent   | Remove an agent from a team |

## Trigger Events

The **Chatwoot fazer.ai Trigger** node supports the following webhook events:

| Event                       | Description                                      |
| --------------------------- | ------------------------------------------------ |
| Contact Created             | Triggered when a new contact is created          |
| Contact Updated             | Triggered when a contact is updated              |
| Conversation Created        | Triggered when a new conversation is created     |
| Conversation Status Changed | Triggered when conversation status changes       |
| Conversation Updated        | Triggered when a conversation is updated         |
| Conversation Typing On      | Triggered when someone starts typing             |
| Conversation Typing Off     | Triggered when someone stops typing              |
| Message Created             | Triggered when a message is created              |
| Message Updated             | Triggered when a message is updated              |
| Message Incoming ⚡         | Triggered for incoming messages only             |
| Message Outgoing ⚡         | Triggered for outgoing messages only             |
| Kanban Task Created ⚡      | Triggered when a Kanban task is created          |
| Kanban Task Updated ⚡      | Triggered when a Kanban task is updated          |
| Kanban Task Deleted ⚡      | Triggered when a Kanban task is deleted          |
| Provider Event Received ⚡  | Triggered when a provider event is received      |
| Live Chat Widget Opened     | Triggered when a user opens the live chat widget |

> ⚡ These events are only available with [fazer.ai's Chatwoot](https://github.com/fazer-ai/chatwoot)

## Credentials

To authenticate with Chatwoot, you need:

### 1. Chatwoot API URL

The base URL of your Chatwoot instance (e.g., `https://app.chatwoot.com` or your self-hosted URL).

### 2. Access Token

A Personal Access Token from your Chatwoot profile:

1. Log in to your Chatwoot dashboard
2. Go to **Profile Settings** (click your avatar → Profile settings)
3. Navigate all the way down to **Access Token**
4. Copy your token

The token is sent as the `Api-Access-Token` header with each request.

## Compatibility

- **Minimum n8n version:** 1.0.0
- **Tested with:** n8n 1.x and 2.x
- **Chatwoot version:** Compatible with Chatwoot v4.x and later
- **fazer.ai Chatwoot:** Required for Kanban, WhatsApp provider operations, and additional webhook events

## Usage

### Basic Workflow: Auto-respond to New Conversations

1. Add a **Chatwoot fazer.ai Trigger** node
2. Select your account and choose "Conversation Created" event
3. Connect to a **Chatwoot fazer.ai** node
4. Set resource to "Conversation" and operation to "Send Message"
5. Use the conversation ID from the trigger output

### Working with Contacts

The Contact resource supports E.164 phone number format validation (e.g., `+5511999999999`). You can also set social profiles and custom attributes when creating or updating contacts.

### Using Resource Locators

All resources support two selection modes:

- **From List**: Browse and search available items (accounts, inboxes, conversations, etc.)
- **By ID**: Enter the ID directly for dynamic workflows

### Custom Attributes

Custom attributes can be specified in three ways:

1. **Definition mode**: Select from existing attribute definitions
2. **Key-pair mode**: Enter key-value pairs manually
3. **JSON mode**: Provide a JSON object for complex structures

### AI Tool Usage

This node is enabled as an n8n AI tool (`usableAsTool: true`), allowing it to be used with AI agents for intelligent automation workflows.

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Chatwoot API Documentation](https://developers.chatwoot.com/api-reference/introduction)
- [fazer.ai Chatwoot Repository](https://github.com/fazer-ai/chatwoot)
- [fazer.ai Website](https://fazer.ai)

## Development

### Prerequisites

- Node.js v22 or higher
- pnpm package manager

### Setup

```bash
# Clone the repository
git clone https://github.com/fazer-ai/n8n-nodes-fazer-ai-chatwoot.git
cd n8n-nodes-fazer-ai-chatwoot

# Install dependencies
pnpm install
```

### Scripts

| Command          | Description                           |
| ---------------- | ------------------------------------- |
| `pnpm build`     | Compile TypeScript sources to `dist/` |
| `pnpm lint`      | Run ESLint                            |
| `pnpm lint:fix`  | Run ESLint with auto-fix              |
| `pnpm dev`       | Start development mode                |
| `pnpm start`     | Start Docker development environment  |
| `pnpm start:log` | Start Docker development with logs    |

### Project Structure

```
├── credentials/          # Credential definitions
├── nodes/Chatwoot/       # Node implementations
│   ├── actions/          # Resource operations
│   ├── methods/          # List search & load options
│   └── shared/           # Shared utilities
├── icons/                # Node icons
└── dist/                 # Build output (published)
```

## License

[MIT](LICENSE.md)

## Authors

**Cayo Oliveira** - [fazer.ai](https://fazer.ai)
**Gabriel Jablonski** - [fazer.ai](https://fazer.ai)

---

Made with ❤️ by [fazer.ai](https://fazer.ai)
