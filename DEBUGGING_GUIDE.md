# Debugging Guide — Isolate the Layer

Every bug lives in one layer. **Never guess.** Isolate in order:

```
React (F12 Console) → Network (F12 Network tab) → Express (terminal) → MongoDB (Compass)
```

---

## Layer 1: Database — Is the data there?

**Check with MongoDB Compass** (free GUI, best option):
- Open Compass → connect to `localhost:27017` → `university-management` DB
- Check the collection exists and documents have the fields you expect

**Or check with the terminal:**
```bash
cd backend
node -e "mongoose=require('mongoose');mongoose.connect('mongodb://localhost:27017/university-management').then(()=>require('./src/models/Grade').find().then(g=>{console.log(JSON.stringify(g,null,2));process.exit()}))"
```

**Common DB bugs:**
- `status` is `'in-progress'` but frontend expects `'in progress'`
- `points` is `null` instead of a number → GPA won't calculate
- `created_at` instead of `createdAt` → Mongoose won't populate it

---

## Layer 2: Backend — Is the controller running?

**Add `console.log` to the handler:**
```js
exports.getGrades = asyncHandler(async (req, res) => {
  console.log('[getGrades] studentId:', req.user.id)
  const myGrades = await Grade.find({ studentId: req.user.id }).lean()
  console.log('[getGrades] raw grades:', myGrades)
  // ...
})
```

**Hit the endpoint directly:**
```bash
# Get a token first (paste from browser localStorage, or login)
curl -H "Authorization: Bearer PASTE_TOKEN_HERE" http://localhost:5000/api/student/grades
```

**Watch the terminal** when you click things in the browser — does the log appear?

---

## Layer 3: Network — Is the response correct?

**Chrome DevTools → Network tab → Fetch/XHR:**

| Status | Meaning | Fix |
|--------|---------|-----|
| `200` | Success | Check the Response tab — is the JSON what you expect? |
| `401` | Unauthorized | Token missing/expired → `localStorage.clear()` → login again |
| `403` | Forbidden | Wrong role → logged in as professor but trying student routes |
| `500` | Server error | Check the terminal for the stack trace |

If the response has `{ courses: [...] }` but your frontend expects `{ data: [...] }` → the frontend is parsing the wrong field.

---

## Layer 4: Frontend — Is the component receiving data?

**Use React DevTools** (browser extension) — select the component, inspect `data` and `loading`.

**Add a debug log:**
```jsx
const { data, loading } = useFetch(() => studentApi.getGrades())
console.log('[Grades] data:', data, 'loading:', loading)
```

**Common frontend bugs:**
- `loading` stuck on `true` → the API call never returned (check Network tab)
- `data` is null, loading is false → API call failed (check Network tab response)
- `data.courses` exists but page shows nothing → wrong field name in render

---

## The 5-Minute Debug Flowchart

```
Bug appears?
  │
  ├─ Open Network tab (F12) → Refresh page
  │
  ├─ No request?          → Component didn't mount → check route in App.jsx
  ├─ 401?                 → Token expired → login again
  ├─ 500?                 → Server error → check terminal
  ├─ 200 but wrong data?  → Check the Response JSON → is it what the page expects?
  │
  └─ All looks correct?   → Bug is in the frontend rendering → add console.log
```

---

## The 3 Biggest Time-Savers

1. **"Split the screen"** — Browser on right, terminal on left. Watch logs as you click.
2. **"Read the error message"** — `Cannot read property 'map' of undefined` means `data` is undefined. `X is not a function` means you're calling something that isn't a function.
3. **"Revert and retry"** — Stuck for 30 minutes? Undo your last change and redo it slower. Works every time.
