import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export class TokenMarkdown implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'TokenMarkdown',
    name: 'tokenMarkdown',
    icon: 'file:tokenmarkdown.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["url"]}}',
    description: 'Strips 95% of HTML bloat and extracts clean LLM-ready Markdown to slash prompt token bills.',
    defaults: {
      name: 'TokenMarkdown',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'tokenMarkdownApi',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Extract Clean Markdown',
            value: 'extract',
            description: 'Extract clean, AST-filtered markdown from a web URL or PDF',
            action: 'Extract clean markdown from a URL',
          },
        ],
        default: 'extract',
      },
      {
        displayName: 'Target URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://docs.stripe.com/api',
        description: 'The URL of the webpage or PDF to extract and convert into clean markdown',
      },
      {
        displayName: 'Extraction Mode',
        name: 'mode',
        type: 'options',
        options: [
          {
            name: 'Article Only (Max Token Compression)',
            value: 'article',
            description: 'Filters out headers, footers, sidebars, and nav links to retain core content (~90-95% reduction)',
          },
          {
            name: 'Full Page (Preserve Navigation Chrome)',
            value: 'full',
            description: 'Retains headings and navigation hierarchy while stripping ads, scripts, and cookie banners',
          },
          {
            name: 'Raw Semantic HTML',
            value: 'raw',
            description: 'Retains sanitized semantic HTML tags without converting to markdown',
          },
        ],
        default: 'article',
        description: 'Choose the compression strategy based on your LLM context budget',
      },
      {
        displayName: 'Additional Options',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Include Images',
            name: 'include_images',
            type: 'boolean',
            default: false,
            description: 'Whether to retain markdown image embeds (![alt](url)) in the output',
          },
          {
            displayName: 'Include Links',
            name: 'include_links',
            type: 'boolean',
            default: true,
            description: 'Whether to retain hyperlink tags in the output',
          },
          {
            displayName: 'Include Table of Contents',
            name: 'include_toc',
            type: 'boolean',
            default: false,
            description: 'Whether to generate an automated table of contents at the top of the markdown',
          },
          {
            displayName: 'CSS Selector Filter',
            name: 'selector',
            type: 'string',
            default: '',
            placeholder: 'article.main-content, #documentation',
            description: 'Optional CSS selector to restrict extraction to a specific container',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Optional credentials
    let credentials: IDataObject | undefined;
    try {
      credentials = (await this.getCredentials('tokenMarkdownApi')) as IDataObject;
    } catch {
      credentials = undefined;
    }

    const apiKey = (credentials?.apiKey as string | undefined)?.trim() || '';
    const email = (credentials?.email as string | undefined)?.trim() || '';

    for (let i = 0; i < items.length; i++) {
      try {
        const url = this.getNodeParameter('url', i) as string;
        const mode = this.getNodeParameter('mode', i) as string;
        const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
          throw new NodeOperationError(this.getNode(), `Invalid URL provided at item index ${i}: "${url}". URL must begin with http:// or https://.`, { itemIndex: i });
        }

        const headers: IDataObject = {
          'Content-Type': 'application/json',
          'User-Agent': 'n8n-nodes-tokenmarkdown/0.1.0',
        };

        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }
        if (email) {
          headers['X-Developer-Email'] = email;
        }

        const requestBody: IDataObject = {
          url,
          mode,
          format: 'json',
          include_images: Boolean(additionalOptions.include_images),
          include_links: additionalOptions.include_links !== undefined ? Boolean(additionalOptions.include_links) : true,
          include_toc: Boolean(additionalOptions.include_toc),
        };

        if (additionalOptions.selector) {
          requestBody.selector = additionalOptions.selector;
        }

        const requestOptions: IHttpRequestOptions = {
          method: 'POST',
          url: 'https://tokenmarkdown.com/v1/extract',
          headers,
          body: requestBody,
          json: true,
        };

        let responseData: IDataObject;
        try {
          responseData = await this.helpers.httpRequest(requestOptions);
        } catch (error: any) {
          if (error.statusCode === 429) {
            throw new NodeApiError(this.getNode(), error, {
              message: 'TokenMarkdown sandbox quota exhausted. Claim 100 free requests at https://tokenmarkdown.com/claim or upgrade to the Builder plan ($29/mo for 10k requests) at https://tokenmarkdown.com/checkout/builder.',
              httpCode: '429',
              itemIndex: i,
            });
          }
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        }

        const data = (responseData.data as IDataObject) || {};
        const stats = (responseData.stats as IDataObject) || {};

        const executionItem: INodeExecutionData = {
          json: {
            markdown: data.markdown || '',
            title: data.title || '',
            byline: data.byline || null,
            excerpt: data.excerpt || '',
            url,
            tokens: stats.cleanTokens ?? data.tokens ?? 0,
            rawTokens: stats.rawTokens ?? data.rawTokens ?? 0,
            reductionPercentage: stats.reductionPercentage ?? data.reductionPercentage ?? 0,
            latencyMs: responseData.latencyMs ?? 0,
          },
          pairedItem: {
            item: i,
          },
        };

        returnData.push(executionItem);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: {
              item: i,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
