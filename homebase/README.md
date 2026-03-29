# HomeBase

A personal life intelligence assistant that turns receipt photos into actionable insights about your spending, food inventory, and health.

## What It Does (v1)
- Ingests receipt photos via Telegram
- Tracks monthly spending vs budget per category
- Maintains a running food inventory
- Returns one health insight and swap suggestion per receipt

## Status
🚧 v1 in progress

## Stack
- Node.js
- Claude API (Sonnet for vision, Haiku for insights)
- Telegram Bot API
- AWS EC2
- JSON flat file storage (SQLite in v1.1)

## Architecture
Three sequential agents:
1. Ingestion Agent — OCR + structured extraction from receipt image
2. State Agent — updates spending totals and food inventory
3. Insight Agent — identifies least healthy item and suggests one swap
