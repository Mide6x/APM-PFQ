# Interface motion

The existing green study UI uses CSS motion without a new library or dependency:

- Route content fades in for 200 ms. Content starts readable, and navigation has no artificial delay or exit wait.
- Enabled buttons have 140 ms press feedback; native pointer/keyboard cancellation restores them. Hover feedback applies only to fine pointers with hover support.
- Selected answer colours/borders transition for 140 ms.
- Newly submitted results enter over 200 ms with at most 4 px of movement. Correct bank answers and full-mark topic quizzes have a brief 220 ms check confirmation. Mixed/incorrect results use a neutral entrance. Returning saved results do not replay a new-success celebration. This creates no pass/fail threshold.
- Only real pending submissions show the small 800 ms looping control spinner; buttons remain disabled until the request completes. The shared loading indicator fades in without delaying completion.
- Native quiz disclosure keeps its stored state and keyboard behaviour. Arrow rotation is 140 ms; supported browsers progressively animate the content height/opacity over 200 ms. Other browsers open/close normally. Progress-bar transitions show real values rather than counting up from invented zeroes.

`prefers-reduced-motion: reduce` disables animations/transitions. Pending/loading controls retain a static ring and their text. No interaction, response, focus change, save or disclosure state waits for an animation event.

The 320px navigation now wraps with its labels and 44px targets intact. No authentication, grading, prerequisite, result-history or persistence logic was changed.

Sources reviewed: [best-ui](https://github.com/woodhao/best-ui) FOLD/press patterns, [NN/g animation purpose](https://www.nngroup.com/articles/animation-purpose-ux/) and [duration](https://www.nngroup.com/articles/animation-duration/), [Motion accessibility](https://motion.dev/docs/react-accessibility), [MDN details content](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content). These informed original CSS adapted to this repo; no external skill/code was installed or executed.

Validation uses the actual Next.js UI with disposable local accounts/real PostgreSQL, animation-start events, pending-state checks, pointer cancellation, keyboard focus and computed reduced-motion styles. Physical Safari/iPad and unsupported-browser fallback require manual testing.
