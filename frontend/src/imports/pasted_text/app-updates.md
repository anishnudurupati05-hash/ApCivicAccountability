You are updating an existing civic accountability web application called 
"AP Civic Tracker" built for Andhra Pradesh, India. The app tracks 175 
MLAs across 13 districts. Do NOT rebuild from scratch — improve and extend 
the existing design and code.

=============================================================
SECTION 1: CRITICAL BUG FIXES (Do these first)
=============================================================

FIX 1 — Reports Page Constituency Selector
The current dropdown shows "{District} Central" which is wrong.
Replace the constituency selector with a searchable input that 
lists all 175 real AP constituencies. Use the same constituency 
list already present in the MLA directory. Add a search/filter 
input above the dropdown so users can type and find their 
constituency quickly. This is a civic app — wrong constituency 
data destroys credibility.

FIX 2 — AI Chat Error States
When the AI times out or fails, show a graceful fallback card 
instead of a raw error message. The fallback should:
- Show a friendly "AI is temporarily unavailable" message
- Display the constituency's key stats directly (MLA name, 
  score, completed projects, budget utilization) without AI
- Include a "Retry" button
- Never show raw API error strings to the user

FIX 3 — Mobile Responsiveness
Fix these specific mobile breakage points:
- Rankings table: add horizontal scroll wrapper, hide 
  Budget% and Sentiment columns on screens below 768px
- Compare page: stack the VS selector vertically on mobile, 
  make the radar chart full width
- Tax in My Area: fix horizontal overflow on the tax flow 
  funnel bars, make the itemised deductions list readable 
  on small screens
- MLA Detail page: the three-column grid should become 
  single column on mobile

FIX 4 — News Page Credibility Label
The news articles are AI-generated templates, not real news.
Add a visible disclaimer banner at the top of the News page:
"⚠️ Simulated News Feed — This data is AI-generated for 
demonstration purposes. Real news integration coming soon."
Style it in amber/yellow so it is clearly noticeable but 
not alarming. This is an honesty requirement.

FIX 5 — Score Display Consistency
The MLA score is shown as /200 in some places and /100 in 
others. Standardize to /200 everywhere. Update the 
Accountability Indicator ring in Tax in My Area to use /200 
as the max. Update all score color thresholds:
- Green: score >= 140
- Amber: score >= 100  
- Red: score < 100

=============================================================
SECTION 2: NEW PAGES TO ADD
=============================================================

NEW PAGE 1 — Data Sources & Methodology (/data-sources)
Create a clean, trustworthy page that shows:

Header: "Our Data & Methodology"
Subheader: "Transparency about what is real, estimated, and 
modelled in this platform"

Add a data sources table with these columns:
Data Point | Source | Status | Coverage
- MLA Names & Constituencies | AP Election Commission 2024 | ✅ Verified | 175/175
- Party Affiliations | AP Legislature Official Records | ✅ Verified | 175/175  
- District Boundaries | Census of India 2011 | ✅ Verified | 13/13
- Budget Allocations | AP Finance Department 2024-25 | 🔄 Estimated | Modelled
- Project Status | PMGSY + District Records | 🔄 Estimated | Modelled
- Promise Tracking | Party Manifestos 2024 | 🔄 Partial | Modelled
- Sentiment Scores | AI Model | ⚠️ Synthetic | Modelled
- News Articles | AI Generated | ⚠️ Synthetic | Demo only

Add a "Scoring Formula" section explaining:
Score = (Completed Projects × 5) + (In Progress × 2) 
      - (Not Started × 3) + Budget Utilization % 
      + Sentiment Score

Add a "How You Can Help" section with three cards:
1. Submit RTI data you've obtained about your constituency
2. Report inaccuracies you find in MLA information  
3. Contribute to open-sourcing this platform on GitHub

Add this page to the sidebar navigation between 
"Citizen Reports" and "Compare Areas" with a 
Database/Info icon.

---

NEW PAGE 2 — MLA Attendance Tracker (/attendance)
Create a new page showing MLA Assembly session attendance.

Header: "Assembly Attendance Tracker"
Subheader: "Tracking MLA presence in the 16th AP Legislative 
Assembly sessions — because showing up matters"

Add a disclaimer banner: "📋 Attendance data is modelled 
based on publicly available patterns. Real data sourced from 
AP Legislature will replace this in future updates."

Layout:
- Top stats row: Average Attendance %, Most Absent Party, 
  Most Present MLA, Total Sessions Tracked
- A searchable, sortable table with columns:
  Rank | MLA Name | Constituency | Party | Sessions Present | 
  Sessions Total | Attendance % | Trend
- Color code the Attendance % column:
  Green >= 80%, Amber 60-79%, Red < 60%
- Add a bar chart showing average attendance by party
- Add a heatmap-style calendar showing session dates 
  (use a simple grid of colored squares, green = present, 
  red = absent, grey = no session)
- For each MLA row, show a small sparkline trend of their 
  last 6 sessions

Generate realistic modelled attendance data:
- TDP MLAs: average 74% attendance (governing party, higher)
- JSP MLAs: average 71% attendance
- BJP MLAs: average 68% attendance  
- YSRCP MLAs: average 61% attendance (opposition, lower)
- Add natural variance of +-15% per individual MLA

Add this to the sidebar navigation with a Calendar/Clock icon 
labelled "Attendance" with a "NEW" badge.

---

NEW PAGE 3 — Asset Declaration Tracker (/assets)
Create a page comparing MLA declared assets between 
elections.

Header: "MLA Asset Declarations"
Subheader: "Comparing declared assets from 2019 and 2024 
election affidavits filed with Election Commission of India"

Add disclaimer: "📋 Asset data is modelled for demonstration. 
Real figures are available at affidavit.eci.gov.in for each 
candidate."

Layout:
- Summary cards: Average Asset Growth %, Highest Growth MLA,
  MLAs with >200% growth, Total Declared Wealth 2024
- A sortable table: MLA | Party | Assets 2019 | Assets 2024 | 
  Growth % | Growth Amount
- Color code growth: >300% = red (scrutiny needed), 
  150-300% = amber, <150% = green (normal)
- Add a scatter plot: X axis = Age, Y axis = Total Assets 2024,
  colored by party
- A "highest growth" leaderboard showing top 10 MLAs by 
  asset growth percentage with a flame icon

Generate modelled asset data:
- Base assets 2019: between Rs 50 lakh and Rs 15 crore 
  (vary by constituency type: urban = higher)
- Growth multiplier: 1.4x to 4.2x between 2019-2024
- Use realistic Indian asset figures in Crores

Add to sidebar with a TrendingUp icon, labelled 
"Asset Declarations".

=============================================================
SECTION 3: IMPROVE EXISTING PAGES
=============================================================

IMPROVE — Dashboard
Add a "Data Health" widget at the bottom of the dashboard:
A small card showing:
- % of data that is verified vs modelled
- Last data refresh date
- A "Request Data Update" button
- Link to /data-sources page

Add a "Quick Facts" horizontal scrolling ticker at the very 
top of the dashboard (above the title) showing:
"175 MLAs tracked • 13 Districts • 4 Parties • 
50 Active Projects • Last updated: April 2026"
Style it as a thin amber banner.

---

IMPROVE — MLA Detail Page
Add a new "Accountability Score Card" section below the 
profile header. Show 5 metrics as circular progress rings 
in a row:
1. Promise Fulfillment %
2. Budget Utilization %  
3. Project Completion %
4. Public Sentiment %
5. Assembly Attendance % (new metric)

Each ring should be colored by performance (green/amber/red) 
and have a label below it. This gives citizens a fast visual 
summary before they scroll to details.

Add a "Similar MLAs" section at the bottom showing 3 MLAs 
from the same district with similar scores, with links to 
their profiles.

---

IMPROVE — Rankings Page
Add a "Hall of Shame" toggle next to the existing rankings 
that reverses the sort to show worst performers first.
Label it clearly as "Lowest Performing" not "Shame" to 
keep it professional.

Add party filter pills (TDP | JSP | BJP | YSRCP | All) 
as clickable buttons above the table instead of a dropdown 
— faster to interact with.

Add a "Download Rankings CSV" button that exports the 
visible rankings data.

---

IMPROVE — Tax in My Area Page  
Add a new section called "Your Tax in Action — Real Projects"
that lists the top 3 most expensive projects in the 
constituency with a visual showing:
- Project name
- Your estimated contribution to this project 
  (calculated as: project budget / constituency population 
  * assumed taxpayers ratio)
- A mini progress bar
- Status badge

This makes the tax data personal and tangible.

Also add a social share button: "Share my constituency's 
tax usage" that generates a shareable summary card showing 
the efficiency score and key stats.

---

IMPROVE — Speak Up Page
Add a "Most Urgent by District" section at the top — a 
horizontal row of district cards, each showing the top 
issue from that district. Clicking a card filters the feed 
to that district.

Add an "Escalate to MLA" button on each issue card that:
- Shows the MLA's name and contact for that constituency
- Provides a pre-filled email template
- Copies it to clipboard with one click
This is the single most impactful feature for real 
accountability.

=============================================================
SECTION 4: DESIGN SYSTEM UPDATES
=============================================================

DATA INTEGRITY BADGES
Create a reusable badge component used throughout the app:
- ✅ Green "Verified" badge for real data points
- 🔄 Blue "Estimated" badge for modelled data
- ⚠️ Amber "Synthetic" badge for AI-generated data
Apply these badges on cards and table headers where relevant.
Keep them small (12px text) and non-intrusive.

LOADING STATES
Improve all loading states to use skeleton screens that 
match the actual content shape — not just generic grey bars.
The MLA cards, rankings rows, and news cards should each 
have a skeleton that mirrors their real layout.

EMPTY STATES
Add proper empty state illustrations (use simple SVG 
geometric shapes, no external images) for:
- No search results
- No issues in Speak Up
- No reports submitted yet
Each empty state should have a helpful action button.

COLOR THEME — add a subtle civic/governmental feel:
Keep the existing amber (#F59E0B) as primary accent.
Add a secondary accent: deep navy (#1E3A5F) for headers 
and important callouts.
The overall feel should say "trustworthy civic tool" 
not "startup app."

=============================================================
SECTION 5: NAVIGATION & INFORMATION ARCHITECTURE
=============================================================

SIDEBAR REORGANIZATION
Group the navigation items into sections:

Section "Overview":
- Dashboard
- MLA Directory  
- Rankings
- Attendance (NEW)

Section "Accountability":
- Promises
- Budget Tracking
- Projects Map
- Asset Declarations (NEW)

Section "Citizen Tools":
- Compare Areas
- Tax in My Area
- Ask AI
- Speak Up
- Citizen Reports

Section "Platform":
- News & Updates
- Data Sources (NEW)

Add subtle section labels in the sidebar (small uppercase 
grey text, not clickable).

---

BREADCRUMB NAVIGATION
Add breadcrumbs to all detail pages:
- MLA Detail: Home > MLA Directory > [MLA Name]
- Tax in My Area: Home > [Constituency Name]
Use the existing Breadcrumb component already in the 
shadcn/ui components.

=============================================================
SECTION 6: PERFORMANCE & TRUST
=============================================================

Add a site-wide footer (visible on all pages) with:
- "AP Civic Tracker — Open Data Initiative"
- "Data Sources" link
- "Report an Error" link  
- "This is an independent civic platform. Not affiliated 
  with AP Government."
- Version number: v2.0
- Small text: "Built to increase transparency and 
  accountability in Andhra Pradesh"

Add a "Report Inaccuracy" button on every MLA profile page
that opens a simple modal where users can flag incorrect 
information with a category (Wrong party / Wrong data / 
Outdated info / Other) and a text field. This builds 
community-driven data quality.

=============================================================
DESIGN CONSTRAINTS — DO NOT CHANGE THESE
=============================================================

- Keep the existing amber + slate color scheme
- Keep the existing sidebar navigation structure as base
- Keep all existing shadcn/ui components
- Keep the Supabase backend connection
- Keep the existing TypeScript + React + Vite setup
- Keep the existing multi-language support (EN/TE/HI) — 
  add translation keys for all new UI text
- Keep the existing responsive layout system
- Do NOT remove any existing pages or features
- Keep the amber "AP" avatar and MapPin logo in sidebar
- Maintain the existing dark sidebar (slate-900) style

=============================================================
TONE & VOICE
=============================================================

This is a serious civic accountability platform. 
The tone should be:
- Trustworthy and factual, never sensational
- Empowering to citizens, never partisan
- Clear about what is real data vs modelled data
- Professional but accessible to non-technical users
- Written for an Andhra Pradesh audience — use local 
  context (mention Telugu language, AP districts, 
  local schemes like YSR schemes, TDP schemes)

=============================================================
PRIORITY ORDER FOR IMPLEMENTATION
=============================================================

If you can only implement some of these changes, 
prioritize in this order:

1. FIX all 5 bugs listed in Section 1
2. ADD Data Sources page (Section 2, Page 1)  
3. IMPROVE MLA Detail accountability score cards
4. ADD Attendance Tracker page
5. FIX sidebar reorganization with sections
6. ADD site-wide footer
7. IMPROVE Tax in My Area personal contribution section
8. ADD Asset Declaration page
9. IMPROVE Speak Up escalation feature
10. IMPROVE Rankings hall of fame toggle