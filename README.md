# Dharmovix

Learning & opportunity platform: hackathons, workshops, internships, courses.
Stack: Node.js (Express) · SQLite (better-sqlite3) · vanilla JS single-page frontend.

## 1. Setup
    npm install
    cp .env.example .env     # edit values (a local .env with your initial admin login is already included)
    npm start                # http://localhost:3000
Requires Node 18+.

## 2. Database
SQLite file at `DATABASE_FILE` (default ./dharmovix.db). Tables are created automatically on first start.
On hosts with ephemeral disks, mount a persistent volume for the DB file and `uploads/`. Back it up regularly.

## 3. Environment variables
- ADMIN_EMAIL, ADMIN_PASSWORD: initial admin, read only when no admin exists; the password is bcrypt-hashed into the DB
- SESSION_SECRET: long random string
- APP_URL: public site URL, used for links in emails
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL: email delivery
- DATABASE_FILE, PORT, NODE_ENV

Never commit `.env`. After first login, change the admin password in Admin > Settings, then remove ADMIN_PASSWORD from the server environment.

## 4. Admin
Open `/#/admin-login` (not linked publicly). Credentials exist only on the server; the password is hashed.

## 5. Email
Gmail example: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER=you@gmail.com, SMTP_PASSWORD=<Google App Password>.
Failed sends are stored in Admin > Email Notifications and can be retried.

## 6. Payment QR
Put your ₹49 QR image at `public/qr.png`. Users enter their UPI/UTR reference; admin must verify payment before approving.

## 7. Production checklist
- NODE_ENV=production (Secure cookies) behind HTTPS (Nginx/Caddy/Render)
- Unique SESSION_SECRET; .env never in git
- Persist DB + uploads/; schedule backups
- Use a transactional email provider for volume (SES, Brevo, Resend)

## 8. Features added later
- Admin > Opportunities > "Notify users": one click emails every approved user who has not yet received that opportunity.
- 🔔 bell in the header for logged-in users: shows opportunities published since they last opened Opportunities.
- Achieve page (`/#/achieve`): pick a role, see what it leads to and a 5-stage learning roadmap. Edit the `ROLES` list in `public/app.js` to change content.
- Admin login link is in the header; the admin page is `/#/admin-login`.

## 9. Redesign notes
- Dark design system: tokens at the top of `public/style.css`; fonts Plus Jakarta Sans (headings) + Inter (body).
- Footer contact details and social links: fill in `SITE` at the top of `public/app.js` (email, phone, socials). Empty values are hidden.
- Password fields have a show/hide eye button. Login and admin login are not rate-limited (registration and password change still are).

## 10. ATS Checker, popup, apply link, loading screen
- `/#/ats`: upload a PDF/DOCX/TXT (or paste text). The server (`POST /api/ats-extract`) only extracts the text in memory; scoring runs in the browser (`analyzeResume` in `public/app.js`). Nothing is stored.
- Visitors who are not logged in meet Dharmo, a guide character, once per browser session when they open the ATS page. Any key press or tap moves to the next step (3 steps), and the next one after the last step closes it. Escape closes it too. Edit the `GUIDE` list in `public/app.js` to change the wording; clear `sessionStorage.dvGuide` to see it again.
- Page header and login backgrounds are the SVG drawings in `public/bg/` (referenced from `public/style.css`). Replace them with your own photos if you prefer.
- On an opportunity page, "Apply / Register" opens the registration link set by the admin in a new tab and saves the application. If no link was set, it just saves the application.
- The intro starts with a logo loading animation, then shows the headline and "Get Started".
