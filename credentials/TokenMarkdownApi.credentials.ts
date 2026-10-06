import type {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class TokenMarkdownApi implements ICredentialType {
  name = 'tokenMarkdownApi';
  displayName = 'TokenMarkdown API';
  documentationUrl = 'https://tokenmarkdown.com/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Your TokenMarkdown API Key. Leave empty for the free sandbox tier (50 requests). Upgrade at https://tokenmarkdown.com/checkout/builder for production quotas (10k+ extractions).',
    },
    {
      displayName: 'Developer Email',
      name: 'email',
      type: 'string',
      default: '',
      placeholder: 'you@company.com',
      description: 'Optional work email. Automatically unlocks 100 free requests without a credit card.',
    },
  ];
}
