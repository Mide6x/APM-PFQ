"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitCheckpoint } from "@/app/modules/[slug]/actions";
import type { CheckpointQuestion, CheckpointState } from "@/lib/checkpoint-types";
import styles from "./lesson.module.css";

function CheckpointAttempt({ questions, lessonId, version, slug, attemptId, onRetry }: {
  questions: CheckpointQuestion[]; lessonId: string; version: number; slug: string; attemptId: string; onRetry: () => void;
}) {
  const [state, action, pending] = useActionState(submitCheckpoint, { status: "idle", message: "" } as CheckpointState);
  if (state.status === "graded") return (
    <div className={styles.result}>
      <h3>Your result: {state.score} / {state.total}</h3>
      <p role="status">You scored {state.score} of {state.total}. {state.message} {state.saved ? "This attempt is saved to your account." : "This guest attempt is not saved."}</p>
      {!state.saved && <p><Link href={`/sign-in?next=${encodeURIComponent(`/modules/${slug}#checkpoint`)}`}>Sign in to save future attempts</Link>.</p>}
      <ol className={styles.feedback}>
        {state.feedback.map((item) => {
          const correct = item.selectedOptionId === item.correctOptionId;
          return <li key={item.questionId}>
            <h4>{item.stem}</h4>
            <p className={correct ? styles.correct : styles.incorrect}><strong>{correct ? "Correct" : "Review this answer"}</strong></p>
            <p>Your answer: {item.choices.find((choice) => choice.id === item.selectedOptionId)?.text}</p>
            {!correct && <p><strong>Correct answer:</strong> {item.choices.find((choice) => choice.id === item.correctOptionId)?.text}</p>}
            <p>{item.explanation}</p>
          </li>;
        })}
      </ol>
      <button className={styles.button} type="button" onClick={onRetry}>Try a fresh attempt</button>
    </div>
  );
  return (
    <form action={action} className={styles.quiz}>
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
      <button className={styles.button} disabled={pending} type="submit">{pending ? "Checking answers…" : "Submit checkpoint"}</button>
    </form>
  );
}

export function Checkpoint(props: { questions: CheckpointQuestion[]; lessonId: string; version: number; slug: string; initialAttemptId: string }) {
  const [attemptId, setAttemptId] = useState(props.initialAttemptId);
  return <CheckpointAttempt key={attemptId} {...props} attemptId={attemptId} onRetry={() => { setAttemptId(crypto.randomUUID()); requestAnimationFrame(() => document.querySelector<HTMLInputElement>("#checkpoint input[type=radio]")?.focus()); }} />;
}
