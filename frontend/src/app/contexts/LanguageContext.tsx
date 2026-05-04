import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "te" | "hi";

export interface Translations {
  // Layout / Header
  searchPlaceholder: string;
  liveStatus: string;
  notifications: string;

  // Sidebar nav
  nav: {
    dashboard: string;
    mlaDirectory: string;
    rankings: string;
    promises: string;
    budgetTracking: string;
    projectsMap: string;
    newsUpdates: string;
    citizenReports: string;
    compareAreas: string;
    speakUp: string;
  };

  // Sidebar misc
  allMlasLoaded: string;
  districts: string;
  parties: string;
  assemblyLabel: string;
  legislativeAssembly: string;

  // Dashboard page
  dashboard: {
    title: string;
    subtitle: string;
    totalMLAs: string;
    topRated: string;
    promisesFulfilled: string;
    pendingPromises: string;
    activeProjects: string;
    totalBudget: string;
    partyWiseSplit: string;
    performanceOverview: string;
    recentNews: string;
    viewAll: string;
    loading: string;
    error: string;
    noData: string;
    mlasByParty: string;
    avgRating: string;
    newsHeadlines: string;
    topMLAs: string;
    rank: string;
    constituency: string;
    party: string;
    score: string;
    fulfilledLabel: string;
    pendingLabel: string;
    failedLabel: string;
  };

  // MLAList page
  mlaList: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterByParty: string;
    filterByDistrict: string;
    allParties: string;
    allDistricts: string;
    showing: string;
    of: string;
    mlas: string;
    viewProfile: string;
    constituency: string;
    district: string;
    party: string;
    noResults: string;
    loading: string;
    prevPage: string;
    nextPage: string;
    page: string;
  };

  // MLADetail page
  mlaDetail: {
    backToList: string;
    constituency: string;
    district: string;
    party: string;
    promises: string;
    projects: string;
    budget: string;
    news: string;
    overallScore: string;
    promiseFulfillment: string;
    projectCompletion: string;
    budgetUtilization: string;
    publicSentiment: string;
    loading: string;
    error: string;
    fulfilled: string;
    pending: string;
    failed: string;
    active: string;
    completed: string;
    stalled: string;
  };

  // Rankings page
  rankings: {
    title: string;
    subtitle: string;
    rank: string;
    mla: string;
    constituency: string;
    party: string;
    score: string;
    promiseFulfillment: string;
    projectCompletion: string;
    publicSentiment: string;
    loading: string;
    error: string;
  };

  // Promises page
  promises: {
    title: string;
    subtitle: string;
    fulfilled: string;
    pending: string;
    failed: string;
    category: string;
    timeline: string;
    loading: string;
    error: string;
    allCategories: string;
    allStatus: string;
    filterByStatus: string;
    filterByCategory: string;
  };

  // Budget page
  budget: {
    title: string;
    subtitle: string;
    allocated: string;
    spent: string;
    utilization: string;
    department: string;
    scheme: string;
    loading: string;
    error: string;
  };

  // Projects page
  projects: {
    title: string;
    subtitle: string;
    active: string;
    completed: string;
    stalled: string;
    loading: string;
    error: string;
    constituency: string;
    status: string;
    budget: string;
  };

  // News page
  news: {
    title: string;
    subtitle: string;
    positive: string;
    negative: string;
    neutral: string;
    source: string;
    sentiment: string;
    loading: string;
    error: string;
  };

  // Reports page
  reports: {
    title: string;
    subtitle: string;
    submit: string;
    yourName: string;
    constituency: string;
    category: string;
    description: string;
    loading: string;
    success: string;
    error: string;
  };

  // Compare page
  compare: {
    title: string;
    subtitle: string;
    selectA: string;
    selectB: string;
    vsLabel: string;
    winner: string;
    tied: string;
    score: string;
    projects: string;
    completed: string;
    budget: string;
    sentiment: string;
    loading: string;
    error: string;
    pickBoth: string;
    trending: string;
    metrics: string;
    winnerIs: string;
  };

  // SpeakUp page
  speakUp: {
    title: string;
    subtitle: string;
    hot: string;
    recent: string;
    topVoted: string;
    postIssue: string;
    issueTitle: string;
    issueDesc: string;
    yourName: string;
    constituency: string;
    category: string;
    submit: string;
    cancel: string;
    upvote: string;
    comment: string;
    addComment: string;
    commentPlaceholder: string;
    allCategories: string;
    loading: string;
    error: string;
    success: string;
    noIssues: string;
    reactions: string;
    agree: string;
    urgent: string;
    care: string;
    angry: string;
    comments: string;
    postedBy: string;
    anonymous: string;
    trending: string;
    filterByCategory: string;
    searchConstituency: string;
  };

  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    noData: string;
    viewAll: string;
    close: string;
    submit: string;
    cancel: string;
    search: string;
    filter: string;
    sort: string;
    export: string;
    share: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    searchPlaceholder: "Search MLA or constituency...",
    liveStatus: "175 MLAs • Live",
    notifications: "Notifications",

    nav: {
      dashboard: "Dashboard",
      mlaDirectory: "MLA Directory",
      rankings: "Rankings",
      promises: "Promises",
      budgetTracking: "Budget Tracking",
      projectsMap: "Projects Map",
      newsUpdates: "News & Updates",
      citizenReports: "Citizen Reports",
      compareAreas: "Compare Areas",
      speakUp: "Speak Up",
    },

    allMlasLoaded: "✓ All 175 MLAs Loaded",
    districts: "13 Districts",
    parties: "4 Parties",
    assemblyLabel: "Andhra Pradesh Assembly",
    legislativeAssembly: "16th Legislative Assembly",

    dashboard: {
      title: "AP Civic Tracker",
      subtitle: "Andhra Pradesh Legislative Assembly • Real-time accountability dashboard",
      totalMLAs: "Total MLAs",
      topRated: "Top Rated MLAs",
      promisesFulfilled: "Promises Fulfilled",
      pendingPromises: "Pending Promises",
      activeProjects: "Active Projects",
      totalBudget: "Total Budget",
      partyWiseSplit: "Party-wise MLA Split",
      performanceOverview: "Performance Overview",
      recentNews: "Recent News",
      viewAll: "View All",
      loading: "Loading dashboard...",
      error: "Failed to load dashboard",
      noData: "No data available",
      mlasByParty: "MLAs by Party",
      avgRating: "Avg. Rating",
      newsHeadlines: "Latest Headlines",
      topMLAs: "Top Performing MLAs",
      rank: "Rank",
      constituency: "Constituency",
      party: "Party",
      score: "Score",
      fulfilledLabel: "Fulfilled",
      pendingLabel: "Pending",
      failedLabel: "Failed",
    },

    mlaList: {
      title: "MLA Directory",
      subtitle: "All 175 Members of the Andhra Pradesh Legislative Assembly",
      searchPlaceholder: "Search by name or constituency...",
      filterByParty: "Filter by Party",
      filterByDistrict: "Filter by District",
      allParties: "All Parties",
      allDistricts: "All Districts",
      showing: "Showing",
      of: "of",
      mlas: "MLAs",
      viewProfile: "View Profile",
      constituency: "Constituency",
      district: "District",
      party: "Party",
      noResults: "No MLAs found matching your search.",
      loading: "Loading MLAs...",
      prevPage: "Previous",
      nextPage: "Next",
      page: "Page",
    },

    mlaDetail: {
      backToList: "← Back to MLA Directory",
      constituency: "Constituency",
      district: "District",
      party: "Party",
      promises: "Promises",
      projects: "Projects",
      budget: "Budget",
      news: "News",
      overallScore: "Overall Score",
      promiseFulfillment: "Promise Fulfillment",
      projectCompletion: "Project Completion",
      budgetUtilization: "Budget Utilization",
      publicSentiment: "Public Sentiment",
      loading: "Loading MLA details...",
      error: "Failed to load MLA details",
      fulfilled: "Fulfilled",
      pending: "Pending",
      failed: "Failed",
      active: "Active",
      completed: "Completed",
      stalled: "Stalled",
    },

    rankings: {
      title: "MLA Rankings",
      subtitle: "Performance-based ranking of all 175 Andhra Pradesh MLAs",
      rank: "Rank",
      mla: "MLA",
      constituency: "Constituency",
      party: "Party",
      score: "Score",
      promiseFulfillment: "Promise %",
      projectCompletion: "Projects %",
      publicSentiment: "Sentiment",
      loading: "Loading rankings...",
      error: "Failed to load rankings",
    },

    promises: {
      title: "Promise Tracker",
      subtitle: "Election manifesto promises tracked across all MLAs",
      fulfilled: "Fulfilled",
      pending: "Pending",
      failed: "Failed",
      category: "Category",
      timeline: "Timeline",
      loading: "Loading promises...",
      error: "Failed to load promises",
      allCategories: "All Categories",
      allStatus: "All Status",
      filterByStatus: "Filter by Status",
      filterByCategory: "Filter by Category",
    },

    budget: {
      title: "Budget Tracking",
      subtitle: "Constituency-level budget allocation and utilization",
      allocated: "Allocated",
      spent: "Spent",
      utilization: "Utilization",
      department: "Department",
      scheme: "Scheme",
      loading: "Loading budget data...",
      error: "Failed to load budget data",
    },

    projects: {
      title: "Projects Map",
      subtitle: "Constituency development projects across Andhra Pradesh",
      active: "Active",
      completed: "Completed",
      stalled: "Stalled",
      loading: "Loading projects...",
      error: "Failed to load projects",
      constituency: "Constituency",
      status: "Status",
      budget: "Budget",
    },

    news: {
      title: "News & Updates",
      subtitle: "Latest news with AI-powered sentiment analysis",
      positive: "Positive",
      negative: "Negative",
      neutral: "Neutral",
      source: "Source",
      sentiment: "Sentiment",
      loading: "Loading news...",
      error: "Failed to load news",
    },

    reports: {
      title: "Citizen Reports",
      subtitle: "Submit and track civic issues in your constituency",
      submit: "Submit Report",
      yourName: "Your Name",
      constituency: "Constituency",
      category: "Category",
      description: "Description",
      loading: "Submitting report...",
      success: "Report submitted successfully!",
      error: "Failed to submit report",
    },

    compare: {
      title: "Compare Your Area",
      subtitle: "Compare performance metrics of any two constituencies side-by-side",
      selectA: "Select Constituency A",
      selectB: "Select Constituency B",
      vsLabel: "VS",
      winner: "Winner",
      tied: "It's a Tie!",
      score: "Overall Score",
      projects: "Total Projects",
      completed: "Completed",
      budget: "Budget Utilized",
      sentiment: "Sentiment",
      loading: "Loading comparison...",
      error: "Failed to load comparison",
      pickBoth: "Select both constituencies above to compare",
      trending: "🔥 Trending Comparisons",
      metrics: "Key Metrics",
      winnerIs: "is leading!",
    },

    speakUp: {
      title: "Speak Up",
      subtitle: "Voice of the People — Raise issues, vote, and demand accountability",
      hot: "🔥 Hot",
      recent: "🕐 Recent",
      topVoted: "⬆️ Top Voted",
      postIssue: "Post an Issue",
      issueTitle: "Issue Title",
      issueDesc: "Describe the issue",
      yourName: "Your Name (optional)",
      constituency: "Constituency",
      category: "Category",
      submit: "Post Issue",
      cancel: "Cancel",
      upvote: "Upvote",
      comment: "Comment",
      addComment: "Add Comment",
      commentPlaceholder: "Share your thoughts...",
      allCategories: "All Categories",
      loading: "Loading issues...",
      error: "Failed to load issues",
      success: "Issue posted successfully!",
      noIssues: "No issues found. Be the first to speak up!",
      reactions: "Reactions",
      agree: "Agree",
      urgent: "Urgent",
      care: "Care",
      angry: "Angry",
      comments: "comments",
      postedBy: "Posted by",
      anonymous: "Anonymous Citizen",
      trending: "Trending",
      filterByCategory: "Filter by category",
      searchConstituency: "Search by constituency...",
    },

    common: {
      loading: "Loading...",
      error: "An error occurred",
      retry: "Retry",
      noData: "No data available",
      viewAll: "View All",
      close: "Close",
      submit: "Submit",
      cancel: "Cancel",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      export: "Export",
      share: "Share",
    },
  },

  te: {
    searchPlaceholder: "MLA లేదా నియోజకవర్గం వెతకండి...",
    liveStatus: "175 MLAలు • లైవ్",
    notifications: "నోటిఫికేషన్లు",

    nav: {
      dashboard: "డాష్‌బోర్డ్",
      mlaDirectory: "MLA డైరెక్టరీ",
      rankings: "ర్యాంకింగ్‌లు",
      promises: "హామీలు",
      budgetTracking: "బడ్జెట్ ట్రాకింగ్",
      projectsMap: "ప్రాజెక్టుల మ్యాప్",
      newsUpdates: "వార్తలు & అప్‌డేట్‌లు",
      citizenReports: "పౌర నివేదికలు",
      compareAreas: "ప్రాంతాలు పోల్చండి",
      speakUp: "మాట్లాడండి",
    },

    allMlasLoaded: "✓ అందరు 175 MLAలు లోడ్ అయ్యారు",
    districts: "13 జిల్లాలు",
    parties: "4 పార్టీలు",
    assemblyLabel: "ఆంధ్రప్రదేశ్ అసెంబ్లీ",
    legislativeAssembly: "16వ శాసనసభ",

    dashboard: {
      title: "AP సివిక్ ట్రాకర్",
      subtitle: "ఆంధ్రప్రదేశ్ శాసనసభ • రియల్-టైమ్ జవాబుదారీ డాష్‌బోర్డ్",
      totalMLAs: "మొత్తం MLAలు",
      topRated: "అత్యుత్తమ MLAలు",
      promisesFulfilled: "నెరవేరిన హామీలు",
      pendingPromises: "పెండింగ్ హామీలు",
      activeProjects: "క్రియాశీల ప్రాజెక్టులు",
      totalBudget: "మొత్తం బడ్జెట్",
      partyWiseSplit: "పార్టీ వారీగా MLA విభజన",
      performanceOverview: "పనితీరు అవలోకనం",
      recentNews: "తాజా వార్తలు",
      viewAll: "అన్నీ చూడండి",
      loading: "డాష్‌బోర్డ్ లోడ్ అవుతోంది...",
      error: "డాష్‌బోర్డ్ లోడ్ కాలేదు",
      noData: "డేటా అందుబాటులో లేదు",
      mlasByParty: "పార్టీ వారీగా MLAలు",
      avgRating: "సగటు రేటింగ్",
      newsHeadlines: "తాజా వార్తలు",
      topMLAs: "అత్యుత్తమ MLAలు",
      rank: "ర్యాంక్",
      constituency: "నియోజకవర్గం",
      party: "పార్టీ",
      score: "స్కోర్",
      fulfilledLabel: "నెరవేరింది",
      pendingLabel: "పెండింగ్",
      failedLabel: "విఫలమైంది",
    },

    mlaList: {
      title: "MLA డైరెక్టరీ",
      subtitle: "ఆంధ్రప్రదేశ్ శాసనసభ - అందరు 175 సభ్యులు",
      searchPlaceholder: "పేరు లేదా నియోజకవర్గం ద్వారా వెతకండి...",
      filterByParty: "పార్టీ వారీగా ఫిల్టర్",
      filterByDistrict: "జిల్లా వారీగా ఫిల్టర్",
      allParties: "అన్ని పార్టీలు",
      allDistricts: "అన్ని జిల్లాలు",
      showing: "చూపిస్తున్నారు",
      of: "లో",
      mlas: "MLAలు",
      viewProfile: "ప్రొఫైల్ చూడండి",
      constituency: "నియోజకవర్గం",
      district: "జిల్లా",
      party: "పార్టీ",
      noResults: "మీ వెతుకులాటకు MLAలు కనుగొనబడలేదు.",
      loading: "MLAలు లోడ్ అవుతున్నాయి...",
      prevPage: "మునుపటి",
      nextPage: "తదుపరి",
      page: "పేజీ",
    },

    mlaDetail: {
      backToList: "← MLA డైరెక్టరీకి తిరిగి వెళ్ళండి",
      constituency: "నియోజకవర్గం",
      district: "జిల్లా",
      party: "పార్టీ",
      promises: "హామీలు",
      projects: "ప్రాజెక్టులు",
      budget: "బడ్జెట్",
      news: "వార్తలు",
      overallScore: "మొత్తం స్కోర్",
      promiseFulfillment: "హామీ నెరవేర్పు",
      projectCompletion: "ప్రాజెక్ట్ పూర్తి",
      budgetUtilization: "బడ్జెట్ వినియోగం",
      publicSentiment: "ప్రజా అభిప్రాయం",
      loading: "MLA వివరాలు లోడ్ అవుతున్నాయి...",
      error: "MLA వివరాలు లోడ్ కాలేదు",
      fulfilled: "నెరవేరింది",
      pending: "పెండింగ్",
      failed: "విఫలమైంది",
      active: "క్రియాశీలం",
      completed: "పూర్తయింది",
      stalled: "ఆగిపోయింది",
    },

    rankings: {
      title: "MLA ర్యాంకింగ్‌లు",
      subtitle: "అందరు 175 ఆంధ్రప్రదేశ్ MLAల పనితీరు ఆధారిత ర్యాంకింగ్",
      rank: "ర్యాంక్",
      mla: "MLA",
      constituency: "నియోజకవర్గం",
      party: "పార్టీ",
      score: "స్కోర్",
      promiseFulfillment: "హామీ %",
      projectCompletion: "ప్రాజెక్టులు %",
      publicSentiment: "అభిప్రాయం",
      loading: "ర్యాంకింగ్‌లు లోడ్ అవుతున్నాయి...",
      error: "ర్యాంకింగ్‌లు లోడ్ కాలేదు",
    },

    promises: {
      title: "హామీ ట్రాకర్",
      subtitle: "అందరు MLAల ఎన్నికల మేనిఫెస్టో హామీలు ట్రాక్ చేయబడుతున్నాయి",
      fulfilled: "నెరవేరింది",
      pending: "పెండింగ్",
      failed: "విఫలమైంది",
      category: "వర్గం",
      timeline: "టైమ్‌లైన్",
      loading: "హామీలు లోడ్ అవుతున్నాయి...",
      error: "హామీలు లోడ్ కాలేదు",
      allCategories: "అన్ని వర్గాలు",
      allStatus: "అన్ని స్థితులు",
      filterByStatus: "స్థితి వారీగా ఫిల్టర్",
      filterByCategory: "వర్గం వారీగా ఫిల్టర్",
    },

    budget: {
      title: "బడ్జెట్ ట్రాకింగ్",
      subtitle: "నియోజకవర్గ స్థాయి బడ్జెట్ కేటాయింపు మరియు వినియోగం",
      allocated: "కేటాయించబడింది",
      spent: "ఖర్చు చేయబడింది",
      utilization: "వినియోగం",
      department: "విభాగం",
      scheme: "పథకం",
      loading: "బడ్జెట్ డేటా లోడ్ అవుతోంది...",
      error: "బడ్జెట్ డేటా లోడ్ కాలేదు",
    },

    projects: {
      title: "ప్రాజెక్టుల మ్యాప్",
      subtitle: "ఆంధ్రప్రదేశ్ అంతటా నియోజకవర్గ అభివృద్ధి ప్రాజెక్టులు",
      active: "క్రియాశీలం",
      completed: "పూర్తయింది",
      stalled: "ఆగిపోయింది",
      loading: "ప్రాజెక్టులు లోడ్ అవుతున్నాయి...",
      error: "ప్రాజెక్టులు లోడ్ కాలేదు",
      constituency: "నియోజకవర్గం",
      status: "స్థితి",
      budget: "బడ్జెట్",
    },

    news: {
      title: "వార్తలు & అప్‌డేట్‌లు",
      subtitle: "AI-ఆధారిత సెంటిమెంట్ విశ్లేషణతో తాజా వార్తలు",
      positive: "సానుకూలం",
      negative: "ప్రతికూలం",
      neutral: "తటస్థం",
      source: "మూలం",
      sentiment: "సెంటిమెంట్",
      loading: "వార్తలు లోడ్ అవుతున్నాయి...",
      error: "వార్తలు లోడ్ కాలేదు",
    },

    reports: {
      title: "పౌర నివేదికలు",
      subtitle: "మీ నియోజకవర్గంలో పౌర సమస్యలను సమర్పించండి మరియు ట్రాక్ చేయండి",
      submit: "నివేదిక సమర్పించండి",
      yourName: "మీ పేరు",
      constituency: "నియోజకవర్గం",
      category: "వర్గం",
      description: "వివరణ",
      loading: "నివేదిక సమర్పిస్తోంది...",
      success: "నివేదిక విజయవంతంగా సమర్పించబడింది!",
      error: "నివేదిక సమర్పించడం విఫలమైంది",
    },

    compare: {
      title: "మీ ప్రాంతాన్ని పోల్చండి",
      subtitle: "రెండు నియోజకవర్గాల పనితీరు పోల్పు",
      selectA: "నియోజకవర్గం A ఎంచుకోండి",
      selectB: "నియోజకవర్గం B ఎంచుకోండి",
      vsLabel: "వర్సెస్",
      winner: "విజేత",
      tied: "సమానం!",
      score: "మొత్తం స్కోర్",
      projects: "మొత్తం ప్రాజెక్టులు",
      completed: "పూర్తయింది",
      budget: "బడ్జెట్ వినియోగం",
      sentiment: "అభిప్రాయం",
      loading: "పోల్పు లోడ్ అవుతోంది...",
      error: "పోల్పు లోడ్ కాలేదు",
      pickBoth: "పోల్చడానికి రెండు నియోజకవర్గాలను ఎంచుకోండి",
      trending: "🔥 ట్రెండింగ్ పోల్పులు",
      metrics: "ముఖ్య గణాంకాలు",
      winnerIs: "ముందుంది!",
    },

    speakUp: {
      title: "మాట్లాడండి",
      subtitle: "ప్రజల వాణి — సమస్యలు లేవనెత్తండి, ఓటు వేయండి",
      hot: "🔥 హాట్",
      recent: "🕐 తాజా",
      topVoted: "⬆️ అత్యధిక ఓట్లు",
      postIssue: "సమస్య పోస్ట్ చేయండి",
      issueTitle: "సమస్య శీర్షిక",
      issueDesc: "సమస్యను వివరించండి",
      yourName: "మీ పేరు (ఐచ్ఛికం)",
      constituency: "నియోజకవర్గం",
      category: "వర్గం",
      submit: "సమస్య పోస్ట్ చేయండి",
      cancel: "రద్దు చేయండి",
      upvote: "అప్‌వోట్",
      comment: "వ్యాఖ్య",
      addComment: "వ్యాఖ్య జోడించండి",
      commentPlaceholder: "మీ అభిప్రాయం పంచుకోండి...",
      allCategories: "అన్ని వర్గాలు",
      loading: "సమస్యలు లోడ్ అవుతున్నాయి...",
      error: "సమస్యలు లోడ్ కాలేదు",
      success: "సమస్య విజయవంతంగా పోస్ట్ చేయబడింది!",
      noIssues: "సమస్యలు కనుగొనబడలేదు.",
      reactions: "రియాక్షన్లు",
      agree: "అంగీకారం",
      urgent: "అత్యవసరం",
      care: "శ్రద్ధ",
      angry: "కోపం",
      comments: "వ్యాఖ్యలు",
      postedBy: "పోస్ట్ చేసినవారు",
      anonymous: "అజ్ఞాత పౌరుడు",
      trending: "ట్రెండింగ్",
      filterByCategory: "వర్గం వారీగా ఫిల్టర్",
      searchConstituency: "నియోజకవర్గం వెతకండి...",
    },

    common: {
      loading: "లోడ్ అవుతోంది...",
      error: "లోపం సంభవించింది",
      retry: "మళ్ళీ ప్రయత్నించండి",
      noData: "డేటా అందుబాటులో లేదు",
      viewAll: "అన్నీ చూడండి",
      close: "మూసివేయి",
      submit: "సమర్పించండి",
      cancel: "రద్దు చేయండి",
      search: "వెతకండి",
      filter: "ఫిల్టర్",
      sort: "క్రమబద్ధీకరించు",
      export: "ఎగుమతి",
      share: "షేర్ చేయండి",
    },
  },

  hi: {
    searchPlaceholder: "MLA या निर्वाचन क्षेत्र खोजें...",
    liveStatus: "175 विधायक • लाइव",
    notifications: "सूचनाएं",

    nav: {
      dashboard: "डैशबोर्ड",
      mlaDirectory: "विधायक निर्देशिका",
      rankings: "रैंकिंग",
      promises: "वादे",
      budgetTracking: "बजट ट्रैकिंग",
      projectsMap: "परियोजना मानचित्र",
      newsUpdates: "समाचार और अपडेट",
      citizenReports: "नागरिक रिपोर्ट",
      compareAreas: "क्षेत्र तुलना",
      speakUp: "बोलो",
    },

    allMlasLoaded: "✓ सभी 175 विधायक लोड हुए",
    districts: "13 जिले",
    parties: "4 पार्टियां",
    assemblyLabel: "आंध्र प्रदेश विधानसभा",
    legislativeAssembly: "16वीं विधान सभा",

    dashboard: {
      title: "AP सिविक ट्रैकर",
      subtitle: "आंध्र प्रदेश विधान सभा • रियल-टाइम जवाबदेही डैशबोर्ड",
      totalMLAs: "कुल विधायक",
      topRated: "शीर्ष विधायक",
      promisesFulfilled: "पूरे किए गए वादे",
      pendingPromises: "लंबित वादे",
      activeProjects: "सक्रिय परियोजनाएं",
      totalBudget: "कुल बजट",
      partyWiseSplit: "पार्टी-वार विधायक विभाजन",
      performanceOverview: "प्रदर्शन अवलोकन",
      recentNews: "हालिया समाचार",
      viewAll: "सभी देखें",
      loading: "डैशबोर्ड लोड हो रहा है...",
      error: "डैशबोर्ड लोड नहीं हो सका",
      noData: "कोई डेटा उपलब्ध नहीं",
      mlasByParty: "पार्टी के अनुसार विधायक",
      avgRating: "औसत रेटिंग",
      newsHeadlines: "ताज़ा समाचार",
      topMLAs: "शीर्ष प्रदर्शन करने वाले विधायक",
      rank: "रैंक",
      constituency: "निर्वाचन क्षेत्र",
      party: "पार्टी",
      score: "स्कोर",
      fulfilledLabel: "पूरा हुआ",
      pendingLabel: "लंबित",
      failedLabel: "विफल",
    },

    mlaList: {
      title: "विधायक निर्देशिका",
      subtitle: "आंध्र प्रदेश विधान सभा के सभी 175 सदस्य",
      searchPlaceholder: "नाम या निर्वाचन क्षेत्र से खोजें...",
      filterByParty: "पार्टी से फ़िल्टर करें",
      filterByDistrict: "जिले से फ़िल्टर करें",
      allParties: "सभी पार्टियां",
      allDistricts: "सभी जिले",
      showing: "दिखा रहे हैं",
      of: "में से",
      mlas: "विधायक",
      viewProfile: "प्रोफ़ाइल देखें",
      constituency: "निर्वाचन क्षेत्र",
      district: "जिला",
      party: "पार्टी",
      noResults: "आपकी खोज से कोई विधायक नहीं मिला।",
      loading: "विधायक लोड हो रहे हैं...",
      prevPage: "पिछला",
      nextPage: "अगला",
      page: "पृष्ठ",
    },

    mlaDetail: {
      backToList: "← विधायक निर्देशिका पर वापस जाएं",
      constituency: "निर्वाचन क्षेत्र",
      district: "जिला",
      party: "पार्टी",
      promises: "वादे",
      projects: "परियोजनाएं",
      budget: "बजट",
      news: "समाचार",
      overallScore: "कुल स्कोर",
      promiseFulfillment: "वादा पूर्ति",
      projectCompletion: "परियोजना पूर्णता",
      budgetUtilization: "बजट उपयोग",
      publicSentiment: "जनभावना",
      loading: "विधायक विवरण लोड हो रहा है...",
      error: "विधायक विवरण लोड नहीं हो सका",
      fulfilled: "पूरा हुआ",
      pending: "लंबित",
      failed: "विफल",
      active: "सक्रिय",
      completed: "पूर्ण",
      stalled: "रुका हुआ",
    },

    rankings: {
      title: "विधायक रैंकिंग",
      subtitle: "सभी 175 आंध्र प्रदेश विधायकों की प्रदर्शन-आधारित रैंकिंग",
      rank: "रैंक",
      mla: "विधायक",
      constituency: "निर्वाचन क्षेत्र",
      party: "पार्टी",
      score: "स्कोर",
      promiseFulfillment: "वादा %",
      projectCompletion: "परियोजना %",
      publicSentiment: "भावना",
      loading: "रैंकिंग लोड हो रही है...",
      error: "रैंकिंग लोड नहीं हो सकी",
    },

    promises: {
      title: "वादा ट्रैकर",
      subtitle: "सभी विधायकों के चुनावी घोषणापत्र वादों की ट्रैकिंग",
      fulfilled: "पूरा हुआ",
      pending: "लंबित",
      failed: "विफल",
      category: "श्रेणी",
      timeline: "समयरेखा",
      loading: "वादे लोड हो रहे हैं...",
      error: "वादे लोड नहीं हो सके",
      allCategories: "सभी श्रेणियां",
      allStatus: "सभी स्थिति",
      filterByStatus: "स्थिति से फ़िल्टर करें",
      filterByCategory: "श्रेणी से फ़िल्टर करें",
    },

    budget: {
      title: "बजट ट्रैकिंग",
      subtitle: "निर्वाचन क्षेत्र स्तर पर बजट आवंटन और उपयोग",
      allocated: "आवंटित",
      spent: "खर्च",
      utilization: "उपयोग",
      department: "विभाग",
      scheme: "योजना",
      loading: "बजट डेटा लोड हो रहा है...",
      error: "बजट डेटा लोड नहीं हो सका",
    },

    projects: {
      title: "परियोजना मानचित्र",
      subtitle: "आंध्र प्रदेश में निर्वाचन क्षेत्र विकास परियोजनाएं",
      active: "सक्रिय",
      completed: "पूर्ण",
      stalled: "रुकी हुई",
      loading: "परियोजनाएं लोड हो रही हैं...",
      error: "परियोजनाएं लोड नहीं हो सकीं",
      constituency: "निर्वाचन क्षेत्र",
      status: "स्थिति",
      budget: "बजट",
    },

    news: {
      title: "समाचार और अपडेट",
      subtitle: "AI-संचालित भावना विश्लेषण के साथ ताज़ा समाचार",
      positive: "सकारात्मक",
      negative: "नकारात्मक",
      neutral: "तटस्थ",
      source: "स्रोत",
      sentiment: "भावना",
      loading: "समाचार लोड हो रहे हैं...",
      error: "समाचार लोड नहीं हो सके",
    },

    reports: {
      title: "नागरिक रिपोर्ट",
      subtitle: "अपने निर्वाचन क्षेत्र में नागरिक समस्याएं दर्ज करें और ट्रैक करें",
      submit: "रिपोर्ट जमा करें",
      yourName: "आपका नाम",
      constituency: "निर्वाचन क्षेत्र",
      category: "श्रेणी",
      description: "विवरण",
      loading: "रिपोर्ट जमा हो रही है...",
      success: "रिपोर्ट सफलतापूर्वक जमा हो गई!",
      error: "रिपोर्ट जमा नहीं हो सकी",
    },

    compare: {
      title: "अपने क्षेत्र की तुलना करें",
      subtitle: "दो निर्वाचन क्षेत्रों के प्रदर्शन की तुलना करें",
      selectA: "निर्वाचन क्षेत्र A चुनें",
      selectB: "निर्वाचन क्षेत्र B चुनें",
      vsLabel: "बनाम",
      winner: "विजेता",
      tied: "बराबरी!",
      score: "कुल स्कोर",
      projects: "कुल परियोजनाएं",
      completed: "पूर्ण",
      budget: "बजट उपयोग",
      sentiment: "भावना",
      loading: "तुलना लोड हो रही है...",
      error: "तुलना लोड नहीं हो सकी",
      pickBoth: "तुलना के लिए दोनों निर्वाचन क्षेत्र चुनें",
      trending: "🔥 ट्रेंडिंग तुलना",
      metrics: "मुख्य मेट्रिक्स",
      winnerIs: "आगे है!",
    },

    speakUp: {
      title: "बोलो",
      subtitle: "जनता की आवाज़ — समस्याएं उठाएं, वोट करें, जवाबदेही मांगें",
      hot: "🔥 गर्म",
      recent: "🕐 हालिया",
      topVoted: "⬆️ सर्वाधिक वोट",
      postIssue: "समस्या पोस्ट करें",
      issueTitle: "समस्या का शीर्षक",
      issueDesc: "समस्या का विवरण",
      yourName: "आपका नाम (वैकल्पिक)",
      constituency: "निर्वाचन क्षेत्र",
      category: "श्रेणी",
      submit: "समस्या पोस्ट करें",
      cancel: "रद्द करें",
      upvote: "अपवोट",
      comment: "टिप्पणी",
      addComment: "टिप्पणी जोड़ें",
      commentPlaceholder: "अपने विचार साझा करें...",
      allCategories: "सभी श्रेणियां",
      loading: "समस्याएं लोड हो रही हैं...",
      error: "समस्याएं लोड नहीं हो सकीं",
      success: "समस्या सफलतापूर्वक पोस्ट हो गई!",
      noIssues: "कोई समस्या नहीं मिली।",
      reactions: "प्रतिक्रियाएं",
      agree: "सहमत",
      urgent: "अत्यावश्यक",
      care: "परवाह",
      angry: "क्रोधित",
      comments: "टिप्पणियां",
      postedBy: "पोस्ट किया गया",
      anonymous: "अज्ञात नागरिक",
      trending: "ट्रेंडिंग",
      filterByCategory: "श्रेणी से फ़िल्टर करें",
      searchConstituency: "निर्वाचन क्षेत्र खोजें...",
    },

    common: {
      loading: "लोड हो रहा है...",
      error: "एक त्रुटि हुई",
      retry: "पुनः प्रयास करें",
      noData: "कोई डेटा उपलब्ध नहीं",
      viewAll: "सभी देखें",
      close: "बंद करें",
      submit: "जमा करें",
      cancel: "रद्द करें",
      search: "खोजें",
      filter: "फ़िल्टर",
      sort: "क्रमबद्ध करें",
      export: "निर्यात",
      share: "साझा करें",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("ap-civic-lang");
    return (saved as Language) || "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("ap-civic-lang", lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}