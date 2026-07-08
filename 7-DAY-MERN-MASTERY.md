# 7-Day MERN Mastery Plan

> Master the student module and the MERN stack in one week.
> Each day builds on the previous. Do the tasks in order.

---

## Day 1 — Foundations: How a Page Loads

**Goal**: Understand the full lifecycle of ONE page from click to render.

### Read these files (in order, ~30 min):
1. `src/api/client.js` — How every request gets a JWT token
2. `src/api/index.js` — Find `studentApi.getDashboard` — see function name → URL mapping
3. `src/hooks/useFetch.js` — The hook every page uses (18 lines of real code)
4. `src/pages/student/Dashboard.jsx` — Read the full file, line by line
5. `backend/src/middleware/auth.middleware.js` — How `req.user` gets set
6. `backend/src/modules/student/student.controller.js` — Find `getDashboard`
7. `backend/src/modules/student/student.routes.js` — See the route → handler mapping

### Task: Trace the full flow
Write down in a notebook or text file the complete path for when you visit `/student/dashboard`:

```
Browser URL → React Router → Dashboard.jsx → useFetch → studentApi.getDashboard()
→ axios GET /api/student/dashboard → auth.middleware (verify JWT → req.user)
→ student.routes (GET /dashboard → getDashboard)
→ controller queries MongoDB → returns JSON
→ useFetch sets data → React re-renders page
```

**Check**: Can you explain this flow out loud without looking? If not, re-read.

### Bonus task (prove you understand):
Open Chrome DevTools → Network tab → refresh `/student/dashboard` → click the request → look at **Response** tab. Do you understand every field in that JSON?

---

## Day 2 — The 3 React Hooks That Run Everything

**Goal**: Master `useState`, `useEffect`, `useCallback` — the only hooks used across all 9 student pages.

### Read these files:
1. `src/hooks/useFetch.js` — This file uses all 3 hooks. Understand every line.
2. `src/pages/student/Catalog.jsx` — Uses `useState` (search, filter), `useCallback` (countFor), `useMemo` (userById, myCourseIds, list)
3. `src/pages/student/Assignments.jsx` — Uses `useState` (tab, submitFor, fileName), `useMemo`, `useCallback`

### Key insight — what each hook does:
| Hook | Purpose | Analogy |
|------|---------|---------|
| `useState` | Stores values that change (search text, active tab) | Like a variable that triggers re-render |
| `useEffect` | Runs code after render (fetch data, update URL) | Like a timer set after painting |
| `useCallback` | Keeps a function reference stable between renders | Like a sticky note that doesn't change |
| `useMemo` | Remembers a calculated value (filtered list, lookup map) | Like a cached calculation |

### Task: Read Catalog.jsx and answer:
1. What happens when you type in the search box? (trace `search` state)
2. What happens when you click "Enroll"? (trace `toggle` → `studentApi.enroll` → `reload`)
3. How does `list` update when `filter` changes?
4. Why is `countFor` wrapped in `useCallback`?

**Check**: Can you explain how state flows through a page when a user interacts with it?

---

## Day 3 — Backend: Controllers, Routes, and the Database

**Goal**: Understand every backend file in the student module.

### Read these files (in order):
1. `backend/src/modules/student/student.service.js` — `calculateGPA` logic
2. `backend/src/modules/student/student.controller.js` — All 18 handlers
3. `backend/src/modules/student/student.routes.js` — Route → handler mapping
4. `backend/src/middleware/asyncHandler.middleware.js` — The wrapper (3 lines)
5. `backend/src/middleware/role.middleware.js` — Role check (12 lines)

### Understand the MongoDB queries used:
```js
.find({ studentId })           // Find all documents matching condition
.find({ _id: { $in: ids } })  // Find documents where _id is in an array
.findOne({ studentId, courseId })  // Find one matching document
.findById(id)                  // Find by _id shortcut
.findByIdAndUpdate(id, data)   // Find + update in one operation
.create({ ... })               // Create a new document
.findOneAndDelete({ ... })     // Find + delete in one operation
.deleteOne({ ... })            // Delete matching documents
.countDocuments({ ... })       // Count matching documents
```

### Task — trace the enroll flow:
1. User clicks "Enroll" in Catalog.jsx
2. `studentApi.enroll(courseId)` → `axios.post('/student/enrollments', { courseId })`
3. Controller: `enroll` handler — check duplicate → check capacity → create enrollment → create grade
4. `reload()` re-fetches catalog

### Bonus: Read `seed-full.js` (first 50 lines)
Understand the `IDs` object and `day()` helper — they create predictable ObjectIds and dates so data is consistent every time you seed.

---

## Day 4 — All 9 Student Pages Deep Dive

**Goal**: Understand every student page's data flow, state, and rendering logic.

### Read each page (focus on how it gets and displays data):

| Page | File | Key Pattern | What It Tests |
|------|------|-------------|---------------|
| Dashboard | `Dashboard.jsx` | `useFetch + stat cards + grid + lists` | Overview of all data |
| Catalog | `Catalog.jsx` | `search + filter + enroll/drop` | CRUD operations |
| Courses | `Courses.jsx` | `filter by my enrollments` | Data filtering |
| Classroom | `Classroom.jsx` | `tabs + params + modals` | Nested routing, file upload |
| Assignments | `Assignments.jsx` | `4 tabs + submit modal` | Complex state management |
| Grades | `Grades.jsx` | `GPA calc + assignment tables` | Derived data display |
| Transcript | `Transcript.jsx` | `print-to-PDF + GPA summary` | Official document format |
| Exams | `Exams.jsx` | `upcoming/past + hero card` | Date comparison rendering |
| Notifications | `Notifications.jsx` | `type icons + mark-read + tabs` | State mutations |

### Task for each page:
1. Open the page in browser
2. Open its source code
3. Find: `useFetch` call → what data comes back? → how is it rendered? → empty state? → error boundary?
4. Note: what does the **empty state** look like when there's no data?

---

## Day 5 — Build Something Yourself

**Goal**: Prove you understand the patterns by building without looking at existing code.

### Challenge: Add a "Weekly Schedule" page

Create a new page at `/student/schedule` that:
1. Shows a weekly calendar view (Mon–Fri, 9AM–5PM)
2. Fetches courses you're enrolled in (reuse `getMyCourses` endpoint)
3. Places each course's schedule block in the correct day/time slot
4. Shows an empty state if no courses

**Files to create/edit**:
1. `src/pages/student/Schedule.jsx` — New page component
2. `src/api/index.js` — Add `getSchedule` or reuse `getMyCourses`
3. `src/components/layout/navConfig.js` — Add "Schedule" nav item
4. `src/App.jsx` — Add route `/student/schedule`

**Pattern to follow** (copy from Courses.jsx):
```jsx
export default function StudentSchedule() {
  const { data, loading } = useFetch(() => studentApi.getMyCourses())
  if (loading) return <LoadingState label="Loading schedule…" />
  // ... render weekly grid from data.courses ...
}
```

**Hint**: Courses have `schedule` field like `"Mon & Wed · 09:00–10:30"`. Parse it to get day and time.

---

## Day 6 — The GPA Feature: Master Data Flow

**Goal**: Deeply understand how GPA calculation works end-to-end — the most complex data flow.

### The data path:
```
seed-full.js         → Grade documents with points (e.g. 4.0, 3.7, 3.3)
                         ↓
student.controller   → Grade.find({ studentId }).lean()
                         ↓
student.service.js   → calculateGPA(grades, courseById)
                         ↓
                     → res.json({ gpa, credits })
                         ↓
Grades.jsx           → calculateGPA(myGrades, courseById)
                         ↓
                     → <StatCard value={gpa.toFixed(2)} />
```

### Read these files line by line:
1. `backend/src/modules/student/student.service.js:28-42` — The server-side GPA logic
2. `src/utils/helpers.js:66-80` — The frontend GPA logic (same formula, two places!)
3. `backend/src/modules/student/student.controller.js:185-203` — `getGrades` handler
4. `src/pages/student/Grades.jsx:19-21` — How the page uses `calculateGPA`

### Understand the formula:
```
GPA = Σ(gradePoints × courseCredits) / Σ(courseCredits)

Example (Jane Doe):
  CS101: A(4.0) × 3cr = 12.0
  CS201: A-(3.7) × 4cr = 14.8
  MATH201: B+(3.3) × 3cr = 9.9
  ─────────────────────────────
  Total: 36.7 points / 10 credits = 3.67 GPA
```

### Task — manually trace William's GPA:
With B+(3.3) × CS101(3cr) = 9.9 / 3 = **3.30**
Open the Grades page as William and verify this number matches.

---

## Day 7 — Put It All Together: Find and Fix a Bug

**Goal**: Use everything you learned to debug and fix a real problem.

### Final challenge:
The Dashboard's "Upcoming Deadlines" shows a badge with days left. Currently it shows `"Xd left"` for future assignments. `"Today"` if due today. Find the code and modify it to also show `"Tomorrow"` if due in 1 day.

**Files involved:**
1. `src/pages/student/Dashboard.jsx` — the badge rendering (line 94)
2. `src/utils/helpers.js` — `daysUntil` function

### Steps to solve:
1. Identify where the badge is rendered (grep for `d left`)
2. Read the surrounding code — what is `d`?
3. Add a condition: `d === 1 ? 'Tomorrow' : d === 0 ? 'Today' : ${d}d left`
4. Test it by finding a course with an assignment due tomorrow (or adjust the seed date temporarily)

### Bonus — make yourself a cheat sheet:

Write a 1-page reference with:
- The 5 MongoDB queries you use most
- The 3 React hooks and what they do
- The data flow pattern (page → useFetch → API → controller → MongoDB → back)
- The debugging flowchart (4 layers)

Keep this pinned above your monitor.

---

## If You Finish Early — Next Steps

- **Read the UI kit**: `src/components/ui/index.jsx` — understand every reusable component
- **Read the Context**: `src/context/DataContext.jsx` + `AuthContext.jsx` — understand state management
- **Trace the Auth flow**: `AuthContext.jsx` login → JWT stored → interceptor adds to request → auth middleware verifies
- **Read seed-full.js completely**: Understand how test data is structured — this will help you debug faster
- **Practice MongoDB queries**: Open Compass and run `.find()`, `.findOne()`, `.countDocuments()` manually

---

> **Mastery = you can explain it simply.**
> At the end of day 7, you should be able to explain the full flow of any student feature to a teammate in under 2 minutes. If you can't, re-read that feature's files.
