# StreamFlix Entity Relationship Diagram (ERD)
## Text Format for Copying

## ENTITIES AND ATTRIBUTES

### Account
- **Primary Key:** id (UUID)
- **Attributes:**
  - email (String, Unique)
  - passwordHash (String)
  - status (Enum: PENDING, ACTIVE, BLOCKED)
  - failedAttempts (Integer)
  - blockedUntil (DateTime, Nullable)
  - trialEndsAt (DateTime, Nullable)
  - createdAt (DateTime)
  - updatedAt (DateTime)

### Profile
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - accountId → Account.id
  - ageCategoryId → AgeCategory.id (Optional)
- **Attributes:**
  - name (String)
  - imageUrl (String, Nullable)
  - preferences (JSON)
  - createdAt (DateTime)
  - updatedAt (DateTime)

### Title
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - minAgeCategoryId → AgeCategory.id (Optional)
- **Attributes:**
  - slug (String, Unique)
  - name (String)
  - synopsis (String, Nullable)
  - type (Enum: FILM, SERIES)
  - guidelineFlags (Array of Enum: VIOLENCE, FEAR, COARSE_LANGUAGE)
  - availableQualities (Array of String)
  - genres (Array of String)
  - durationMinutes (Integer, Nullable)
  - createdAt (DateTime)
  - updatedAt (DateTime)

### Season
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - titleId → Title.id
- **Attributes:**
  - number (Integer)
- **Unique Constraint:** (titleId, number)

### Episode
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - titleId → Title.id
  - seasonId → Season.id (Nullable)
- **Attributes:**
  - number (Integer)
  - name (String)
  - synopsis (String, Nullable)
  - durationMinutes (Integer)
- **Unique Constraint:** (seasonId, number)

### WatchEvent
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - profileId → Profile.id
  - accountId → Account.id
  - titleId → Title.id
  - episodeId → Episode.id (Nullable)
- **Attributes:**
  - startedAt (DateTime)
  - finishedAt (DateTime, Nullable)
  - durationWatched (Integer)
  - completed (Boolean)
  - autoContinued (Boolean)
  - lastPosition (Integer)

### WatchlistItem
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - profileId → Profile.id
  - titleId → Title.id
- **Attributes:**
  - addedAt (DateTime)
- **Unique Constraint:** (profileId, titleId)

### Subscription
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - accountId → Account.id (Unique)
  - planId → SubscriptionPlan.id
- **Attributes:**
  - status (Enum: TRIAL, ACTIVE, CANCELED, PAST_DUE)
  - renewalDate (DateTime, Nullable)
  - trialEndsAt (DateTime, Nullable)
  - discountEndsAt (DateTime, Nullable)
  - createdAt (DateTime)
  - updatedAt (DateTime)

### SubscriptionPlan
- **Primary Key:** id (UUID)
- **Attributes:**
  - code (String, Unique)
  - name (String)
  - quality (String)
  - monthlyPrice (Integer)
  - description (String, Nullable)

### Invitation
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - inviterAccountId → Account.id
  - acceptedAccountId → Account.id (Nullable, Unique)
  - subscriptionId → Subscription.id (Nullable)
- **Attributes:**
  - token (String, Unique)
  - inviteeEmail (String)
  - status (String)
  - discountStartsAt (DateTime, Nullable)
  - discountEndsAt (DateTime, Nullable)
  - createdAt (DateTime)
  - updatedAt (DateTime)

### DiscountLedger
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - accountId → Account.id
  - invitationId → Invitation.id (Nullable)
- **Attributes:**
  - startsAt (DateTime)
  - endsAt (DateTime)
  - createdAt (DateTime)

### VerificationToken
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - accountId → Account.id
- **Attributes:**
  - token (String, Unique)
  - type (Enum: VERIFY, RESET)
  - expiresAt (DateTime)
  - usedAt (DateTime, Nullable)
  - createdAt (DateTime)

### Employee
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - roleId → Role.id (Optional)
- **Attributes:**
  - username (String, Unique)
  - passwordHash (String)
  - createdAt (DateTime)

### AgeCategory
- **Primary Key:** id (UUID)
- **Attributes:**
  - code (String, Unique)
  - name (String)
  - description (String, Nullable)
  - minAge (Integer, Nullable)
  - maxAge (Integer, Nullable)
  - createdAt (DateTime)
  - updatedAt (DateTime)

### Subtitle
- **Primary Key:** id (UUID)
- **Foreign Keys:**
  - titleId → Title.id (Nullable)
  - episodeId → Episode.id (Nullable)
- **Attributes:**
  - languageCode (String)
  - languageName (String)
  - fileUrl (String)
  - format (String)
  - isDefault (Boolean)
  - createdAt (DateTime)
  - updatedAt (DateTime)
- **Note:** Subtitle belongs to either Title (films) or Episode (series), not both

### Role
- **Primary Key:** id (UUID)
- **Attributes:**
  - code (String, Unique)
  - name (String)
  - description (String, Nullable)
  - level (Integer)
  - permissions (Array of String)
  - createdAt (DateTime)
  - updatedAt (DateTime)


## RELATIONSHIPS

### One-to-Many (1:N)

1. **Account → Profile**
   - One Account has many Profiles
   - Relationship: Account.id → Profile.accountId
   - Delete: CASCADE

2. **Account → WatchEvent**
   - One Account creates many WatchEvents
   - Relationship: Account.id → WatchEvent.accountId
   - Delete: CASCADE

3. **Account → VerificationToken**
   - One Account has many VerificationTokens
   - Relationship: Account.id → VerificationToken.accountId
   - Delete: CASCADE

4. **Account → Invitation (sent)**
   - One Account sends many Invitations
   - Relationship: Account.id → Invitation.inviterAccountId
   - Delete: CASCADE

5. **Account → DiscountLedger**
   - One Account has many DiscountLedger entries
   - Relationship: Account.id → DiscountLedger.accountId
   - Delete: CASCADE

6. **Profile → WatchEvent**
   - One Profile creates many WatchEvents
   - Relationship: Profile.id → WatchEvent.profileId
   - Delete: CASCADE

7. **Profile → WatchlistItem**
   - One Profile has many WatchlistItems
   - Relationship: Profile.id → WatchlistItem.profileId
   - Delete: CASCADE

8. **Title → Season**
   - One Title has many Seasons
   - Relationship: Title.id → Season.titleId
   - Delete: CASCADE

9. **Title → Episode**
   - One Title has many Episodes
   - Relationship: Title.id → Episode.titleId
   - Delete: CASCADE

10. **Title → WatchEvent**
    - One Title is watched in many WatchEvents
    - Relationship: Title.id → WatchEvent.titleId
    - Delete: CASCADE

11. **Title → WatchlistItem**
    - One Title appears in many Watchlists
    - Relationship: Title.id → WatchlistItem.titleId
    - Delete: CASCADE

12. **Title → Subtitle**
    - One Title has many Subtitles (for films)
    - Relationship: Title.id → Subtitle.titleId
    - Delete: CASCADE

13. **Season → Episode**
    - One Season contains many Episodes
    - Relationship: Season.id → Episode.seasonId
    - Delete: CASCADE

14. **Episode → Subtitle**
    - One Episode has many Subtitles (for series)
    - Relationship: Episode.id → Subtitle.episodeId
    - Delete: CASCADE

15. **Subscription → Invitation**
    - One Subscription generates many Invitations
    - Relationship: Subscription.id → Invitation.subscriptionId
    - Delete: SET NULL

16. **Invitation → DiscountLedger**
    - One Invitation creates many DiscountLedger entries
    - Relationship: Invitation.id → DiscountLedger.invitationId
    - Delete: SET NULL

17. **AgeCategory → Profile**
    - One AgeCategory applies to many Profiles
    - Relationship: AgeCategory.id → Profile.ageCategoryId
    - Delete: SET NULL

18. **AgeCategory → Title**
    - One AgeCategory restricts many Titles
    - Relationship: AgeCategory.id → Title.minAgeCategoryId
    - Delete: SET NULL

19. **Role → Employee**
    - One Role is assigned to many Employees
    - Relationship: Role.id → Employee.roleId
    - Delete: SET NULL


### One-to-One (1:1)

1. **Account → Subscription**
   - One Account has one Subscription
   - Relationship: Account.id → Subscription.accountId (Unique)
   - Delete: CASCADE

2. **Account → Invitation (accepted)**
   - One Account accepts one Invitation
   - Relationship: Account.id → Invitation.acceptedAccountId (Unique, Nullable)
   - Delete: SET NULL


## CARDINALITY SUMMARY

- **Account** (1) → (N) **Profile**
- **Account** (1) → (1) **Subscription**
- **Account** (1) → (N) **WatchEvent**
- **Account** (1) → (N) **VerificationToken**
- **Account** (1) → (N) **Invitation** (sent)
- **Account** (1) → (1) **Invitation** (accepted)
- **Account** (1) → (N) **DiscountLedger**

- **Profile** (1) → (N) **WatchEvent**
- **Profile** (1) → (N) **WatchlistItem**
- **Profile** (N) → (1) **Account**
- **Profile** (N) → (1) **AgeCategory**

- **Title** (1) → (N) **Season**
- **Title** (1) → (N) **Episode**
- **Title** (1) → (N) **WatchEvent**
- **Title** (1) → (N) **WatchlistItem**
- **Title** (1) → (N) **Subtitle**
- **Title** (N) → (1) **AgeCategory**

- **Season** (1) → (N) **Episode**

- **Episode** (1) → (N) **Subtitle**
- **Episode** (N) → (1) **Title**
- **Episode** (N) → (1) **Season**

- **Subscription** (1) → (1) **Account**
- **Subscription** (N) → (1) **SubscriptionPlan**
- **Subscription** (1) → (N) **Invitation**

- **Invitation** (N) → (1) **Account** (inviter)
- **Invitation** (1) → (1) **Account** (accepted)
- **Invitation** (N) → (1) **Subscription**
- **Invitation** (1) → (N) **DiscountLedger**

- **Employee** (N) → (1) **Role**

- **AgeCategory** (1) → (N) **Profile**
- **AgeCategory** (1) → (N) **Title**

- **Subtitle** (N) → (1) **Title** (for films)
- **Subtitle** (N) → (1) **Episode** (for series)

- **Role** (1) → (N) **Employee**


## REFERENTIAL INTEGRITY RULES

### Cascade Delete
- When Account is deleted → Profiles, WatchEvents, VerificationTokens, Invitations, DiscountLedgers are deleted
- When Profile is deleted → WatchEvents, WatchlistItems are deleted
- When Title is deleted → Seasons, Episodes, WatchEvents, WatchlistItems, Subtitles are deleted
- When Season is deleted → Episodes are deleted
- When Episode is deleted → Subtitles are deleted

### Restrict Delete
- SubscriptionPlan cannot be deleted if Subscriptions reference it

### Set Null Delete
- When Invitation is deleted → DiscountLedger.invitationId set to NULL
- When Subscription is deleted → Invitation.subscriptionId set to NULL
- When Account (accepted) is deleted → Invitation.acceptedAccountId set to NULL
- When AgeCategory is deleted → Profile.ageCategoryId and Title.minAgeCategoryId set to NULL
- When Role is deleted → Employee.roleId set to NULL
- When Episode is deleted → WatchEvent.episodeId set to NULL


## UNIQUE CONSTRAINTS

1. **Account.email** - Unique email addresses
2. **Title.slug** - Unique content slugs
3. **Subscription.accountId** - One subscription per account
4. **Invitation.acceptedAccountId** - One accepted invitation per account
5. **Invitation.token** - Unique invitation tokens
6. **VerificationToken.token** - Unique verification tokens
7. **Employee.username** - Unique usernames
8. **AgeCategory.code** - Unique age category codes (KIDS, TEEN, ADULT)
9. **Role.code** - Unique role codes (JUNIOR, MID, SENIOR)
10. **SubscriptionPlan.code** - Unique plan codes
11. **WatchlistItem** - Unique combination of (profileId, titleId)
12. **Season** - Unique combination of (titleId, number)
13. **Episode** - Unique combination of (seasonId, number)
14. **Subtitle** - Unique language per title/episode (handled via partial unique indexes)


## NORMALIZATION (3NF)

### First Normal Form (1NF)
- All attributes are atomic
- Each row is unique (primary keys defined)
- No repeating groups

### Second Normal Form (2NF)
- All non-key attributes fully dependent on primary key
- No partial dependencies
- Example: WatchEvent depends on its own id, not on titleId alone

### Third Normal Form (3NF)
- No transitive dependencies
- All non-key attributes depend only on the primary key
- Example: Subscription doesn't store plan details, only planId reference
- Example: Profile doesn't store account email, only accountId reference




