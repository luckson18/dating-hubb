import { UserProfile, SmartOpenerSuggestion, SmartOpenerResponse, SmartOpenerTone } from '../types/dating';

class SmartOpenerService {
  /**
   * Generates smart openers by querying the Gemini API backend endpoint,
   * falling back to local algorithmic contextual synthesis if needed.
   */
  async generateOpeners(
    currentUser: UserProfile,
    targetUser: UserProfile,
    options?: { tone?: SmartOpenerTone; customVibe?: string }
  ): Promise<SmartOpenerResponse> {
    try {
      const response = await fetch('/api/smart-opener', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUser,
          targetUser,
          tone: options?.tone !== 'all' ? options?.tone : undefined,
          customVibe: options?.customVibe,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.openers && Array.isArray(data.openers) && data.openers.length > 0 && !data.fallback) {
          return {
            targetUserId: targetUser.id,
            targetUserName: targetUser.name,
            sharedInterests: data.sharedInterests || [],
            openers: data.openers,
            isAiGenerated: true,
          };
        }
      }
    } catch (err) {
      console.warn('Smart opener API unavailable, using intelligent local engine:', err);
    }

    // Fallback to rich algorithmic generator
    return this.generateAlgorithmicOpeners(currentUser, targetUser, options?.tone);
  }

  /**
   * Local intelligent heuristic generator with personalized profile anchors.
   */
  generateAlgorithmicOpeners(
    currentUser: UserProfile,
    targetUser: UserProfile,
    toneFilter?: SmartOpenerTone
  ): SmartOpenerResponse {
    const firstName = targetUser.name.split(' ')[0];
    const myFirstName = currentUser.name.split(' ')[0];

    // Find shared hobbies
    const myHobbies = currentUser.hobbies || [];
    const theirHobbies = targetUser.hobbies || [];
    const sharedHobbies = myHobbies.filter(h =>
      theirHobbies.some(th => th.toLowerCase() === h.toLowerCase())
    );

    const primaryShared = sharedHobbies[0] || theirHobbies[0] || 'your creative projects';
    const secondaryShared = sharedHobbies[1] || theirHobbies[1] || 'good coffee spots';

    const pet = targetUser.lifestyle?.pets?.[0];
    const city = targetUser.locationCity || 'the city';
    const job = targetUser.jobTitle || 'what you do';
    const badges = targetUser.accessibilityBadges || [];

    const suggestions: SmartOpenerSuggestion[] = [];

    // 1. Shared Interest Opener
    if (sharedHobbies.length > 0) {
      suggestions.push({
        id: `op-shared-${targetUser.id}-1`,
        category: 'shared_interest',
        categoryLabel: 'Mutual Passion',
        tone: 'warm',
        openerText: `Hi ${firstName}! I saw we both love ${primaryShared} — what got you into it, and do you have a favorite local spot or project you're into right now? ✨`,
        whyItWorks: `Anchors on your mutual love for ${primaryShared}, creating instant common ground and an easy question to answer.`,
        highlightedKeywords: [primaryShared, 'Mutual Hobby', 'Personal Project'],
      });
    } else {
      suggestions.push({
        id: `op-interest-${targetUser.id}-1`,
        category: 'shared_interest',
        categoryLabel: 'Curious About Your Hobby',
        tone: 'warm',
        openerText: `Hey ${firstName}! Your passion for ${primaryShared} caught my attention. I've always wanted to learn more about it — what's the most exciting part for you?`,
        whyItWorks: `Shows genuine interest in ${firstName}'s specific hobby (${primaryShared}) and invites them to share their enthusiasm.`,
        highlightedKeywords: [primaryShared, 'Enthusiasm'],
      });
    }

    // 2. Thoughtful Bio / Career / Lifestyle Question
    if (targetUser.bio && targetUser.bio.length > 20) {
      const bioSnippet = targetUser.bio.slice(0, 50).replace(/[.,!]$/, '');
      suggestions.push({
        id: `op-bio-${targetUser.id}-2`,
        category: 'curious_question',
        categoryLabel: 'Thoughtful Bio Hook',
        tone: 'thoughtful',
        openerText: `Hey ${firstName}, love what you wrote about "${bioSnippet}". As a fellow ${currentUser.jobTitle || 'creative'}, how do you usually balance your work with ${secondaryShared}?`,
        whyItWorks: `References specific text from ${firstName}'s profile and connects it respectfully to work-life balance.`,
        highlightedKeywords: ['Bio Detail', secondaryShared, 'Work-Life Harmony'],
      });
    } else {
      suggestions.push({
        id: `op-job-${targetUser.id}-2`,
        category: 'curious_question',
        categoryLabel: 'Career & Craft',
        tone: 'thoughtful',
        openerText: `Hi ${firstName}! Working in ${job} sounds really rewarding. What's the best project or favorite part of your week recently?`,
        whyItWorks: `Directly engages ${firstName} regarding their profession (${job}) with a positive, open-ended angle.`,
        highlightedKeywords: [job, 'Weekly Highlight'],
      });
    }

    // 3. Playful / Warm Icebreaker
    if (pet) {
      suggestions.push({
        id: `op-playful-${targetUser.id}-3`,
        category: 'playful_warm',
        categoryLabel: 'Playful Pet Connection',
        tone: 'witty',
        openerText: `Important first question, ${firstName}: on a scale from 1 to 10, how likely is your ${pet.toLowerCase()} to approve of a fellow ${primaryShared} enthusiast? 🐾`,
        whyItWorks: `A charming, non-invasive opener highlighting their ${pet} and mutual interest in ${primaryShared}.`,
        highlightedKeywords: [pet, primaryShared, 'Playful'],
      });
    } else {
      suggestions.push({
        id: `op-playful-${targetUser.id}-3`,
        category: 'playful_warm',
        categoryLabel: 'Charming Dilemma',
        tone: 'witty',
        openerText: `Hey ${firstName}! Quick debate: if you had a completely free Sunday in ${city} with zero obligations, are we finding a cozy quiet nook, exploring an art space, or hunting down the best pastry in town? 🥐`,
        whyItWorks: `Offers a fun, low-pressure 'choose your own adventure' scenario that reveals date vibes naturally.`,
        highlightedKeywords: [city, 'Free Sunday', 'Vibe Check'],
      });
    }

    // 4. Accessible & Relaxed Meetup Hook
    const badgeNote = badges.includes('Neurodivergent') || badges.includes('Screen Reader User')
      ? 'low-stimulus, relaxed vibe'
      : 'cozy and accessible spot';

    suggestions.push({
      id: `op-activity-${targetUser.id}-4`,
      category: 'accessible_activity',
      categoryLabel: 'Low-Pressure Date Hook',
      tone: 'casual',
      openerText: `Hey ${firstName}! I was just exploring some spots around ${city} and saw a great ${badgeNote} that does amazing tea & ${primaryShared}. Would love to hear your take on the best hidden gems around!`,
      whyItWorks: `Suggests a comfortable, low-anxiety conversation topic around favorite local gems in ${city}.`,
      highlightedKeywords: [city, 'Local Hidden Gems', 'Relaxed Setting'],
    });

    // 5. Lifestyle & Energy Vibe
    if (targetUser.lifestyle?.drinking || targetUser.lifestyle?.diet) {
      const diet = targetUser.lifestyle?.diet ? `${targetUser.lifestyle.diet} food` : 'good eats';
      suggestions.push({
        id: `op-lifestyle-${targetUser.id}-5`,
        category: 'lifestyle_vibe',
        categoryLabel: 'Shared Rhythm',
        tone: 'casual',
        openerText: `Hi ${firstName}! Noticed we have a very similar relaxed lifestyle rhythm. What's your go-to spot in ${city} when you want incredible ${diet} and good conversation?`,
        whyItWorks: `Connects on lifestyle compatibility and casual dining preferences.`,
        highlightedKeywords: [city, diet, 'Lifestyle Match'],
      });
    }

    // Filter by tone if requested
    const filtered = toneFilter && toneFilter !== 'all'
      ? suggestions.filter(s => s.tone === toneFilter)
      : suggestions;

    const finalOpeners = filtered.length > 0 ? filtered : suggestions;

    return {
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      sharedInterests: sharedHobbies.length > 0 ? sharedHobbies : [primaryShared, secondaryShared],
      openers: finalOpeners,
      isAiGenerated: false,
    };
  }
}

export const smartOpenerService = new SmartOpenerService();
