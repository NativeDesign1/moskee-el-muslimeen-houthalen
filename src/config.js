// Eenvoudige configuratie voor de moskee website
export const MOSQUE = {
  name: "Islamitische Moskee Houthalen",
  city: "Houthalen",
  country: "Belgium",
  latitude: 51.018, // Houthalen-Helchteren approx
  longitude: 5.374,
};

// Stripe Payment Link(s). Vervang de URL's door jouw echte Payment Link(s).
export const DONATION_LINKS = {
  EUR5: "",   // bv. "https://buy.stripe.com/test_123..."
  EUR10: "",
  EUR20: "",
  CUSTOM_BASE: "", // optioneel: Payment Link met variabel bedrag
};

// Supabase configuratie
// Vervang deze waarden met jouw eigen Supabase project credentials
// Te vinden in: Supabase Dashboard > Project Settings > API
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key-here"
};
