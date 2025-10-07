import { useEffect, useMemo, useState } from "react";
import { MOSQUE } from "../config";

// Aladhan API docs: https://aladhan.com/prayer-times-api
const METHODS = [
  { id: 3, name: "MWL (Muslim World League)" },
  { id: 2, name: "ISNA" },
  { id: 5, name: "Umm Al-Qura" },
  { id: 12, name: "UOIF (France)" },
  { id: 99, name: "Custom/Other (Aladhan default)" },
];

export function usePrayerTimes() {
  const [method, setMethod] = useState(3); // MWL default
  const [madhhab, setMadhhab] = useState(0); // 0=Shafi, 1=Hanafi
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimes = async () => {
      setLoading(true); setError(null);
      try {
        const params = new URLSearchParams({
          latitude: String(MOSQUE.latitude),
          longitude: String(MOSQUE.longitude),
          method: String(method),
          school: String(madhhab),
        });
        const url = `https://api.aladhan.com/v1/timings?${params.toString()}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.code !== 200) throw new Error(json.status || "API-fout");
        setData(json.data);
      } catch (e) {
        setError(e.message || "Onbekende fout");
      } finally {
        setLoading(false);
      }
    };
    fetchTimes();
  }, [method, madhhab]);

  const rows = useMemo(() => {
    if (!data) return [];
    const t = data.timings;
    const map = [
      { name: "Fajr", time: t.Fajr },
      { name: "Shuruq", time: t.Sunrise },
      { name: "Dhuhr", time: t.Dhuhr },
      { name: "Asr", time: t.Asr },
      { name: "Maghrib", time: t.Maghrib },
      { name: "Isha", time: t.Isha },
    ];
    return map;
  }, [data]);

  return {
    method, setMethod, madhhab, setMadhhab,
    rows, loading, error, meta: data?.date,
    METHODS
  };
}
