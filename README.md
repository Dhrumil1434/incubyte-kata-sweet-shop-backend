# Node.js TypeScript Boilerplate

A scalable, modular Node.js backend boilerplate using TypeScript, Express, Mongoose, ESLint, Prettier, and best practices for modern development.

---

## Features
- **TypeScript** for type safety and modern JS features
- **Express** with class-based app structure
- **Mongoose** for MongoDB integration
- **ESLint** and **Prettier** for code quality and formatting
- **Environment variable validation**
- **Path aliases** for clean imports
- **Barrel files** for modular utilities and middlewares
- **Production-ready error handling**
- **Rate limiting, compression, CORS, static files**

---

## Project Structure
```
ig-backend/
├── public/                  # Static files
├── src/
│   ├── app.ts               # Express App class (middlewares, routes, error handling)
│   ├── db.ts                # Database connection logic
│   ├── index.ts             # Entry point (loads env, starts server)
│   ├── utils/               # Utilities (barrel file, error, response, async handler, env validation)
│   │   ├── index.ts
│   │   ├── apiError.util.ts
│   │   ├── apiResponse.util.ts
│   │   ├── asyncHandler.util.ts
│   │   └── validateEnv.util.ts
│   └── middlewares/         # Middlewares (barrel file, error handler)
│       ├── index.ts
│       └── errorHandler.middleware.ts
├── package.json
├── tsconfig.json
├── .prettierrc
├── eslint.config.mjs
└── README.md
```

---

## Getting Started

### 1. **Install dependencies**
```bash
npm install
```

### 2. **Set up environment variables**
Create a `.env` file in the root:
```
PORT=3000
DB_URL=mongodb://localhost:27017/your-db
JWT_SECRET=your-secret
```

### 3. **Run the development server**
```bash
npm run dev
```

### 4. **Build for production**
```bash
npm run build
```

### 5. **Start in production**
```bash
npm start
```

---

## Scripts
- `npm run dev` – Start with hot-reload (ts-node-dev, supports path aliases)
- `npm run build` – Compile TypeScript to `dist/`
- `npm start` – Run compiled code or start with ts-node
- `npm run lint` – Lint code with ESLint
- `npm run format` – Format code with Prettier

---

## TypeScript Path Aliases
Defined in `tsconfig.json`:
```json
"paths": {
  "@utils-core": ["utils/index.ts"],
  "@middleware-core": ["middlewares/index.ts"]
}
```
Usage example:
```ts
import { ApiError } from '@utils-core';
import { errorHandler } from '@middleware-core';
```

---

## Code Quality
- **ESLint**: Configured for TypeScript, with recommended rules
- **Prettier**: Enforced code formatting
- **Husky + lint-staged**: Pre-commit hooks for linting/formatting

---

## Error Handling
- Centralized error handler middleware
- Custom `ApiError` class for structured errors
- Logs errors with context and stack trace (in development)

---

## Environment Variable Validation
- Utility in `src/utils/validateEnv.util.ts` ensures required env vars are set at startup

---

## License
MIT 