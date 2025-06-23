# PrivateNote

**PrivateNote** is a secure, privacy-focused web application that lets users create encrypted notes protected by passwords. All encryption and decryption happen on the client side, ensuring that no unencrypted data is ever sent to the server.

---

## Features

- Client-side AES encryption and decryption for maximum privacy  
- Create, update, and retrieve notes via unique URLs  
- Password-protected notes with zero knowledge on the backend  
- Conflict resolution using last-modified tokens to prevent overwrites  
- Uses PostgreSQL in production and SQLite in development  
- Backend built with ASP.NET Core, frontend with React and Vite  

---

## Getting Started

### Backend

1. Navigate to the `backend/` folder  
2. Configure your connection string in `appsettings.json` (PostgreSQL for production, SQLite for development)  
3. Run migrations and start the ASP.NET Core server:

```bash
dotnet ef database update
dotnet run
```

### Frontend

1. Navigate to the `frontend/` folder  
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

---

## Usage

- Open the frontend URL (e.g., `http://localhost:3000`)  
- Create a new note by entering your encrypted text and setting a password  
- Share the generated unique URL with others securely  
- Access and update your note by entering the password  

---

## Security

- All encryption is performed **client-side** using AES; the backend only stores encrypted data  
- Passwords never leave the client, so the server has zero knowledge of the note contents  
- Conflict detection prevents data loss when multiple edits occur simultaneously  

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

---

## License

This project is licensed under the MIT License.
