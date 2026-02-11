# Aadhaar Migration Pulse

A real-time analytics dashboard that visualizes internal migration patterns across India by analyzing Aadhaar enrolment and demographic update data.

## What it does

The system processes raw Aadhaar enrolment and demographic CSV datasets to compute a per-pincode migration score. It flags regions where demographic update volume is disproportionately high relative to new enrolments — a strong indicator of undocumented population movement.

The frontend renders an interactive heatmap over a dark-themed map of India, with a full analytics dashboard showing:

- Scatter plot correlating enrolments vs demographic updates to detect anomalies
- Top 10 high-velocity districts ranked by migration score
- State-level distribution of migration activity
- Trend momentum (accelerating / decelerating / stable zones)

## Tech Stack

- **Data processing:** Python, Pandas
- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Charts:** Recharts
- **Map:** Leaflet, leaflet.heat
- **UI components:** Radix UI (Dialog, Button, Card)
- **Optimization:** React Compiler

## Project Structure
```text
.
├── process_data.py              # Cleans raw CSVs and outputs dashboard_data.json
├── raw_data/                   # Source CSV files (enrolment + demographic)
└── aadhaar-dashboard/
    └── dashboard/              # React frontend
        ├── src/
        │   ├── App.jsx
        │   ├── components/
        │   │   ├── HeatmapMap.jsx
        │   │   ├── DashboardModal.jsx
        │   │   ├── Navbar.jsx
        │   │   ├── StatsWidget.jsx
        │   │   └── Legend.jsx
        │   └── assets/
        │       └── dashboard_data.json
        └── index.html
```

## Setup
### Data Processing
```bash
pip install pandas
python process_data.py
```
Reads from raw_data/ and outputs dashboard_data.json into the frontend assets folder.

### Frontend
```bash
cd aadhaar-dashboard/dashboard
npm install
npm run dev
```
Opens at http://localhost:5173/

## Screenshots

### Homepage
<img width="1919" height="945" alt="Screenshot 2026-01-20 173931" src="https://github.com/user-attachments/assets/40427fa5-cb9b-4a71-958b-f0d6a4167547" />

### Dashboard
<img width="1919" height="944" alt="Screenshot 2026-01-20 175739" src="https://github.com/user-attachments/assets/3f48e06f-8f6c-45dc-88c5-e4630d9500d8" />
<img width="1726" height="846" alt="Screenshot 2026-01-20 175758" src="https://github.com/user-attachments/assets/9056651f-51bb-44fa-a639-659d8d0502d0" />
<img width="1724" height="840" alt="Screenshot 2026-01-20 175824" src="https://github.com/user-attachments/assets/033edfdf-0b50-4dd1-a592-ec5ed97a8e7b" />
<img width="1715" height="844" alt="Screenshot 2026-01-20 175840" src="https://github.com/user-attachments/assets/eb745148-1909-4a50-ad82-5bc43bbbd334" />

