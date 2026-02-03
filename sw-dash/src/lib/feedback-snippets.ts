export interface Snippet {
  id: string
  label: string
  text: string
}

// Approval snippets - prompts that require personalization
export const APPROVAL_SNIPPETS: Snippet[] = [
  {
    id: 'loved',
    label: 'What I loved',
    text: "What I loved: ",
  },
  {
    id: 'stood-out',
    label: 'Stood out',
    text: "What stood out: ",
  },
  {
    id: 'impressed',
    label: 'Impressed by',
    text: "I was impressed by ",
  },
  {
    id: 'creative',
    label: 'Creative',
    text: "Creative approach to ",
  },
  {
    id: 'polished',
    label: 'Polished',
    text: "Really polished - especially ",
  },
  {
    id: 'keep-shipping',
    label: 'Keep shipping',
    text: "Keep shipping!",
  },
]

// Rejection snippets - prompts that require details
export const REJECTION_SNIPPETS: Snippet[] = [
  {
    id: 'tried',
    label: 'What I tried',
    text: "What I tried: ",
  },
  {
    id: 'couldnt-verify',
    label: "Couldn't verify",
    text: "I couldn't verify the project because ",
  },
  {
    id: 'demo-issue',
    label: 'Demo issue',
    text: "Demo issue: ",
  },
  {
    id: 'missing',
    label: 'Missing',
    text: "What's missing: ",
  },
  {
    id: 'close',
    label: "You're close",
    text: "You're close! Once you fix this, resubmit and we'll take another look.",
  },
  {
    id: 'resubmit',
    label: 'Resubmit invite',
    text: "Fix these and resubmit - looking forward to seeing v2!",
  },
]

export const FEEDBACK_CHECKLIST = {
  approve: [
    'Mention something specific you liked about THIS project',
    'Reference something you actually saw (demo, code, feature)',
  ],
  reject: [
    'Mention what you tried/looked at (shows you checked)',
    'State the main blocker clearly',
    'Add 2+ actionable next steps below',
    'Invite them to resubmit',
  ],
}

// Default next steps for rejections
export const DEFAULT_NEXT_STEPS = [
  '',
  '',
]

export const SUGGESTED_NEXT_STEPS = [
  'Add a working demo link (public URL or video)',
  'Update README with: what it does, how to run it',
  'Make sure demo loads in incognito/fresh browser',
  'Add more original features beyond the tutorial',
  'Explain what you learned and built yourself',
  'Record a short walkthrough video showing it working',
]
