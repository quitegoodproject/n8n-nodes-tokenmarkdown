# n8n-nodes-tokenmarkdown

[![npm version](https://img.shields.io/npm/v/n8n-nodes-tokenmarkdown.svg)](https://www.npmjs.com/package/n8n-nodes-tokenmarkdown)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-EA4B71.svg)](https://n8n.io)

An official n8n community node for [TokenMarkdown](https://tokenmarkdown.com). Strip **90% to 95% of HTML bloat, cookie banners, tracking iframes, and scripts** from any webpage or PDF, converting raw web content into pure, LLM-ready Markdown before sending it into your AI workflows.

---

## ⚡ Why Use TokenMarkdown in n8n?

Sending raw HTML or generic scraping output directly into OpenAI, Anthropic, or Gemini burns massive token budgets and pollutes LLM context windows with junk:

* **Slash Token Bills by 85–95%**: A standard documentation or blog page is often 200KB–800KB of raw HTML (~50k–200k tokens). TokenMarkdown extracts the semantic core, delivering 2k–5k tokens.
* **Eliminate Context Pollution**: Prevents hallucinations caused by cookie consent banners, header navigation links, ads, footer disclaimers, and embedded scripts.
* **Deterministic AST Extraction**: Powered by an Abstract Syntax Tree (AST) parsing engine designed specifically for RAG embeddings and LLM ingestion.
* **Zero Runtime Dependencies**: The node has zero external runtime dependencies (`dependencies: {}`), ensuring rapid execution and rock-solid stability in both cloud and self-hosted n8n environments.

---

## 📦 Installation

### Via n8n Community Nodes (Recommended)
1. In your n8n workspace, navigate to **Settings** > **Community Nodes**.
2. Click **Install**.
3. Enter `n8n-nodes-tokenmarkdown` in the **npm package name** field.
4. Agree to the risks of installing community packages and click **Install**.

### Via Docker / Self-Hosted CLI
In your n8n root directory (or container custom directory):
```bash
npm install n8n-nodes-tokenmarkdown
```

---

## 🔑 Authentication & Pricing

TokenMarkdown works immediately with **zero configuration**:

* **Anonymous Free Tier**: 50 free extractions out of the box (leave credentials empty).
* **Developer Starter Tier**: Enter your developer work email in credentials to unlock 100 free requests (no credit card required).
* **Production API Key**: For production pipelines and high-volume workloads:
  * **Builder ($29/mo)**: 2,500 extractions / month. [Subscribe here](https://tokenmarkdown.com/checkout/builder)
  * **Pro ($79/mo)**: 10,000 extractions / month. [Subscribe here](https://tokenmarkdown.com/checkout/pro)
  * **Agency ($149/mo)**: 40,000 extractions / month.

To configure credentials in n8n:
1. Go to **Credentials** > **New Credential**.
2. Search for **TokenMarkdown API**.
3. Enter your **API Key** (or enter your **Developer Email** for free tier scaling).

---

## 🚀 Node Operations & Parameters

### Operation: `Extract Clean Markdown`

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **Target URL** | String | Yes | The URL of the webpage or PDF to extract and convert. |
| **Extraction Mode** | Options | No | Compression strategy: <br>• **Article Only** (Default): Aggressively strips nav/footer chrome for maximum token savings (~90-95%). <br>• **Full Page**: Preserves page layout hierarchy while stripping ads/scripts. <br>• **Raw Semantic HTML**: Sanitized semantic HTML tags without converting to Markdown. |
| **Include Images** | Boolean | No | Retain markdown image embeds (`![alt](url)`). Default: `false`. |
| **Include Links** | Boolean | No | Retain markdown hyperlinks (`[text](url)`). Default: `true`. |
| **Include Table of Contents** | Boolean | No | Auto-generate a markdown TOC at the top. Default: `false`. |
| **CSS Selector Filter** | String | No | Target a specific container (e.g. `article.docs-body`, `#main-content`). |

---

## 📊 Output Data Structure

The node outputs a structured JSON object ready for immediate chaining with AI Agent, Vector Store, or HTTP nodes:

```json
{
  "markdown": "# Stripe API Reference\n\nThe Stripe API is organized around REST...",
  "title": "Stripe API Reference",
  "excerpt": "Complete reference documentation for the Stripe REST API.",
  "byline": "Stripe Engineering",
  "url": "https://docs.stripe.com/api",
  "tokens": 3420,
  "rawTokens": 78900,
  "reductionPercentage": 95.66,
  "latencyMs": 342
}
```

---

## 🛠️ Example Workflows

1. **RAG Pipeline**: `Webhook` ➔ `TokenMarkdown` ➔ `Text Splitter` ➔ `Qdrant / Pinecone Vector Store`
2. **Autonomous Research Agent**: `Google Search` ➔ `TokenMarkdown` ➔ `AI Agent (GPT-4o / Claude 3.5 Sonnet)`
3. **Competitor Changelog Tracker**: `Schedule Trigger` ➔ `TokenMarkdown` ➔ `Slack / Discord Notification`

---

## 📄 License & Attribution

* **License**: MIT
* **Author**: [The Quite Good Project](https://quitegoodproject.com)
* **Support & Security**: `engineering@quitegoodproject.com`
