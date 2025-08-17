# 📁 FileVault

FileVault is a secure **file and folder management system** with both a **CLI interface** and a **RESTful API**, built using **Node.js, MongoDB, and Redis**. It allows authenticated users to manage files and folders with hierarchical structure, public/private access, and user-level permissions.

---

## 🚀 Features
- 🔐 **Authentication & Authorization**
  - User registration and login
  - Session management with Redis
  - Public & private file/folder access

- 📂 **File & Folder Management**
  - Create folders (`mkdir`)
  - Upload and manage files
  - Read, list, and delete operations
  - Nested hierarchy with `parent_id`

- 🌐 **REST API**
  - Authentication and file/folder endpoints
  - Filtering and query support (`?type=pdf&owner=username`)

- ⚡ **Backend Stack**
  - Node.js + Express
  - MongoDB for storage
  - Redis for session management
  - BullMQ for background jobs
  - Multer & Sharp for file handling and images

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **Cache/Session:** Redis  
- **Queue/Workers:** BullMQ  
- **File Handling:** Multer, Sharp  

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Abdulsalamdev/File-vault.git
cd fileVault

# Install dependencies
npm install

```

---
## 📂 Project Structure
```bash
filevault/
├── cli/                 # CLI commands
├── controllers/         # Express controllers
├── middleware/          # Auth & validation middleware
├── models/              # Mongoose models
├── repositories/        # Repository pattern for DB
├── routes/              # API routes
├── services/            # Business logic services
├── storage/             # File storage utilities
├── utils/               # Helper functions
├── workers/             # BullMQ workers
├── cli.js               # CLI entry point
├── server.js            # Express app entry point
├── package.json
└── README.md

```
## 📖 API Endpoints
Authentication

POST /api/auth/register → Register new user

POST /api/auth/login → Login

POST /api/auth/logout → Logout

Files & Folders

POST /api/files → Upload file

GET /api/files → List files/folders

GET /api/files/:id → Get file/folder details

DELETE /api/files/:id → Delete file/folder


