# HTTPS Setup (Windows)

## Prerequisites
- Node.js installed
- OpenSSL installed (comes with Git Bash, or install separately)
- PowerShell available
- MongoDB running locally

---

## Setup

From the server folder, run:

```
npm run setup-https
```

This will:
- Generate `cert.pem` and `key.pem` in the server folder
- Import the certificate into your Windows certificate store
- Copy `.env.example` to `.env` in the my-app folder
- Install dependencies in both the server and my-app folders

After it completes, restart Chrome/Edge completely (close all windows, reopen).

---

## Starting the App

In the server folder:

```
npm start
```

In the my-app folder (separate terminal):

```
npm start
```

---

## Open the App

```
https://localhost:3000
```

---

## Notes
- The certificate expires after 365 days. When it does, rerun `npm run setup-https` and restart Chrome.
- Never commit `cert.pem` or `key.pem` to git. They are listed in `.gitignore`.
- The `.env` file in my-app is safe to commit since it contains no secrets.
- The API server runs on `https://localhost:4000`
- The React dev server runs on `https://localhost:3000`