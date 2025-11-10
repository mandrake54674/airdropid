📘 Airdrop Tracker Pro — Web3 Style

🚀 Airdrop Tracker Pro adalah aplikasi berbasis React + Google Sheets untuk mencatat, memantau, dan mengelola proyek airdrop crypto dengan gaya Web3 modern.
Didesain dengan efek neon, animasi halus, dan sistem penyimpanan real-time via Google Sheets API.

✨ Fitur Utama :

🧩 Tambah project airdrop (Twitter, Discord, Telegram, Wallet, Email, GitHub, Website)

🔍 Search bar — cari project dengan cepat

⚙️ Auto-refresh + Last Update info

🕶️ Global Hide/Unhide — sembunyikan data sensitif (wallet, email, dsb)

🌐 Website link aktif

💡 Efek Neon Web3 (via NeonParticles.jsx)

📱 UI Responsif (desktop & mobile friendly)

🧠 Teknologi yang Digunakan :

Stack	Deskripsi

⚛️ React + Vite	Frontend cepat & modern

🎨 TailwindCSS	Styling responsif dan ringan

💫 Framer Motion	Animasi UI Web3 halus

🔗 Google Apps Script	Backend API untuk menyimpan ke Google Sheets

☁️ Vercel	Hosting & deploy otomatis

🧰 lucide-react	Icon pack modern bergaya Web3

⚙️ Setup Lokal

Clone repo ini

git clone https://github.com/echoshil/airdrop-list.git
cd airdrop-list


Install dependencies

npm install


Buat file .env di root proyek

VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec


Jalankan di lokal

npm run dev


Akses di: http://localhost:5173

☁️ Deploy ke Vercel

Push repo ke GitHub.

Buka vercel.com
, pilih "Import Project".

Pilih repo airdrop-list.

Tambahkan Environment Variable:

VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec


Klik Deploy 🚀

📄 Format Google Sheet

Buat sheet baru bernama airdrop_tracker dengan kolom berikut:

name	twitter	discord	telegram	wallet	email	github	website

Lalu deploy Apps Script seperti ini:

function doPost(e) {
  const ss = SpreadsheetApp.openById("YOUR_SHEET_ID");
  const sheet = ss.getSheetByName("airdrop_tracker");
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.name, data.twitter, data.discord, data.telegram,
    data.wallet, data.email, data.github, data.website, new Date().toISOString()
  ]);
  return ContentService.createTextOutput("OK");
}

function doGet() {
  const ss = SpreadsheetApp.openById("YOUR_SHEET_ID");
  const sheet = ss.getSheetByName("airdrop_tracker");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const json = data.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  return ContentService.createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}

🧠 Tips Tambahan
Pastikan Google Script kamu di-deploy sebagai Web App (Anyone can access)
Gunakan mode CORS public agar bisa diakses dari Vercel
Untuk tampilan Web3 optimal, gunakan layar dark mode 🌌

💻 Demo
👉 https://airdrop-list-nine.vercel.app
📬 Kontribusi

Pull request dan masukan sangat diterima.
Silakan fork repo ini, buat branch baru, dan kirim PR.

👨‍💻 Author
💬 GitHub | ✉️ Email
