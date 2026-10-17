# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Patients (primary):** individuals in Saudi Arabia booking outpatient visits at the clinic via desktop or mobile web, in Arabic (RTL). Their job: find a doctor, pick a free slot, book/cancel/reschedule it themselves, and get a reliable record of the appointment.
- **Clinic staff:** doctors and an administrator/ receptionist use the management panel to view all bookings for their schedules and update appointment state (completed / no-show / cancelled by clinic).

## Product Purpose

نبض العافية (PulseCare) lets patients book, view, cancel, and reschedule medical appointments end-to-end online, while clinic staff manage the same schedule from one admin panel. Success means a booking the patient makes is real: no double-booking under concurrency, correct state everywhere, and staff/patient always seeing the same truth.

## Positioning

A single relational source of truth (Postgres behind Supabase) with race-condition-safe, atomic `SECURITY DEFINER` RPCs: the slot is locked and transacted so two patients can never book the same slot, with realtime updates keeping the UI current. The difference a neighboring generic scheduler could not truthfully copy is the guaranteed, transactional non-overlap of bookings backed by row-level security.

## Operating Context

- Patients authenticate (email + password) and use the browser UI; RTL Arabic throughout.
- Diets/Rates are shown in Saudi Riyal (ر.س) with a per-doctor consultation fee.
- Patients can share an appointment reminder via WhatsApp, common in the Saudi consumer context.
- Clinic staff/doctors sign in with a role on their profile and use the admin tab to mark appointments completed or no-show.
- The app runs as a static site served over HTTP (ES modules + CDN libs: Tailwind, Lucide, supabase-js) — `file://` is not supported.

## Capabilities and Constraints

Confirmed capabilities:

- Email/password auth; profile (name + phone) stored via a signup trigger and editable by its owner.
- Browse doctors and only their currently available slots (not booked, today or future) with search/filter/sort.
- Book, cancel, and reschedule via atomic RPC functions (`book_appointment`, `cancel_appointment`, `reschedule_appointment`) that verify `auth.uid()` and lock rows to prevent races.
- Realtime (Postgres changes) refresh of schedules and bookings.
- Patient booking history with state badges and WhatsApp share.
- Admin/clinic panel: totals + per-status stats, full booking table, status updates.
- Dark/light theme.

Technical constraints:

- Database grants follow least privilege; RLS is the security boundary; high-risk roles (`admin`) cannot be self-assigned (guarded by trigger).
- Doctor records are linked to auth accounts via `doctors.user_id` (unique, nullable); once an admin sets it, that doctor's account can see and manage their own schedules and appointments through RLS.
- The legitimate SECURITY DEFINER booking functions are intentionally callable only by signed-in users.
- Production deployment target not yet chosen; leak-protection for passwords not yet enabled (Supabase Auth setting).

## Brand Commitments

- Name is binding: **نَبْض العافية (PulseCare)**.
- Voice/language: Arabic-first, medical-care tone; UI text already localized in Arabic (MSA).
- Identity assets (logo, colors, wordmark) are the incumbent implementation only: a teal/emerald + slate palette and activity-pulse mark, all CSS/CDN-based. No external brand kit has been provided.
- The brand operates as a real clinic in Saudi Arabia; SAR pricing is part of the product reality. *(Confirmed with user.)*

## Evidence on Hand

- Working schema and UI are the evidence of the booking mechanism (see `schema.sql`, `index.html`, `app.js`, `supabase-service.js`).
- Seed/sample data only: 4 example doctors (fixed UUIDs, SAR fees) and generated future slots. No real patient data, doctor names, clinic location, photos, testimonials, or legal/press assets exist yet.
- Future work must not fabricate patient records, testimonials, or clinic claims; obtaining real production assets is pending.

## Product Principles

1. **One source of truth wins.** Booking state lives in Postgres behind RLS; the UI renders what the database says, never a local copy.
2. **Correctness over convenience.** The transactional lock in the RPCs is the core promise and must never be weakened for simplicity.
3. **Patient autonomy with zero surprise.** Patients can self-serve book/cancel/reschedule and always see true state.
4. **Security by default.** Least privilege, no role escalation, no leaking patient data, and internal helpers never exposed over REST.
5. **Reality-ready.** Because the product will run in production with real data, concurrency, auditability, and non-fabricated content are non-negotiable.

## Accessibility & Inclusion

- Full Arabic RTL layout is an established requirement (confirmed by implementation and voice).
- WCAG target is not yet defined; treat AA conformance as an open decision to confirm, not assumed complete.