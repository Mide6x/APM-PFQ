"use client";

import { useEffect, useState } from "react";
import { saveStudyPlace } from "@/app/modules/[slug]/actions";

export function StudyPlace({ slug }: { slug: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    saveStudyPlace(slug).then(saved => { if (active) setFailed(!saved); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [slug]);
  return failed ? <p role="status">Study position could not be saved. <button type="button" onClick={async () => setFailed(!await saveStudyPlace(slug).catch(() => false))}>Retry</button></p> : null;
}
