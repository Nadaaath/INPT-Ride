# INPT Ride

## 1. Project Overview
INPT Ride is a campus vehicle rental platform for bikes and scooters.
It provides:
- a student mobile application
- an admin web dashboard
- a backend API
- a wallet-based billing system

## 2. Objectives
- Allow students to reserve bikes or scooters by hourly slots
- Allow supervised vehicle pickup through QR scan and admin confirmation
- Allow return to the same station
- Generate invoices automatically at ride end
- Deduct ride cost from the student wallet
- Allow the admin to manage vehicles, reservations, rides, pricing, and wallet top-ups
- Build the project with strong software engineering and DevOps practices

## 3. Actors
- Student
- Admin

## 4. Platforms
- Student mobile app: React Native + Expo
- Admin dashboard: Next.js
- Backend API: FastAPI
- Database: PostgreSQL

## 5. Version 1 Scope
### Student
- Google login
- View all vehicles
- Filter by bike or scooter
- View vehicle details
- Reserve vehicle by hour block
- Cancel reservation
- Scan QR to start ride
- End ride at station
- View wallet balance
- View invoices and ride history

### Admin
- Manage vehicles
- Manage reservations
- Approve vehicle release
- Monitor rides
- Top up student wallets manually
- Configure pricing rules
- View invoices
- Record damages
- Ban or unban students
- Mark vehicle maintenance

## 6. Station Model
- One station only
- Every vehicle has a fixed slot
- All returns happen to the same station

## 7. Reservation Rules
- Reservation is hourly only
- Start times are exact hours
- Reservation can be created up to 48 hours before start
- Minimum duration: 1 hour
- Maximum duration: 10 hours
- A student cannot have overlapping active reservations
- A student can cancel a reservation
- No-show or late cancellation may produce a fee

## 8. Ride Flow
### Start
- Student arrives at reservation time
- Student scans vehicle QR code
- Admin receives a notification
- Admin validates and releases the vehicle
- Ride starts

### End
- Student returns vehicle to the same station
- Student scans the station return code
- Ride ends
- Invoice is generated
- Wallet is debited

## 9. Billing
Version 1 billing uses:
- base fee
- hourly rate
- late return surcharge
- damage cost if applicable
- no-show fee if applicable

## 10. Wallet
- Each student has a wallet
- Wallet is topped up manually by admin
- Ride costs are deducted from wallet
- Wallet balance is visible in the mobile app

## 11. Main Technologies
- React Native + Expo
- Next.js
- FastAPI
- PostgreSQL
- Docker Compose

## 12. Future Improvements
- Redis for reservation expiration and locking
- Notifications
- Observability
- Kubernetes deployment
- Advanced analytics
- GPS/km billing