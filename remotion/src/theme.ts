export const NAVY='#0a1630', NAVY2='#10224a', WHITE='#f5f7fb', ACCENT='#e0a526', MUTED='#9fb0cf';
export const SLIDES = {
  services: {kicker:'WHAT WE DO', title:'Austin AI Marketing', items:['Booking & landing pages','Reels & content packages','AI reply bots']},
  booking:  {kicker:'BOOKING PAGES', title:'From $497', items:['Mobile-first, fast','One clear way to book or call','Live in days, not months']},
  reels:    {kicker:'REELS & CONTENT', title:'Content that gets seen', items:['Short-form edits with captions','English & French','Monthly content packages']},
  bots:     {kicker:'AI REPLY BOTS', title:'Nobody left on read', items:['Answers in minutes, 24/7','Captures leads & bookings','Hands the tricky ones to you']},
  examples: {kicker:'EXAMPLES', title:'Things we build', items:['Quote & booking pages','Promo reels','Reply Radar · ClaimKeeper · this call']},
  contact:  {kicker:'GET STARTED', title:'austinaimarketingco.com', items:['Tell us about your business','A real person follows up','Pages from $497']},
} as const;
export type SlideKey = keyof typeof SLIDES;
