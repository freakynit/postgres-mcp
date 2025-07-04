# Postgres MCP

1. A lightweight MCP (Model Context Protocol) server built to query Postgres database. 
2. It provides tools for `running raw SQL queries`, `introspecting schema`, and `querying using plain English`.
3. You can use any OpenAI compatible LLM provider for English to SQL translation. This is fully automated, and you don't need to tell it anything.

## Available Tools

| Tool                    | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `execute_raw_query`     | Run arbitrary SQL and return rows                        |
| `list_tables`           | List all non-system tables                               |
| `describe_table`        | Get column names, types, and nullability for a table     |
| `execute_english_query` | Translate natural language to SQL and optionally execute |

### Minimum needed environment variables
1. `POSTGRES_HOST`
2. `POSTGRES_USER`
3. `POSTGRES_PASSWORD`
4. `POSTGRES_DATABASE`
5. `LLM_API_KEY`: Needed only if you want English language query capability
6. `LLM_API_URL`: Needed only if you are using any other LLM provider other than OpenAI

### Other environment variables
1. `POSTGRES_PORT`
2. `LLM_MODEL`
3. `POSTGRES_SSL` (boolean)
4. `POSTGRES_VERIFY` (boolean)
5. `POSTGRES_SEND_RECEIVE_TIMEOUT` (in seconds)
6. `POSTGRES_CONNECT_TIMEOUT` (in seconds)

## Configuring using `mcpServers` json
> For Mac and Linux
```json
{
  "mcpServers": {
    "postgres-mcp": {
      "command": "npx",
      "args": ["-y", "@freakynit/postgres-mcp@latest"],
      "env": {
        "POSTGRES_HOST": "<POSTGRES HOST>",
        "POSTGRES_USER": "<POSTGRES USER>",
        "POSTGRES_PASSWORD": "<POSTGRES PASSWORD>",
        "POSTGRES_DATABASE": "<POSTGRES DATABASE>",
        "LLM_API_KEY": "<LLM API KEY if using english language queries>",
        "LLM_API_URL": "<LLM API ENDPOINT if not using OpenAI>"
      }
    }
  }
}
```
> For Windows
```json
{
  "mcpServers": {
    "postgres-mcp": {
      "command": "cmd",
      "args": ["/k", "npx", "-y", "@freakynit/postgres-mcp@latest"],
      "env": {
        "POSTGRES_HOST": "<POSTGRES HOST>",
        "POSTGRES_USER": "<POSTGRES USER>",
        "POSTGRES_PASSWORD": "<POSTGRES PASSWORD>",
        "POSTGRES_DATABASE": "<POSTGRES DATABASE>",
        "LLM_API_KEY": "<LLM API KEY if using english language queries>",
        "LLM_API_URL": "<LLM API ENDPOINT if not using OpenAI>"
      }
    }
  }
}
```

---

## Development Docs

### Prerequisites

* Node.js
* A PostgreSQL server
* An OpenAI (or any OpenAI compatible provider) API key and the endpoint (if not using OpenAI)

### Installation

```bash
git clone https://github.com/freakynit/postgres-mcp.git
cd postgres-mcp
npm install
```

## Configuration

Create a `.env` file in the project root with the following variables:

```dotenv
# PostgreSQL
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432                      # Optional, default 5432
POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=your-database

# SSL settings (optional)
POSTGRES_SSL=false                      # Or true
POSTGRES_VERIFY=false                   # Verify server cert if SSL true

# Timeouts (optional, seconds)
POSTGRES_SEND_RECEIVE_TIMEOUT=60
POSTGRES_CONNECT_TIMEOUT=60

# OpenAI
LLM_API_KEY=sk-...                      # Needed only if you want English language query capability
LLM_API_URL=https://api.openai.com/v1   # Optional, needed only if you are using any other LLM provider other than OpenAI
LLM_MODEL=gpt-4o                        # Optional, default gpt-4o
```

## Usage

Start the server (Starts in `stdio` mode):

```bash
node src/index.js
```

## Project Structure

```text
postgres-mcp/
├── src/
│   ├── config.js         # Environment parsing (Zod)
│   ├── db.js             # Postgres client factory
│   ├── openai_client.js   # OpenAI client factory
│   ├── register_tools.js  # Tool registration orchestrator
│   ├── index.js          # Entry point
│   └── tools/            # Individual tool definitions
│       ├── execute_raw_query.js
│       ├── list_tables.js
│       ├── describe_table.js
│       └── execute_english_query.js
├── .env.example          # Make sure to rename to `.env` and update it with correct values
├── package.json
└── README.md
```

## Debugging with MCP inspector
`npx @modelcontextprotocol/inspector node src/index.js`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "feat: ..."`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
