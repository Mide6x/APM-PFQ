"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { submitQuestion } from "@/app/questions/[id]/actions";
import type { PracticeQuestion, QuestionState } from "@/lib/question-types";
import styles from "./questions.module.css";

function Attempt({ question, attemptId, retry }: { question: PracticeQuestion; attemptId: string; retry: () => void }) {
  const [state, action, pending] = useActionState(submitQuestion, { status: "idle", message: "" } as QuestionState);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (state.status === "graded") resultHeading.current?.focus(); }, [state]);

  if (state.status === "graded") return <div className={styles.feedback}>
    <h2 ref={resultHeading} tabIndex={-1}>{state.correct ? "Correct" : "Let’s review this answer"}</h2>
    <p role="status" className={state.correct ? styles.correct : styles.review}>{state.correct && <CheckCircle2 size={18} aria-hidden="true" />}{state.message}</p>
    <p><strong>{question.stem}</strong></p>
    <p><strong>Your answer:</strong> {question.choices.find(choice => choice.id === state.selectedOptionId)?.text}</p>
    {!state.correct && <p><strong>Correct answer:</strong> {question.choices.find(choice => choice.id === state.correctOptionId)?.text}</p>}
    <p>{state.explanation}</p>
    <p className={styles.muted}>This attempt is saved to your account. A retry creates another attempt and keeps your history.</p>
    <button type="button" className={styles.button} onClick={retry}><RotateCcw size={17} aria-hidden="true" />Try again</button>
  </div>;

  return <form action={action} className={styles.attempt} aria-busy={pending}>
    <input type="hidden" name="questionId" value={question.id} />
    <input type="hidden" name="version" value={question.version} />
    <input type="hidden" name="attemptId" value={attemptId} />
    <fieldset disabled={pending}>
      <legend>{question.stem}</legend>
      {question.choices.map(choice => <label className={styles.choice} key={choice.id}>
        <input type="radio" name="optionId" value={choice.id} required />
        <span>{choice.text}</span>
      </label>)}
    </fieldset>
    {state.status === "error" && <p role="alert" className={styles.review}>{state.message}</p>}
    <button className={styles.button} type="submit" disabled={pending}>{pending ? "Checking your answer…" : "Submit answer"}</button>
  </form>;
}

export function QuestionAttempt({ question, initialAttemptId }: { question: PracticeQuestion; initialAttemptId: string }) {
  const [attemptId, setAttemptId] = useState(initialAttemptId);
  const container = useRef<HTMLDivElement>(null);
  const retry = () => {
    setAttemptId(crypto.randomUUID());
    requestAnimationFrame(() => container.current?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus());
  };
  return <div ref={container}><Attempt question={question} attemptId={attemptId} retry={retry} key={attemptId} /></div>;
}
