# GraphQL Federation Microservices PoC

> **Note:** This is a simple Proof of Concept (PoC) project. It is not a fully-fledged production application, but rather an architectural showcase designed to demonstrate how to structure a modern, scalable microservices system using GraphQL Federation, asynchronous messaging, and caching.

## System Architecture

The system is built on a **Domain-Driven Design (DDD)** approach, separated into distinct subgraphs and orchestrated by an API Gateway.

- **API Gateway (Port 4000):** Acts as the single entry point. Uses Apollo Federation v2 and a statically composed supergraph (via Rover CLI) to route requests.
- **Products Subgraph (Port 4001):** Manages product inventory and catalog.
- **Orders Subgraph (Port 4002):** Manages order creation and coordinates cross-service transactions.
- **Redis:** Used for high-performance caching (Query Cache) in the Products service.
- **RabbitMQ:** Used as a message broker for asynchronous event-driven communication between services.

## Key Technical Highlights

1. **Saga Pattern (Compensating Transactions):** When an order is created, it synchronously deducts stock. If the subsequent order saving process fails, it publishes a `ROLLBACK_PRODUCT_STOCK` event to RabbitMQ to guarantee eventual data consistency.
2. **GraphQL DataLoader:** Solves the notorious GraphQL N+1 query problem by batching and caching database lookups within a single request.
3. **Cache Invalidation:** Implements exact cache eviction strategies in Redis. Deducting stock automatically flushes both the specific item cache and the paginated list cache to prevent race conditions.
4. **Static Supergraph:** Avoids runtime `IntrospectAndCompose` bottlenecks by utilizing Apollo Rover CLI to compose the schema during the CI phase, preventing cascading failures.
5. **Unit Testing:** Comprehensive Jest test suites with strict mocking (Mocking Redis, RabbitMQ channels, and Fetch API) to simulate real-world failure scenarios.

## Tech Stack

- **Backend:** Node.js, TypeScript
- **GraphQL:** Apollo Server, @apollo/subgraph, @apollo/gateway
- **Infrastructure:** Docker, Redis, RabbitMQ
- **Testing:** Jest, ts-jest
- **CI/CD:** GitHub Actions

---

## Getting Started

### 1. Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (v20+)
- [Apollo Rover CLI](https://www.apollographql.com/docs/rover/getting-started) (for schema composition)

### 2. Start Infrastructure (Redis & RabbitMQ)
We use Docker to easily spin up the required infrastructure.
```bash
docker compose up -d redis rabbitmq
```

### 3. Install Dependencies
```bash
cd products-subgraph && npm install
cd ../order-subgraph && npm install
cd ../xapi-gateway && npm install
```

### 4. Compose the Supergraph
Before starting the gateway, compose the static schema using Rover CLI (Ensure your subgraphs are running, or use the local .graphql files if configured):
```bash
export APOLLO_ELV2_LICENSE="accept"
rover supergraph compose --config ./supergraph.yaml --output supergraph.graphql
```

### 5. Start the Services
Start the Subgraphs and Gateway in separate terminal windows (or configure them in docker-compose for one-click startup):
```bash
# Terminal 1
cd products-subgraph && npm run start

# Terminal 2
cd order-subgraph && npm run start

# Terminal 3
cd xapi-gateway && npm run start
```

## Testing
Each microservice is tested. To run the tests:
```bash
cd products-subgraph  # or order-subgraph
npm run test
```