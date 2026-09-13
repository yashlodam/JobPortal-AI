import React, { useState, useEffect } from "react";
import TalentCard from "./TalentCard";
import { searchTalent } from "../../api/talentApi";

function RecommendTalent({ currentId }) {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const res = await searchTalent({ page: 0, size: 5 });
        const list = res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && isMounted) {
          const filtered = list.filter((t) => String(t.id) !== String(currentId));
          setRecommended(filtered.slice(0, 3));
        }
      } catch (err) {
        if (isMounted) setRecommended([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadRecommendations();
    return () => { isMounted = false; };
  }, [currentId]);

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="text-[15px] font-black font-satoshi text-heading mb-4">
          Recommended Talent
        </h3>
        <div className="p-4 text-xs text-muted font-satoshi border border-border rounded-xl bg-surface">
          Loading candidate suggestions…
        </div>
      </div>
    );
  }

  if (recommended.length === 0) {
    return null; // Hide recommendations column if no other candidate profiles exist
  }

  return (
    <div className="w-full">
      <h3 className="text-[15px] font-black font-satoshi text-heading mb-4">
        Recommended Talent
      </h3>
      <div className="flex flex-col gap-4">
        {recommended.map((talentItem, idx) => (
          <TalentCard key={talentItem.id || idx} talent={talentItem} />
        ))}
      </div>
    </div>
  );
}

export default RecommendTalent;