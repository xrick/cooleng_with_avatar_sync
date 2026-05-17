# Debugging Guide

This project uses the [debug](https://www.npmjs.com/package/debug) package for debugging and logging. Debug provides namespaced logging that can be enabled or disabled using environment variables, which is more flexible than a custom solution.

## Available Debug Namespaces

The application uses the following debug namespaces:

- `app:openai` - General OpenAI API interactions
  - `app:openai:error` - OpenAI API errors
  - `app:openai:response` - Raw API responses
  - `app:openai:parsed` - Parsed JSON from responses
- `app:image-description` - Image description feature logs
  - `app:image-description:error` - Image description errors
- `app:api:debug` - Debug API endpoint activity
  - `app:api:debug:error` - Debug API errors

## How to Enable Debug Logs

### In the Browser

To enable debug logs in the browser, open the browser console and set:

```javascript
localStorage.debug = 'app:*';
```

You can use patterns to filter logs:

- `app:*` - Enable all app logs
- `app:openai:*` - Only OpenAI logs
- `app:*:error` - Only error logs
- `app:openai,app:api:debug` - Multiple specific namespaces

To disable all debugging:

```javascript
localStorage.debug = '';
```

### In Node.js (Server-side)

Set the DEBUG environment variable before running the server:

#### Windows (PowerShell)

```powershell
$env:DEBUG='app:*'
npm run dev
```

#### Windows (CMD)

```cmd
set DEBUG=app:*
npm run dev
```

#### macOS/Linux

```bash
DEBUG=app:* npm run dev
```

## Log File Output

In addition to console logs controlled by the debug package, critical logs are also saved to the `logs` directory in JSON format for later inspection.

## Debug Formatting

The debug package provides formatted output with:

- Colorized namespace prefixes
- Timestamp information
- Supports format specifiers like `%O` for objects, `%s` for strings

## Adding New Debug Statements

To add new debug statements:

1. Import and create a debug instance:

   ```typescript
   import debug from 'debug';
   const log = debug('app:your-feature');
   ```

2. Use it in your code:
   ```typescript
   log('Processing data: %O', data);
   ```

Prefer hierarchical namespaces to organize logs (e.g., `app:feature:subfeature`).
