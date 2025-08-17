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
git clone https://github.com/Abdulsalamdev/filevault.git
cd filevault

# Install dependencies
npm install
# Register a new user
node cli.js register --username fuad --password secret

# Login
node cli.js login --username fuad --password secret

# Create folder
node cli.js mkdir documents

# List files/folders
node cli.js ls

# Upload file
node cli.js upload ./resume.pdf --parent documents
