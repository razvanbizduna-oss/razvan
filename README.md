# Interact Cismigiu — Portal Membri

## Credențiale cont
- **Username:** `INTERACT CISMIGIU`
- **Parola:** `itc2026`

---

## Setup Firebase (obligatoriu pentru sincronizare date)

### Pași rapizi:

1. Mergi la https://console.firebase.google.com → creează proiect nou (ex: `interact-cismigiu`)
2. Adaugă aplicație Web (`</>`) → copiază `firebaseConfig`
3. Build → Realtime Database → Create database → Start in test mode → copiază URL-ul
4. Deschide `src/lib/firebase.ts` și înlocuiește valorile `REPLACE_WITH_YOUR_*`

Câmpul cel mai important: `databaseURL` — ex: `https://interact-cismigiu-default-rtdb.europe-west1.firebasedatabase.app`

---

## Instalare 

```bash
npm install
npm run dev
```

Deschide http://localhost:5173
