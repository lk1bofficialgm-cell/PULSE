export const quotes: string[] = [
  "The only bad workout is the one that didn't happen.",
  "Push yourself, because no one else is going to do it for you.",
  "Sweat is just fat crying.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Success starts with self-discipline.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
  "A one hour workout is 4% of your day. No excuses.",
  "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.",
  "Wake up. Work out. Look hot. Kick ass.",
  "Progress, not perfection.",
  "Fall in love with the process of becoming the best version of yourself.",
  "You don't have to be extreme, just consistent.",
  "Every workout counts, no matter how small.",
  "Small steps every day lead to big results.",
  "Champions train, losers complain.",
  "Your only limit is you.",
  "Make yourself proud today.",
  "Nothing feels as good as being strong feels.",
  "The gym is where you go to work on the only thing you take with you forever, your body.",
  "Excuses don't burn calories.",
  "You are one workout away from a good mood.",
  "Consistency is what transforms average into excellence.",
  "The best project you'll ever work on is you.",
];

export function getTodaysQuote(date: Date = new Date()): string {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((today - start) / 86_400_000);
  return quotes[dayOfYear % quotes.length];
}
