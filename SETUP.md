# Internix — Step-by-Step Setup Guide (Windows)

Follow every step below exactly. Nothing is optional.

---

## STEP 1: Create MongoDB Atlas Database

1. Open https://cloud.mongodb.com — Sign up / Log in
2. Click **"Build a Database"** → Choose **M0 FREE** → Click **Create**
3. **Database Access** (left sidebar):
   - Click **"Add New Database User"**
   - Username: `anantyash902` (or your choice)
   - Password: choose a password (NO special characters like `@#$%` in password to avoid URL issues)
   - Click **"Add User"**
4. **Network Access** (left sidebar):
   - Click **"Add IP Address"** → Click **"Allow Access from Anywhere"** → **Confirm**
5. Go to **"Database"** (left sidebar) → Click **"Connect"** on your cluster
   - Choose **"Drivers"**
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://anantyash902:<db_password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<db_password>` with your actual password
   - Add database name `internix` before the `?`:
     ```
     mongodb+srv://anantyash902:yourpassword@cluster0.abc123.mongodb.net/internix?retryWrites=true&w=majority
     ```
   - **Save this string** — you'll need it in Step 3

---

## STEP 2: Create Cloudinary Account

1. Open https://cloudinary.com — Sign up (free)
2. Go to **Dashboard** (after login)
3. Copy these 3 values:
   - **Cloud Name** (e.g., `dxyz1234`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnop`)
4. **Save these** — you'll need them in Step 3

---

## STEP 3: Setup Backend

Open a terminal (PowerShell or CMD) in the `Internix` folder:

```powershell
cd backend
npm install
```

Now create the `.env` file. Open Notepad or your editor and create `backend/.env` with this content:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://anantyash902:YOUR_ACTUAL_PASSWORD@cluster0.YOUR_CLUSTER_ID.mongodb.net/internix?retryWrites=true&w=majority

JWT_SECRET=internix_jwt_secret_key_2024_change_me_in_production
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET

CLIENT_URL=http://localhost:5173
```

**Replace ALL placeholder values** with your actual credentials from Steps 1 and 2.

Then seed the admin user and start the server:

```powershell
npm run seed
npm run dev
```

You should see:
```
MongoDB Connected: cluster0-shard-00-00...
Server running in development mode on port 5000
```

**Admin login**: `admin@internix.com` / `admin123`

---

## STEP 4: Setup Web Frontend

Open a **new terminal** in the `Internix` folder:

```powershell
cd web
npm install
```

Create `web/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:
```powershell
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## STEP 5: Setup Flutter Mobile App

### Prerequisites
- Install Flutter SDK: https://docs.flutter.dev/get-started/install/windows
- Add Flutter to your PATH
- Run `flutter doctor` to verify setup

### Generate platform files

Open a **new terminal** in the `Internix` folder:

```powershell
cd mobile
```

Since we only created the Dart source code, you need to generate the Flutter platform files:

```powershell
flutter create --project-name internix_mobile .
```

This will generate the `android/`, `ios/`, `web/`, `windows/`, `linux/`, `macos/`, and `test/` folders while keeping the existing `lib/`, `pubspec.yaml`, etc. intact.

Then:

```powershell
flutter pub get
```

### Configure API URL

Edit `mobile/lib/config/api_config.dart`:

- **Android Emulator**: `http://10.0.2.2:5000/api` (default — works as-is)
- **Physical Android device**: `http://YOUR_PC_IP:5000/api`
  - Find your IP: run `ipconfig` in PowerShell, look for IPv4 under Wi-Fi
  - Phone must be on same Wi-Fi network
- **iOS Simulator**: `http://localhost:5000/api`

### Run the app

```powershell
flutter run
```

Or to target a specific device:
```powershell
flutter devices          # List available devices
flutter run -d chrome    # Run on Chrome (web)
flutter run -d emulator  # Run on Android emulator
```

---

## STEP 6: Test the System

### Web App Testing Flow:

1. **Login as Admin** → `admin@internix.com` / `admin123`
2. **Register a Mentor** → Go to http://localhost:5173/register, select "Mentor" role
3. **Register a Student** → Same, select "Student" role
4. **Admin Dashboard** → See analytics cards and charts
5. **Create Internship** → Go to Internships page → New Internship → Select the mentor
6. **Enroll Student** → Click "Enroll" on the internship → Select student
7. **Assign Mentor** → Go to Users → Click mentor icon on student row → Select mentor
8. **Login as Mentor** → Create Tasks for the student
9. **Login as Student** → View tasks, mark attendance, upload reports
10. **Login as Admin** → Generate certificate for the student → Student can download it

### Mobile App Testing:
- Same flow as above, just on the mobile screens
- Login → Dashboard → Tasks → Attendance → Reports → Certificates

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `ECONNREFUSED` on backend start | Check MONGO_URI in `.env` — password and cluster ID must be correct |
| CORS errors on web | Make sure `CLIENT_URL=http://localhost:5173` in backend `.env` |
| Mobile can't connect to backend | Check API URL in `api_config.dart` — use your PC's IP for physical device |
| `npm run seed` fails | Backend `.env` must exist with valid MONGO_URI first |
| Cloudinary upload fails | Check all 3 Cloudinary values in `.env` are correct |
| Flutter errors after `flutter create .` | Run `flutter clean` then `flutter pub get` again |

---

## Quick Reference Commands

| Action | Command | Directory |
|--------|---------|-----------|
| Start backend | `npm run dev` | `backend/` |
| Start web | `npm run dev` | `web/` |
| Seed admin | `npm run seed` | `backend/` |
| Run mobile | `flutter run` | `mobile/` |
| Build web for production | `npm run build` | `web/` |
| Build Flutter APK | `flutter build apk` | `mobile/` |
