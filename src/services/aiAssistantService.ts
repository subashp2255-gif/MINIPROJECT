import type { Booking, Facility, DryProduct, UserProfile } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  textTa?: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  actionLabelTa?: string;
}

export interface AssistantContext {
  user: UserProfile;
  bookings: Booking[];
  facilities: Facility[];
  dryProducts: DryProduct[];
  language: 'en' | 'ta';
}

const OPENROUTER_API_KEY =
  import.meta.env.VITE_OPENROUTER_API_KEY || '';

const OPENROUTER_MODEL =
  import.meta.env.VITE_OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

/**
 * Fallback intent matcher for offline or degraded network scenarios.
 */
function getOfflineFallbackResponse(query: string, context: AssistantContext): {
  text: string;
  actionUrl?: string;
  actionLabel?: string;
} {
  const q = query.toLowerCase().trim();
  const isTa = context.language === 'ta' || /[\u0B80-\u0BFF]/.test(query);

  // 1. Check bookings status
  if (
    q.includes('booking') ||
    q.includes('status') ||
    q.includes('முன்பதிவு') ||
    q.includes('நிலை') ||
    q.includes('என் பதிவு')
  ) {
    if (context.bookings.length === 0) {
      return {
        text: isTa
          ? 'தங்களிடம் தற்போது செயலில் உள்ள குளிர்பதன முன்பதிவுகள் ஏதுமில்லை. புதிய சேமிப்பு இடத்தை நீங்கள் எளிதாக முன்பதிவு செய்யலாம்.'
          : 'You currently have no active cold storage bookings. You can book cold storage space easily in our discovery section.',
        actionUrl: '/discovery',
        actionLabel: isTa ? 'கிடங்குகளைத் தேட' : 'Find Cold Storage',
      };
    }
    const latest = context.bookings[0];
    const kg = latest.bookedKg;
    const cost = latest.totalEstimatedCost;
    return {
      text: isTa
        ? `உங்களின் அண்மைய முன்பதிவு #${latest.bookingCode} (${latest.cropName}, ${kg} கிலோ): நிலை "${latest.status.toUpperCase()}". தொடக்க நாள்: ${latest.startDate}. கட்டணம்: ₹${cost}.`
        : `Your latest booking #${latest.bookingCode} for ${latest.cropName} (${kg} kg) is currently "${latest.status.toUpperCase()}". Start date: ${latest.startDate}. Est cost: ₹${cost}.`,
      actionUrl: '/farmer/bookings',
      actionLabel: isTa ? 'முன்பதிவுகளைப் பார்க்க' : 'View My Bookings',
    };
  }

  // 2. Check dry inventory
  if (
    q.includes('inventory') ||
    q.includes('stock') ||
    q.includes('தானியம்') ||
    q.includes('இருப்பு') ||
    q.includes('கையிருப்பு')
  ) {
    if (context.dryProducts.length === 0) {
      return {
        text: isTa
          ? 'தங்களுடைய உலர் தானியக் கிடங்கில் இன்னும் பயிர்கள் சேர்க்கப்படவில்லை. புதிய நெல் அல்லது தானியங்களை பதிவு செய்யலாம்.'
          : 'No dry goods registered in your inventory yet. You can add harvest lots like paddy, pulses or millets.',
        actionUrl: '/farmer/dry-inventory',
        actionLabel: isTa ? 'தானிய இருப்புக்குச் செல்க' : 'Open Dry Inventory',
      };
    }
    const lowStockItems = context.dryProducts.filter((p) => p.quantity <= p.lowStockThreshold);
    const summaryList = context.dryProducts
      .slice(0, 3)
      .map((p) => `${p.name}: ${p.quantity} ${p.unit}`)
      .join(', ');

    if (lowStockItems.length > 0) {
      const lowNames = lowStockItems.map((p) => p.name).join(', ');
      return {
        text: isTa
          ? `கையிருப்பு விபரம்: ${summaryList}. எச்சரிக்கை: ${lowNames} பாதுகாப்பு வரம்பை விட குறைவாக உள்ளது!`
          : `Stock Summary: ${summaryList}. Warning: ${lowNames} is below safety threshold!`,
        actionUrl: '/farmer/dry-inventory',
        actionLabel: isTa ? 'கையிருப்பை நிர்வகிக்க' : 'Manage Inventory',
      };
    }

    return {
      text: isTa
        ? `தங்களின் தானியக் கையிருப்பு: ${summaryList}. அனைத்து பயிர்களும் போதுமான அளவில் உள்ளன.`
        : `Your current dry stock: ${summaryList}. All stock levels are within safe limits.`,
      actionUrl: '/farmer/dry-inventory',
      actionLabel: isTa ? 'முழு விபரம் பார்க்க' : 'View Full Inventory',
    };
  }

  // 3. Storage pricing & facilities
  if (
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('facility') ||
    q.includes('storage') ||
    q.includes('விலை') ||
    q.includes('வாடகை') ||
    q.includes('கிடங்கு')
  ) {
    const facSummary = context.facilities
      .slice(0, 2)
      .map((f) => `${f.name} (₹${f.pricePerKgDay}/kg/day, ${f.district})`)
      .join('; ');
    return {
      text: isTa
        ? `தமிழ்நாடு கிடங்குகள் விபரம்: ${facSummary}. பயிர்களைப் பாதுகாப்பாக வைக்க முன்கூட்டியே பதிவு செய்யவும்.`
        : `Available Facilities: ${facSummary}. Pricing is charged per kg per day with live temperature monitoring.`,
      actionUrl: '/discovery',
      actionLabel: isTa ? 'கிடங்குகளைப் பார்க்க' : 'Browse Facilities',
    };
  }

  // 4. Crop temperature guidelines
  if (
    q.includes('temperature') ||
    q.includes('temp') ||
    q.includes('வெப்பநிலை') ||
    q.includes('தக்காளி') ||
    q.includes('tomato') ||
    q.includes('potato') ||
    q.includes('உருளை')
  ) {
    return {
      text: isTa
        ? 'பயிர் சேமிப்பு வழிகாட்டுதல்: தக்காளி 10°C முதல் 12°C (ஈரப்பதம் 85-90%, 21 நாட்கள்). உருளைக்கிழங்கு 3°C முதல் 4°C. வாழை 13°C-14°C. நெல் உலர் ஈரப்பதம் 14% குறைவாக இருக்க வேண்டும்.'
        : 'Cold Chain Guidelines: Tomatoes need 10°C-12°C (85-90% RH, 21 days shelf-life). Potatoes need 3°C-4°C. Bananas require 13°C-14°C (chilling injury below 12°C). Paddy moisture must remain below 14%.',
      actionUrl: '/discovery',
      actionLabel: isTa ? 'குளிர்பதன கிடங்கு தேட' : 'Find Cold Storage',
    };
  }

  // 5. Pickup / Withdrawal
  if (
    q.includes('pickup') ||
    q.includes('withdraw') ||
    q.includes('திரும்ப') ||
    q.includes('எடுக்க') ||
    q.includes('ரசீது')
  ) {
    return {
      text: isTa
        ? 'பயிர்களைத் திரும்பப் பெற: உங்களின் இருப்புப் பக்கத்தில் "பயிர் மீட்புக் கோரிக்கை" (Pickup Request) சமர்ப்பிக்கலாம். கிடங்கு உரிமையாளர் சரிபார்த்த பின் எடுத்துச் செல்லலாம்.'
        : 'To withdraw crops: Submit a Pickup Request under your Perishable Batches screen. Once the warehouse operator approves, verify with your batch PIN at the loading bay.',
      actionUrl: '/farmer/inventory',
      actionLabel: isTa ? 'மீட்புக் கோரிக்கை வைக்க' : 'Request Crop Pickup',
    };
  }

  // General default fallback
  return {
    text: isTa
      ? `வணக்கம் ${context.user.name || 'விவசாயி'}! நான் உங்கள் உழவர் உதவியாளர் (Rural Agri Sync AI). குளிர்சாதன முன்பதிவுகள், தானியக் கையிருப்பு, பயிர் சேமிப்பு வெப்பநிலை அல்லது மீட்புக் கோரிக்கைகள் பற்றி என்னிடம் கேட்கலாம்.`
      : `Hello ${context.user.name || 'Farmer'}! I am your Rural Agri Sync Assistant. I can help you check cold storage availability, inspect your dry grain inventory, provide crop temperature guidelines, or manage crop pickups.`,
    actionUrl: '/discovery',
    actionLabel: isTa ? 'சேமிப்பு இடங்களைத் தேட' : 'Search Storage',
  };
}

export const aiAssistantService = {
  /**
   * Generates conversational AI response using OpenRouter LLM, falling back to deterministic local knowledge.
   */
  async sendMessage(
    userMessage: string,
    history: ChatMessage[],
    context: AssistantContext
  ): Promise<ChatMessage> {
    // Build system prompt with private authenticated farmer context
    const bookingsSummary =
      context.bookings.length > 0
        ? context.bookings
            .map(
              (b) =>
                `- Booking #${b.bookingCode}: ${b.cropName}, ${b.bookedKg}kg, Status: ${b.status}, Facility: ${b.facilityName || b.facilityId}, From ${b.startDate} to ${b.endDate}, Cost: ₹${b.totalEstimatedCost}`
            )
            .join('\n')
        : 'No current cold storage bookings.';

    const dryGoodsSummary =
      context.dryProducts.length > 0
        ? context.dryProducts
            .map(
              (p) =>
                `- ${p.name} (${p.category}): ${p.quantity} ${p.unit} in stock (Low threshold: ${p.lowStockThreshold} ${p.unit})`
            )
            .join('\n')
        : 'No dry goods recorded yet.';

    const facilitiesSummary = context.facilities
      .slice(0, 3)
      .map(
        (f) =>
          `- ${f.name} in ${f.location}, ${f.district}: ₹${f.pricePerKgDay}/kg/day`
      )
      .join('\n');

    const systemPrompt = `You are "AgriSync Sahayak", an expert agricultural cold storage and inventory assistant for farmers and warehouse owners in Tamil Nadu, India.
You communicate respectfully, clearly, and concisely in both Tamil and English.

USER CONTEXT:
User Name: ${context.user.name}
Role: ${context.user.role}
Preferred Language: ${context.language === 'ta' ? 'Tamil' : 'English'}

AUTHENTICATED REAL-TIME DATA:
1. Current Cold Storage Bookings:
${bookingsSummary}

2. Current Dry Goods Inventory:
${dryGoodsSummary}

3. Cold Storage Facilities Available:
${facilitiesSummary}

4. Tamil Nadu Cold Storage Rules:
- Tomatoes: 10°C to 12°C, 85-90% humidity, 14-21 days shelf life.
- Potatoes: 3°C to 4°C, 90-95% humidity, 6-9 months shelf life.
- Chillies/Peppers: 7°C to 10°C.
- Paddy / Grains: Dry storage, moisture strictly below 14% to prevent aflatoxin/fungal rot.

CRITICAL INSTRUCTIONS:
- If the user addresses in Tamil or has Tamil language preference, respond primarily in fluent, polite Tamil with English terms in brackets where helpful.
- If in English, respond in simple, clear English.
- Base answers on the user's REAL authenticated data provided above. Never invent bookings or fake stock levels.
- AI is strictly advisory: never claim to have executed a financial transfer or deleted a record without the user doing it on the dashboard.
- Keep answers concise (under 120 words).`;

    // Construct conversation payload for OpenRouter
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4).map((h) => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text,
      })),
      { role: 'user', content: userMessage },
    ];

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ruralagrisync.local',
          'X-Title': 'Rural Agri Sync',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: formattedMessages,
          max_tokens: 280,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('Empty AI completion received');
      }

      // Check if action link should be suggested based on query keywords
      let actionUrl: string | undefined;
      let actionLabel: string | undefined;
      let actionLabelTa: string | undefined;

      const q = userMessage.toLowerCase();
      if (q.includes('book') || q.includes('முன்பதிவு')) {
        actionUrl = '/discovery';
        actionLabel = 'Explore Cold Storage';
        actionLabelTa = 'கிடங்கு முன்பதிவு';
      } else if (q.includes('dry') || q.includes('தானியம்') || q.includes('paddy')) {
        actionUrl = '/farmer/dry-inventory';
        actionLabel = 'Dry Goods Stock';
        actionLabelTa = 'தானியக் கையிருப்பு';
      } else if (q.includes('pickup') || q.includes('மீட்பு')) {
        actionUrl = '/farmer/inventory';
        actionLabel = 'Request Crop Pickup';
        actionLabelTa = 'பயிர் மீட்புக் கோரிக்கை';
      }

      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl,
        actionLabel,
        actionLabelTa,
      };
    } catch (err) {
      console.warn('[AIAssistant] Falling back to intelligent offline intent engine:', err);
      const fallback = getOfflineFallbackResponse(userMessage, context);

      return {
        id: `ai-fallback-${Date.now()}`,
        sender: 'assistant',
        text: fallback.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl: fallback.actionUrl,
        actionLabel: fallback.actionLabel,
        actionLabelTa: fallback.actionLabel,
      };
    }
  },
};
