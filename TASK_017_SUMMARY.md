# Task 017: Hash Reset Tokens - Summary

## Implementation Complete

### What Was Built

1.  **Token Hashing** (`server/src/routes/auth.ts`)
    *   Imported `createHash` from Node's `crypto` module.
    *   Updated `/forgot-password`: Generates a random token, hashes it with SHA-256 before database insertion, but sends the plain token via email.
    *   Updated `/reset-password`: Hashes the incoming token from the user request before querying the database for a match.

### Security Benefits

*   **Database Compromise Mitigation**: If the database is leaked (SQLi, backup theft), attackers only see hashed tokens. They cannot use these hashes to reset passwords because the API expects the plain token (which it then hashes for comparison).
*   **Defense in Depth**: Even if `passwordResetTokens` table is read-accessible, account takeover is prevented.

### File Locations

```
server/src/routes/
└── auth.ts  # Updated auth routes
```

### Verification

*   **Flow**: 
    1.  User requests reset -> Plain token sent to email, Hash stored in DB.
    2.  User clicks link (with plain token) -> Server hashes it -> Finds match -> Resets password.
