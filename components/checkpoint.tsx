"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { submitCheckpoint } from "@/app/modules/[slug]/actions";
import type { CheckpointQuestion, CheckpointState } from "@/lib/checkpoint-types";
import styles from "./lesson.module.css";

function CheckpointAttempt({ questions, lessonId, version, slug, attemptId, onRetry }: {
  questions: CheckpointQuestion[]; lessonId: string; version: number; slug: string; attemptId: string; onRetry: () => void;
}) {
  const [state, action, pending] = useActionState(submitCheckpoint, { status: "idle", message: "" } as CheckpointState);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (state.status === "graded") resultHeading.current?.focus(); }, [state]);
  if (state.status === "graded") return (
    <div className={`${styles.result} submission-feedback`} data-result={state.score === state.total ? "correct" : "review"}>
      <h3 ref={resultHeading} tabIndex={-1}>{state.score === state.total && <CheckCircle2 className="result-confirmation" size={22} aria-hidden="true" />}Result: {state.score} / {state.total}</h3>
      <p role="status">{state.saved ? "Result saved." : "Guest result. Sign in to save future attempts."}</p>
      {!state.saved && <p><Link href={`/sign-in?next=${encodeURIComponent(`/modules/${slug}#checkpoint`)}`}>Sign in to save future attempts</Link>.</p>}
      <ol className={styles.feedback}>
        {state.feedback.map((item) => {
          const correct = item.selectedOptionId === item.correctOptionId;
          return <li key={item.questionId}>
            <h4>{item.stem}</h4>
            <p className={correct ? styles.correct : styles.incorrect}><strong>{correct ? "Correct" : "Incorrect"}</strong></p>
            <p>Your answer: {item.choices.find((choice) => choice.id === item.selectedOptionId)?.text}</p>
            {!correct && <p><strong>Correct answer:</strong> {item.choices.find((choice) => choice.id === item.correctOptionId)?.text}</p>}
            <p>{item.explanation}</p>
          </li>;
        })}
      </ol>
      <button className={styles.button} type="button" onClick={onRetry}>Retake quiz</button>
    </div>
  );
  return (
    <form action={action} className={styles.quiz} aria-busy={pending}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="version" value={version} />
      <input type="hidden" name="attemptId" value={attemptId} />
      {questions.map((question, index) => <fieldset key={question.id} disabled={pending}>
        <legend>{index + 1}. {question.stem}</legend>
        {question.choices.map((choice) => <label className={styles.choice} key={choice.id}>
          <input type="radio" name={question.id} value={choice.id} required />
          <span>{choice.text}</span>
        </label>)}
      </fieldset>)}
      <p role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
      <button className={styles.button} disabled={pending} aria-busy={pending} type="submit">{pending ? "Submitting…" : "Submit"}</button>
    </form>
  );
}

export function Checkpoint(props: { questions: CheckpointQuestion[]; lessonId: string; version: number; slug: string; initialAttemptId: string; previousResult?: { score: number; total: number } | null }) {
  const [attemptId, setAttemptId] = useState(props.initialAttemptId);
  const [taking, setTaking] = useState(!props.previousResult);
  const container = useRef<HTMLDivElement>(null);
  const retry = () => {
    setAttemptId(crypto.randomUUID());
    setTaking(true);
    requestAnimationFrame(() => container.current?.querySelector<HTMLInputElement>("input[type=radio]")?.focus());
  };
  return <div ref={container}>{!taking && props.previousResult ? <div className={styles.result}>
    <h3>Quiz completed</h3>
    <p>Latest result: <strong>{props.previousResult.score} / {props.previousResult.total} ({Math.round(props.previousResult.score / props.previousResult.total * 100)}%)</strong></p>
    <button className={styles.button} type="button" onClick={retry}>Retake quiz</button>
  </div> : <CheckpointAttempt key={attemptId} {...props} attemptId={attemptId} onRetry={retry} />}</div>;
}
