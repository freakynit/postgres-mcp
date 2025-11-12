# Postgres MCP

A lightweight MCP (Model Context Protocol) server built to query Postgres database using SQL or plain English commands. It provides comprehensive tools for database operations, table introspection, and query execution with smart permission handling.

## Features

### Smart Query Permission Handling
- **Read-only queries**: Automatically approved (SELECT, EXPLAIN, SHOW, VALUES)
- **Read-write queries**: User confirmation required (INSERT, UPDATE, DELETE, MERGE)
- **Admin/DDL queries**: Elevated permission required (CREATE, ALTER, DROP, etc.)
- **Dry-run mode**: Validate queries without execution

### Comprehensive Table Introspection
- Column definitions with types and constraints
- Primary and foreign key relationships
- Index definitions
- Triggers and check constraints

### Database Management
- Multiple database switching capability
- Robust error handling and rollback

## Available Tools

| Tool                    | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `execute_raw_query`     | Execute SQL queries with permission validation and dry-run support |
| `list_tables`           | List all non-system tables                               |
| `describe_tables`       | Get comprehensive table information including columns, indexes, triggers, and constraints |
| `switch_database`       | Switch the active database connection                    |

### Minimum needed environment variables
1. `POSTGRES_HOST`
2. `POSTGRES_USER`
3. `POSTGRES_PASSWORD`
4. `POSTGRES_DATABASE`

### Other environment variables
1. `POSTGRES_PORT`
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
        "POSTGRES_DATABASE": "<POSTGRES DATABASE>"
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
        "POSTGRES_DATABASE": "<POSTGRES DATABASE>"
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

### Installation
```bash
npm i -g @freakynit/postgres-mcp
```

OR

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
POSTGRES_SEND_RECEIVE_TIMEOUT=60        # Query timeout
POSTGRES_CONNECT_TIMEOUT=60             # Connection timeout
```

## Usage

### Local Development

Start the server (Starts in `stdio` mode):

```bash
node src/index.js
```

### With MCP Inspector

For debugging and development:

```bash
npx @modelcontextprotocol/inspector node src/index.js
```

## Debugging with MCP inspector
`npx @modelcontextprotocol/inspector node src/index.js`

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
