
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose MCP port if needed (for SSE)
# but FastMCP usually runs stdio by default. 
# To run SSE, use: fastmcp run server.py --transport sse --host 0.0.0.0 --port 8000
EXPOSE 8000

CMD ["fastmcp", "run", "server.py", "--transport", "sse", "--host", "0.0.0.0", "--port", "8000"]
