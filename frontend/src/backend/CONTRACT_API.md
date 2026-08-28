# API Contract Specification (Streamlined & Minimalist Backend)

Semua endpoint (kecuali `/api/auth/register` dan `/api/auth/login`) membutuhkan header autentikasi JWT:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 1. Autentikasi (`/api/auth`)
- **POST** `/api/auth/register` Payload: `{ "name", "email", "password" }`
- **POST** `/api/auth/login` Payload: `{ "email", "password" }`
- **GET** `/api/auth/me`

---

## 2. Master Kategori (`/api/categories`)
- **GET** `/api/categories`
- **POST** `/api/categories` Payload: `{ "name", "type": "INCOME" | "EXPENSE", "icon" }`
- **DELETE** `/api/categories/:id`

---

## 3. Manajemen Dompet & RDN (`/api/wallets`)
- **GET** `/api/wallets`
- **POST** `/api/wallets` Payload: `{ "name", "type": "BANK" | "E_WALLET" | "RDN" | "CASH", "balance", "institutionName" }`
- **POST** `/api/wallets/transaction` Payload: `{ "walletId", "categoryId", "type": "INCOME" | "EXPENSE", "amount", "note" }`
- **POST** `/api/wallets/transfer` Payload: `{ "sourceWalletId", "destinationWalletId", "amount", "note" }`

---

## 4. Portofolio Simpel (`/api/portfolio`)
- **GET** `/api/portfolio` -> Ambil daftar aset investasi.
- **POST** `/api/portfolio/asset` Payload: `{ "name", "type": "Saham" | "Reksadana" | "Obligasi" | "Crypto", "totalValue" }`
- **POST** `/api/portfolio/buy-sell` Payload: `{ "action": "BUY" | "SELL", "assetId", "rdnWalletId", "amountRp" }`
- **PUT** `/api/portfolio/asset/:id/value` Payload: `{ "newTotalValue": 5200000 }` *(Manual Override Value)*

---

## 5. Dasbor Cepat (`/api/dashboard`)
- **GET** `/api/dashboard`
  Returns:
  ```json
  {
    "success": true,
    "data": {
      "netWorth": 32500000,
      "totalWalletsBalance": 22500000,
      "totalAssetsValue": 10000000,
      "monthlyCashFlow": {
        "income": 15000000,
        "expense": 4500000,
        "netSavings": 10500000,
        "monthName": "Agustus 2026"
      },
      "allocation": [
        { "name": "Kas & Dompet", "value": 22500000, "percentage": 69.23 },
        { "name": "Saham", "value": 6000000, "percentage": 18.46 },
        { "name": "Reksadana", "value": 4000000, "percentage": 12.31 }
      ]
    }
  }
  ```
