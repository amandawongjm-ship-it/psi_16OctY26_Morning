# Chat History & Prompts Log

## Project: SG AirWatch (Singapore PSI & Air Quality Alert Tracker)

---

### Turn 1

#### User Prompt:
> build a a singapore based application that tracks live psi levels and alerts user when air quality drops to unhealthy threaholsd. it should include an interactive map and push notifications 
>
> build just the front end for now and i will add serverless backbone connection later.

#### Assistant Actions & Summary:
- **Application Architecture**:
  - Initialized **SG AirWatch** – a real-time Singapore Pollutant Standards Index (PSI) and particulate ($PM_{2.5}$) air quality sentinel.
  - Implemented official Singapore National Environment Agency (NEA) PSI categories: **Good** (0–50), **Moderate** (51–100), **Unhealthy** (101–200), **Very Unhealthy** (201–300), and **Hazardous** (>300).
- **Interactive SVG Map**:
  - Developed custom interactive Singapore regional vector map dividing the island into the 5 official NEA monitoring zones: **North**, **South**, **East**, **West**, and **Central**, plus peripheral territories (**Sentosa**, **Jurong Island**, **Pulau Ubin**, **Pulau Tekong**).
  - Shaded dynamically by current air quality status with pulsing radar sensor pins for threshold breaches.
  - Interactive meteorological overlays: Southwest/Northeast monsoon wind vectors, transboundary smoke haze dispersion layer, and toggleable view modes (24-hr PSI vs 1-hr PM2.5).
- **Alert & Push Notification System**:
  - Integrated browser Web Notification API (`Notification.requestPermission()`, `new Notification()`).
  - Synthesized dual-tone audio alert chime via Web Audio API (zero external sound asset dependency).
  - Configurable alert rules: customizable PSI threshold (defaulting to NEA Unhealthy threshold >100), PM2.5 threshold, region filtering, and Sensitive Demographics mode (triggers early at PSI 80 for pregnant women, elderly, children, and asthma sufferers).
  - High-visibility Urgent Alert Banner with immediate health recommendations.
  - Persistent notification history log with unread badge counter.
- **Scenario Simulator & Testing Playground**:
  - Added one-click scenario presets: *Live NEA Feed*, *Simulate Unhealthy West (PSI 135)*, *Islandwide Haze (PSI 148)*, and *Hazardous Crisis (PSI 315)* with an instant test push button.
- **Health Advisories & 24-Hour Trend**:
  - Detailed health guidance categorized by demographic groups.
  - Outdoor physical activity feasibility indicators (running, cycling, school sports).
  - N95 respirator mask vs surgical mask advice and HEPA air purifier guidance.
  - Multi-line 24-hour historical SVG trend chart with interactive hover scrubbing and guideline threshold markers.
  - Singapore estate/town search (e.g., Woodlands, Bedok, Tampines, Jurong, Orchard).

---

### Turn 2

#### User Prompt:
> add a serverlesss api connection that pulls live data from data.gov.sg using the following endpoint: 
> 
> GET https://api-open.data.gov.sg/v2/real-time/api/psi
> 
> 1. store this in /api folder in the project root level, NOT the src folder
> 
> 2. include /health.ts and /psi.ts within the same subfolder
> 
> 3. there is no key required for this service

#### Assistant Actions & Summary:
- **Serverless Architecture in `/api` (Root Level)**:
  - Created `/api/health.ts`:
    - Serverless health-check handler returning service uptime, memory statistics, status, and upstream target reference.
    - CORS enabled (`Access-Control-Allow-Origin: *`).
  - Created `/api/psi.ts`:
    - Pulls live real-time PSI and pollutant readings directly from `GET https://api-open.data.gov.sg/v2/real-time/api/psi` without requiring an API key.
    - Implemented a 25-second in-memory cache to prevent upstream rate limiting.
    - Added automated fallback to stale cache on network hiccups, and automatic calculation of aggregate national 24-hr PSI if absent.
    - Exported as a standard serverless function handler (`export default async function handler(req, res)`).
- **Server Mount**:
  - Created `server.ts` mounting `/api/health` and `/api/psi`, integrating Express with Vite middleware in development and static asset serving in production.
  - Updated `package.json` scripts:
    - `"dev": "tsx server.ts"`
    - `"start": "tsx server.ts"`
- **Frontend Integration**:
  - Updated `src/services/airQualityService.ts` to query the `/api/psi` serverless gateway endpoint with fallbacks.

---

### Turn 3

#### User Prompt:
> export this entire chat as an .md file --> prompts.md

#### Assistant Actions & Summary:
- Exported complete chat prompt logs, system architecture details, and implementation milestones to `/prompts.md`.
