# Optivise — AI-Powered Growth Optimization Platform

A full-stack SaaS dashboard built with **Spring Boot** (backend) + **React + Vite** (frontend), styled to match the Optivise dark-theme design.

---

## Project Structure

```
optivise/
├── backend/          ← Spring Boot (Java 21) — open in IntelliJ
│   ├── pom.xml
│   └── src/main/java/com/optivise/
│       ├── OptiviseApplication.java
│       ├── config/SecurityConfig.java
│       ├── controller/Controllers.java
│       ├── service/
│       │   ├── JwtService.java
│       │   ├── ClaudeService.java
│       │   ├── DashboardService.java
│       │   └── DataSeeder.java
│       ├── model/Models.java
│       ├── repository/Repositories.java
│       └── dto/DTOs.java
│
└── frontend/         ← React + Vite — open in VS Code
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── styles/global.css
        ├── utils/api.js
        ├── hooks/useAuth.jsx
        ├── components/layout/
        └── pages/
```

---

## Backend Setup (IntelliJ IDEA)

### Prerequisites
- Java 21 JDK — download from https://adoptium.net
- IntelliJ IDEA (Community or Ultimate)
- Maven (bundled with IntelliJ)

### Steps

1. **Open the project**
   - Open IntelliJ → `File` → `Open` → select the `backend/` folder
   - IntelliJ will detect `pom.xml` and auto-import Maven dependencies (takes ~2 min)

2. **Set your API key**
   - In IntelliJ, go to `Run` → `Edit Configurations`
   - Select `OptiviseApplication`
   - Under `Environment variables`, add:
     ```
     ANTHROPIC_API_KEY=your-claude-api-key-here
     ```
   - Get your key at: https://console.anthropic.com

3. **Run the app**
   - Click the green ▶️ button next to `OptiviseApplication.java`
   - Backend starts at: http://localhost:8080
   - H2 database console: http://localhost:8080/h2-console
   - Demo data is seeded automatically on first run

4. **Demo login (auto-seeded)**
   ```
   Email:    sarah@optivise.io
   Password: demo1234
   ```

---

## Frontend Setup (VS Code)

### Prerequisites
- Node.js 18+ — download from https://nodejs.org (LTS version)
- VS Code with extensions: ESLint, Prettier, ES7 React Snippets

### Steps

1. **Open the folder**
   - Open VS Code → `File` → `Open Folder` → select `frontend/`

2. **Install dependencies**
   - Open VS Code terminal (`Ctrl+`` ` ``)
   ```bash
   npm install
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```
   - Frontend runs at: http://localhost:5173
   - API calls proxy to `http://localhost:8080` automatically

4. **Open in browser**
   - Navigate to http://localhost:5173
   - Log in with: `sarah@optivise.io` / `demo1234`

---

## Features

| Page | Description |
|---|---|
| **Dashboard** | Revenue, conversion, A/B tests, AI score, top products, charts |
| **AI Insights** | Coming soon — plug in Claude for deep analysis |
| **Product Optimizer** | Conversion rates, status tracking (optimized / needs attention / critical) |
| **A/B Testing** | Create, run, pause, complete experiments with real results |
| **Recommendations** | AI-generated suggestions with impact levels, apply with one click |
| **Analytics** | Revenue, conversion, and sessions charts over time |
| **AI Assistant** | Live chat powered by Claude API with store context |
| **Automations** | Coming soon |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/dashboard | Dashboard summary |
| GET | /api/abtests | List A/B tests |
| POST | /api/abtests | Create test |
| PUT | /api/abtests/{id}/pause | Pause test |
| PUT | /api/abtests/{id}/resume | Resume test |
| GET | /api/suggestions | List AI suggestions |
| PUT | /api/suggestions/{id}/apply | Mark as applied |
| GET | /api/chat | Chat history |
| POST | /api/chat | Send message to Claude |
| GET | /api/products | List products |
| GET | /api/analytics | Analytics data |

---

## Switching to PostgreSQL (Production)

1. Change `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/optivise
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=your_user
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

2. Uncomment the PostgreSQL dependency in `pom.xml` and remove H2.

---

## Deployment

### Backend → Railway / Render / Heroku
1. Package: `mvn clean package -DskipTests`
2. Upload the `.jar` from `target/`
3. Set env vars: `ANTHROPIC_API_KEY`, `DATABASE_URL`

### Frontend → Vercel / Netlify
1. Build: `npm run build`
2. Deploy the `dist/` folder
3. Set env var: `VITE_API_URL=https://your-backend-url.com`
4. Update `vite.config.js` proxy or use `VITE_API_URL` in `api.js`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| CORS error | Check `cors.allowed-origins` in `application.properties` matches your frontend URL |
| 401 Unauthorized | Token expired — log out and log back in |
| AI chat not working | Check `ANTHROPIC_API_KEY` is set in your run config |
| H2 console blank | Go to http://localhost:8080/h2-console, JDBC URL: `jdbc:h2:mem:optivise` |
| Port conflict | Change `server.port` in `application.properties` and update Vite proxy |
