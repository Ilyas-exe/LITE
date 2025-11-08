# LITE Project - Phase 0 Setup Complete! 🎉

## ✅ What We've Built (Prompts 1-10)

### Backend Components Created:

1. **User Entity** (`entity/User.java`)
   - Implements Spring Security's `UserDetails`
   - Fields: id, email (unique), password (hashed), name

2. **UserRepository** (`repository/UserRepository.java`)
   - JPA repository with `findByEmail()` method

3. **CustomUserDetailsService** (`service/CustomUserDetailsService.java`)
   - Loads user by email for authentication

4. **JwtUtil** (`util/JwtUtil.java`)
   - `generateToken()` - Creates JWT tokens
   - `validateToken()` - Validates JWT tokens
   - `extractEmail()` - Extracts email from tokens

5. **JwtAuthFilter** (`filter/JwtAuthFilter.java`)
   - Intercepts every request
   - Extracts and validates JWT from Authorization header
   - Sets authentication in SecurityContext

6. **SecurityConfig** (`config/SecurityConfig.java`)
   - Password encoder (BCrypt)
   - CORS configuration (allows React frontend)
   - HTTP security rules:
     - `/api/auth/**` - Public (login/register)
     - `/api/**` - Requires authentication
   - JWT filter integration

7. **DTOs** (`dto/`)
   - `RegisterRequest` - name, email, password
   - `LoginRequest` - email, password
   - `AuthResponse` - jwtToken, username

8. **AuthService** (`service/AuthService.java`)
   - `register()` - Creates new user, returns JWT
   - `login()` - Authenticates user, returns JWT

9. **AuthController** (`controller/AuthController.java`)
   - `POST /api/auth/register` - Register endpoint
   - `POST /api/auth/login` - Login endpoint
   - `GET /api/auth/test` - Test endpoint

---

## 🚀 Next Steps: Before Running the Application

### Step 1: Create the PostgreSQL Database

You need to create the `lite_db` database in PostgreSQL. Choose one of these methods:

#### Option A: Using psql (Command Line)
```bash
psql -U postgres
CREATE DATABASE lite_db;
\q
```

#### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Name: `lite_db`
5. Click "Save"

### Step 2: Update Database Credentials (if needed)

Edit `application.properties` and update these lines if your PostgreSQL settings are different:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/lite_db
spring.datasource.username=postgres
spring.datasource.password=password  # <-- Change this to your PostgreSQL password
```

### Step 3: Run the Application

```powershell
cd c:\Users\ilyas\Bureau\working\LITE\lite-backend
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.3.9-hotspot"
$env:PATH="C:\Program Files\Eclipse Adoptium\jdk-21.0.3.9-hotspot\bin;$env:PATH"
.\mvnw.cmd clean spring-boot:run
```

---

## 📝 Testing the Authentication API

Once the application is running, you can test it using these endpoints:

### 1. Test the server is running:
```bash
GET http://localhost:8080/api/auth/test
```

### 2. Register a new user:
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "John Doe"
}
```

### 3. Login:
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "John Doe"
}
```

---

## 🔐 How JWT Authentication Works

1. **Register/Login**: User sends credentials → Server returns JWT token
2. **Store Token**: Frontend stores the JWT (localStorage or cookies)
3. **Authenticated Requests**: Frontend sends token in `Authorization` header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Validation**: JwtAuthFilter intercepts, validates token, sets authentication
5. **Access**: If valid, user can access protected `/api/**` endpoints

---

## 📁 Project Structure

```
lite-backend/
├── src/main/java/com/lite/lite_backend/
│   ├── config/
│   │   └── SecurityConfig.java          # Security configuration
│   ├── controller/
│   │   └── AuthController.java          # Auth endpoints
│   ├── dto/
│   │   ├── AuthResponse.java            # Response DTOs
│   │   ├── LoginRequest.java
│   │   └── RegisterRequest.java
│   ├── entity/
│   │   └── User.java                    # User entity (UserDetails)
│   ├── filter/
│   │   └── JwtAuthFilter.java           # JWT authentication filter
│   ├── repository/
│   │   └── UserRepository.java          # User data access
│   ├── service/
│   │   ├── AuthService.java             # Authentication logic
│   │   └── CustomUserDetailsService.java
│   ├── util/
│   │   └── JwtUtil.java                 # JWT token utilities
│   └── LiteBackendApplication.java      # Main application
└── src/main/resources/
    └── application.properties           # Configuration
```

---

## ⚙️ Configuration Details

### CORS Configuration
Currently configured to allow requests from:
- `http://localhost:3000` (Create React App)
- `http://localhost:5173` (Vite)

### JWT Token
- **Validity**: 24 hours
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: Hardcoded for development (should be moved to properties for production)

### Spring Security Rules
- **Public**: `/api/auth/**` (login, register)
- **Protected**: All other `/api/**` endpoints
- **Session Management**: Stateless (JWT-based, no server sessions)

---

## 🐛 Common Issues & Solutions

### Issue 1: Database doesn't exist
**Error**: `FATAL: la base de données « lite_db » n'existe pas`
**Solution**: Create the database (see Step 1 above)

### Issue 2: Wrong Java version
**Error**: `class file has wrong version`
**Solution**: Use the commands in Step 3 to set JAVA_HOME to JDK 21

### Issue 3: Connection refused to PostgreSQL
**Error**: `Connection refused`
**Solution**: Make sure PostgreSQL is running:
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*
```

---

## 🎯 Ready for Phase 1!

Once your backend is running successfully, you're ready to move on to:
- **Prompts 11-16**: Frontend Setup (React, Auth Context, Protected Routes)
- **Prompts 17-26**: Job Tracker Module (CRUD + File Upload)

Keep this README handy for reference!
