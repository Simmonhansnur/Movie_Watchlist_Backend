
## 📌 About The Project

A cloud-native backend API that allows users to securely manage their personal movie watchlists. Built with a focus on **scalability**, **performance**, **security**, and **observability** — following production-aligned engineering practices.

**Cloud Architecture:**

```
Client  →  Express API (Node.js)  →  Upstash Redis (Cache)  →  Neon PostgreSQL (DB)
```

---

### 🛠 Built With

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Winston](https://img.shields.io/badge/Winston-231F20?style=for-the-badge&logoColor=white)

---

## 📁 Project Structure

```
├── logs/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controller/
│   │   ├── authController.js
│   │   └── watchlistController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── validateRequest.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   └── watchlistRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── logger.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   ├── movieValidators.js
│   │   └── watchlistValidators.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── prisma.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL via [Neon](https://neon.tech)
- Redis via [Upstash](https://upstash.com)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Simmonhansnur/Movie_Watchlist_Backend.git
cd Movie_Watchlist_Backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Generate Prisma Client**

```bash
npx prisma generate
```

4. **Configure environment variables** — create a `.env` file:

```env
DATABASE_URL=
DIRECT_URL=
JWT_SECRET_KEY=
JWT_EXPIRES_IN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

5. **Run development server**

```bash
npm run dev
```

---

## 📡 API Reference

> Full Postman collection available [here](https://www.postman.com/YOUR_POSTMAN_LINK).

### 🔧 General

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| GET | `/` | Test request — health check | ❌ |

### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Login and receive JWT | ❌ |
| POST | `/auth/logout` | Logout current user | ✅ |

### 🎬 Movies

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| GET | `/movies` | Get all movies | ✅ |
| POST | `/movies` | Create a new movie | ✅ |
| PUT | `/movies/:id` | Update a movie | ✅ |
| DELETE | `/movies/:id` | Delete a movie | ✅ |

### 📋 Watchlist

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| GET | `/watchlist?page=1&limit=5` | Get paginated watchlist | ✅ |
| POST | `/watchlist` | Add movie to watchlist | ✅ |
| PUT | `/watchlist/:id` | Update watchlist item | ✅ |
| DELETE | `/watchlist/:id` | Remove movie from watchlist | ✅ |

**Authorization Header (all protected routes):**

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔐 Security

- **JWT-based stateless authentication** — token verified on every protected request
- **User ID extracted from token** — never accepted from URL parameters
- **Ownership validation** — update/delete operations restricted to the resource owner
- **Rate limiting** on the login endpoint via `express-rate-limit` to prevent brute-force attacks
- **Request validation** enforced through dedicated validator middleware layer

---

## 🗄 Database Design

Built on PostgreSQL (Neon Cloud) with Prisma ORM:

- One-to-many relationship between `User` and `WatchlistItem`
- Composite unique constraint on `(userId, movieId)`
- Foreign key enforcement for referential integrity
- Schema migrations managed via Prisma

---

## 📊 Pagination

Offset-based pagination via query parameters:

```
GET /watchlist?page=1&limit=5
```

Prisma implementation:

```js
skip:    (page - 1) * limit
take:    limit
orderBy: { createdAt: 'desc' }
```

Response includes total record count and page metadata — ensures scalable, predictable data retrieval.

---

## ⚡ Redis Caching

Implemented using the **Cache-Aside Pattern** via Upstash Redis.

**Cache Key Format:**

```
watchlist:{userId}:page:{page}:limit:{limit}
```

**Flow:**

```
Request → Check Redis
           ├── Cache HIT  → Return cached response ⚡
           └── Cache MISS → Query PostgreSQL → Store in Redis (TTL: 60s) → Return response
```

**Cache Invalidation** triggered automatically on:

- Add movie to watchlist → invalidate cache
- Update watchlist item → invalidate cache
- Remove movie from watchlist → invalidate cache

| | Before Redis | After Redis |
|---|---|---|
| Repeated requests | Always hit PostgreSQL | Served from cache ⚡ |
| Database load | High | Significantly reduced |
| Response time | Higher latency | Near-instant on cache hits |

---

## 📋 Logging & Observability

### Morgan — HTTP Request Logging

Captures all incoming HTTP requests with method, route, status code, and response time:

```
GET  /watchlist       200  120ms
POST /auth/login      401   35ms
GET  /movies          200   45ms
```

### Winston — Structured Application Logging

Centralized structured logging for cache operations, database queries, authentication events, and runtime errors. Logs are written to the `logs/` directory with clear separation of `info` and `error` levels — enabling debugging, error tracing, and API usage pattern monitoring without external tooling.

---

## 🗺 Roadmap

- [x] JWT Authentication & Authorization
- [x] User Logout
- [x] Movie CRUD Operations
- [x] Watchlist CRUD Operations
- [x] Relational Database Modeling (Prisma + PostgreSQL)
- [x] Offset-Based Pagination
- [x] Redis Caching (Cache-Aside + TTL)
- [x] Cache Invalidation Strategy
- [x] Rate Limiting
- [x] Structured Logging (Winston + Morgan)
- [x] API Testing (Postman)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Vishwa Hansnur** — Backend Developer focused on scalable systems and production-ready API design.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)]([https://linkedin.com/in/YOUR_LINKEDIN](https://www.linkedin.com/in/vishwa-hansnur-649a1324b/))
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Simmonhansnur)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- MARKDOWN LINKS -->
[contributors-shield]: https://img.shields.io/github/contributors/YOUR_USERNAME/YOUR_REPO.svg?style=for-the-badge
[contributors-url]: https://github.com/YOUR_USERNAME/YOUR_REPO/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/YOUR_USERNAME/YOUR_REPO.svg?style=for-the-badge
[forks-url]: https://github.com/YOUR_USERNAME/YOUR_REPO/network/members
[stars-shield]: https://img.shields.io/github/stars/YOUR_USERNAME/YOUR_REPO.svg?style=for-the-badge
[stars-url]: https://github.com/YOUR_USERNAME/YOUR_REPO/stargazers
[issues-shield]: https://img.shields.io/github/issues/YOUR_USERNAME/YOUR_REPO.svg?style=for-the-badge
[issues-url]: https://github.com/YOUR_USERNAME/YOUR_REPO/issues
[license-shield]: https://img.shields.io/github/license/YOUR_USERNAME/YOUR_REPO.svg?style=for-the-badge
[license-url]: https://github.com/YOUR_USERNAME/YOUR_REPO/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/YOUR_LINKEDIN
