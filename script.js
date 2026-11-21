// ==UserScript==
// @name         Google Docs auto-comments: The Dead Child
// @namespace    local.deadchild.annotations
// @version      1.7
// @description  Finds each annotated passage in a Google Doc and adds the matching comment.
// @match        https://docs.google.com/document/d/*
// @grant        none
// @run-at       document-end
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // Hotkey to run everything: Alt + Shift + Y
  // (Ctrl + Alt + M is Google Docs' own "insert comment" shortcut, so the script
  // uses it internally and needs a different key of its own.)
  const HOTKEY = { key: 'y', ctrl: false, alt: true, shift: true };

  // [text to find in the doc, comment text], in story order.
  const ITEMS = [
    ["midst of the summer that sang", "Frame / Theme: The story starts and ends with this same question, so I think the narrator can't let this memory go. 'Summer that sang' is a happy image, which makes the sad memory hit harder."],
    ["no intimation of sorrow", "Foreshadowing: She says nothing sad had touched her before this. It sets up a big contrast between her happy summer and the memory she's about to tell."],
    ["become discouraged", "Foreshadowing / Theme: The old teacher might have just given up. This is the first hint that teachers don't stay in this village."],
    ["the Normal School", "Glossary: A Normal School is where people trained to be teachers back then. She's a student taking a short replacement job, which is why she isn't staying."],
    ["Believe me", "Character: The principal talks about the job as a step for her career, not about the kids. It shows how outsiders see this village as a stepping stone."],
    ["few shacks built on sand", "Setting: The village is tiny and really poor. Shacks on sand with nothing around them makes it feel empty and forgotten."],
    ["spindly spruce trees", "Imagery: Thin, weak trees match the poor village. They also kind of remind me of the skinny, tired kids."],
    ["become attached to the children", "Conflict (inside): She's already worried about getting close to kids she'll leave in a month. It shows she cares but expects to go."],
    ["same calculation was in the minds", "Character: She thinks the children are wondering if she's worth getting to know. I think that's really her own worry, because teachers keep leaving."],
    ["so dejected, so apathetic", "Diction: Her words are harsh and she's guessing how the kids feel. She's wrong about 'apathetic', which she figures out later."],
    ["hardly more than a child", "Point of view: The narrator is young and doesn't have much experience. That makes her easy to relate to, but she's also an outsider who doesn't fully get this community."],
    ["hot as an oven", "Simile / Atmosphere: Comparing the room to an oven makes the heat feel heavy and hard to breathe in. The mood is uncomfortable and tense right from the start."],
    ["Scarcely knowing where or how", "Character: She has no idea how to begin. It shows how unprepared and unsure she is."],
    ["like this, for no reason", "Frame: The names come back to her 'for no reason' after all this time. That tells me this memory is really stuck in her."],
    ["who rose and answered", "Glossary: 'Mamzelle' is how the kids say 'mademoiselle', so they're French-speaking. Answering 'Present' so formally shows how polite and reserved they are."],
    ["told of métis blood", "Glossary / Perspective: Métis are people with both Indigenous and European ancestry who have their own culture. The narrator only describes how they look and never explains their history, which tells me she's seeing them from the outside."],
    ["exquisitely polite", "Irony: Being super polite sounds good, but here it keeps her out. The kids are perfect on the surface but not open with her."],
    ["the inconceivable distance they maintained", "Conflict: There's a big emotional gap between the teacher and the kids. It gets fixed later by doing something together, not by teaching."],
    ["It crushed me", "Diction: 'Crushed' is a strong word. She takes the distance really personally."],
    ["untouchable, barricaded in some region", "Metaphor: She imagines the kids behind a wall she can't get through. She says it about 'children' in general, but I think the real gap is between her and this community."],
    ["No one answered", "Plot / Suspense: Silence after the roll call. It builds tension before we find out why."],
    ["above the buzzing of flies", "Imagery / Symbol: The flies show up before we even know about the death. It sets a gross, neglected feeling and comes back around Yolande's body later."],
    ["She died last night", "Plot / Understatement: Nobody makes a big deal out of the news. The calm voice bothers her more than the death, and to me it shows how normal death is for these kids."],
    ["nodded gravely", "Character: The kids confirm the death without words, in a serious way. They act older than they are."],
    ["sense of impotence greater than", "Conflict (inside): She feels powerless. Later she says human efforts all fail, so she's really struggling with feeling like she can't help."],
    ["lost for words", "Repetition: She just says 'Ah' twice. She doesn't know what to say, so the kids end up leading the conversation."],
    ["already laid out", "Glossary: 'Laid out' means the body is prepared and shown before the burial. Here it happens at home."],
    ["eyes like coals", "Simile / Perspective: Another description of how the kids look, this time their dark eyes. It's vivid, but it's still the narrator describing them from the outside."],
    ["bury her for good tomorrow", "Tone: The boy says it so casually. 'For good' makes it sound final, and it shows how used to this the kids are."],
    ["got worse the last two months", "Theme: She was sick for a long time and everyone watched. It makes me think about how nobody could help her."],
    ["in silence for a long time", "Atmosphere: They look at each other without talking, and I think this is when they first connect. They share the sadness without needing to explain it."],
    ["taken for indifference", "Irony: She thought the kids didn't care, but they were really sad. Her first impression was wrong, which shows how outsiders can misread a community."],
    ["stupefying heat", "Metaphor / Atmosphere: She compares the sadness in their eyes to the heat. Both weigh everyone down and you can't escape them."],
    ["trace of a smile, wary", "Character: The smile is small and careful. It's the first sign the kids might trust her."],
    ["visit her, her whole class", "Plot (turning point): She decides to visit Yolande instead of just teaching. 'Her whole class' makes the grief something they share."],
    ["destined to a sort of failure", "Theme: One death makes her think all human effort fails. The kids still try to pay attention in class, though, which kind of proves her wrong."],
    ["making no more noise than", "Atmosphere: The kids walk as quietly as if they were in trouble. It feels like a funeral march and shows they take this seriously."],
    ["leading a blind person", "Simile / Character: The kids guide her like she can't see. It flips the roles, since the teacher should be the one leading."],
    ["enclosed in their circle", "Symbol: The kids form a circle around her like they're protecting her. Later they make another circle around Yolande, so circles stand for community."],
    ["forgotten, as it were", "Setting: The cabin is far from the village, which is already poor. I think the distance stands for how Yolande's family is ignored."],
    ["door was wide open", "Setting / Imagery: They can see the body from far away because the door is open. It shows there's no privacy, but it also feels like an invitation for everyone to share the grief."],
    ["rough boards suspended between two straight chairs", "Setting / Symbol: Yolande is laid on boards across two chairs, which are probably the only chairs they have. It shows how poor the family is, even in death."],
    ["covered her with a clean sheet", "Character (parents): The clean sheet shows they cared and wanted her to look decent."],
    ["the two very tight braids", "Character (parents): The narrator guesses what the parents did ('probably', 'undoubtedly'). The braids show they cared, even though they're poor."],
    ["pressing need had sent them away", "Conflict / Theme: The parents had to leave to get a coffin or boards. Poverty forces them to leave their own child alone."],
    ["emptied for her", "Character (parents): They cleared a room just for Yolande. It's the best they could do, and it shows respect."],
    ["that is to say, with the flies", "Climax / Symbol: Yolande is left alone with the flies, which stand for decay and neglect. This is the lowest point of the story."],
    ["faint odour of death", "Imagery: The smell is what attracts the flies. It's a gross, honest detail that doesn't hide the death."],
    ["blue body walk over her forehead", "Imagery: A fly walking on her face is disturbing. It shows nobody was there to protect her."],
    ["drive the flies away", "Character / Plot: This is the first thing the narrator actually does. Fanning the flies away is a small act of respect, and the kids see it."],
    ["the cares of the adults", "Theme: Poverty and sickness make these kids grow up too fast. The line says it quietly, but it's a criticism of how they live."],
    ["something to keep", "Irony: She thinks about what she would have taught Yolande. That chance is gone, which is why it hurts."],
    ["this little stranger", "Character / Title: Yolande is a stranger to the narrator, and the title just calls her 'the dead child'. The narrator imagines a bond that never really existed, which makes the memory sad."],
    ["perhaps even for life", "Theme: She calls 'for life' a foolish phrase right after. The bond she imagined can disappear really fast, like her one-month job."],
    ["some poor little joy", "Pathos: She sees regret on a dead face, which is her guess, not a fact. It makes me feel bad for Yolande and sets up the roses as joy she never got."],
    ["expected everything from me", "Character / Conflict: The kids now treat her like the adult in charge, even though she says she doesn't know more than they do. Her leading comes from caring, not authority."],
    ["someone with her always", "Four R's (respect): She says Yolande shouldn't be alone. It's a way of respecting her and gives the kids something to do with their sadness."],
    ["take turns then, four or five", "Four R's (responsibility): They share the job of guarding her. The whole class takes responsibility."],
    ["glow in their dark eyes", "Imagery: Their eyes finally light up. It's different from the 'eyes like coals' earlier, and it's the first sign of life in the kids."],
    ["a trust in me so complete", "Word choice: 'Terrified' is strong for being trusted. It shows how heavy responsibility feels, which connects to the four R's."],
    ["bright pink stain on the ground", "Symbol / Imagery: It looks like a stain or wound at first and is only later called roses. It's the one nice moment in the day."],
    ["touched by a certain grace", "Diction: 'Grace' is a religious word, which fits the Catholic community. The roses feel like a gift, and it hints at the ending."],
    ["She was smart, Yolande", "Indirect characterization: We only learn about Yolande from what the kids remember. Her being smart matters because she barely got to go to school."],
    ["always being absent", "Theme: Yolande missed lots of school, probably because she was sick. Poverty and illness got in the way of her education."],
    ["could have done well", "Theme: She had potential that got wasted. It's sad to think about how many kids never got a chance."],
    ["the third, mamzelle", "Conflict (external): Three teachers in one year, because they think it's too lonesome. The school system keeps leaving this community, and she's only there a month too."],
    ["they replied with a single voice", "Glossary / Theme: T.B. is tuberculosis, a disease linked to poverty and crowded homes. The kids all say it together like it's normal. Good link for my research."],
    ["customary way for children to die", "Tone / Irony: The narrator says death from T.B. is normal here. That's what is shocking, because it shouldn't be normal."],
    ["opening the poor little doors", "Metaphor: The kids' feelings are like doors nobody wanted to open. She opens them by asking about Yolande, not by teaching. 'Poor' also means both sad and poverty-stricken."],
    ["ever much wanted to see opened", "Theme: Nobody had really cared to listen to these kids before. It's a criticism of how outsiders and the system ignored them."],
    ["wept inconsolably for weeks", "Theme (education): She cried for weeks over one lost book, so books were rare and important. Yolande loved school but couldn't get much of it."],
    ["grudged lending their readers", "Character: The kids feel guilty they wouldn't lend their readers. Poverty makes even small sharing hard. It makes them feel real, not perfect."],
    ["dress for her first communion", "Glossary: First communion is a Catholic ceremony where kids wear a special white dress. It shows their faith and why the dress mattered."],
    ["a beautiful lace curtain", "Symbol: The only curtain in the house became her dress. It shows what the family gave up for her. Her absence is the big presence in the story."],
    ["melancholy landscape", "Pathetic fallacy: The land looks sad, just like the mood. The pink roses stand out against it."],
    ["from the poorest soil", "Theme (resilience): The roses grow in the worst soil, just like the kids. It's hopeful but also sad, because it's all they get."],
    ["felt some alleviation", "Character: Seeing the roses makes the narrator feel better. She needs comfort too, not just the kids."],
    ["slow smile of gentle sadness", "Style: The smile is happy and sad at once. It's repeated from earlier, so it shows the kids' feelings are shifting."],
    ["sort of rivalry had gripped", "Plot (resolution): The kids compete over who finds the best roses, so for once they act like kids. Doing this together is what finally closes the gap with the narrator."],
    ["scattered petals over", "Symbol / Ritual: The kids make their own funeral ritual with the roses. They created it together, not an adult."],
    ["emerged from the pink drift", "Imagery: 'Drift' sounds like snow or sand. The petals feel like both a burial and a blessing, and her face looks 'less forlorn', so beauty helps without erasing the grief."],
    ["bitter sadness of the morning", "Mood shift: The kids aren't as bitter as they were at the start of the day. The mood changed because of what they did together."],
    ["got to heaven by this time", "Theme (faith): The kids comfort themselves, not the narrator. Their faith gives them a way to deal with loss, and she just listens."],
    ["for being alive", "Theme: The ending is quiet and nothing gets fixed. 'For being alive' makes it sound like surviving is something to feel bad about."],
    ["why, oh why", "Rhetorical question: She asks it again, which shows she's still upset after all these years. It makes the frame feel real."],
    ["wind with the scent of roses", "Imagery: The memory comes back through a smell, which is how real memories work. The roses go from comforting to painful."],
    ["scent I have not much liked", "Frame / Sensory: Roses were comforting then but now remind her of loss. It brings us back to the present and explains why the memory keeps returning."],
    ["as they say, experience", "Irony: She took the job to get 'experience', but what she really gained was emotional. 'As they say' shows she's distancing herself from the system that sent her."]
  ];

  // Timing (ms). Raise these if your connection or computer is slow.
  const T = { afterFind: 450, afterClose: 250, boxWait: 2000, manualWait: 20000, afterPost: 150 };
  // Docs gets laggy with lots of comments, so Run all pauses every BATCH comments.
  const BATCH = 15;

  let nextIndex = 0;
  let running = false;
  let stopFlag = false;
  const skipped = [];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => !!el && (el.offsetParent !== null || el.getClientRects().length > 0);

  async function waitFor(fn, timeout, step) {
    const start = Date.now();
    while (Date.now() - start < (timeout || 3000)) {
      const v = fn();
      if (v) return v;
      await sleep(step || 100);
    }
    return null;
  }

  // ---------- Keyboard helpers ----------
  function editorFrameDoc() {
    const f = document.querySelector('iframe.docs-texteventtarget-iframe');
    try { return f ? f.contentDocument : null; } catch (e) { return null; }
  }

  function docTarget() {
    const d = editorFrameDoc();
    return d ? (d.activeElement || d.body) : document.body;
  }

  function sendKey(target, type, o) {
    const ev = new KeyboardEvent(type, {
      key: o.key, code: o.code, bubbles: true, cancelable: true,
      ctrlKey: !!o.ctrl, altKey: !!o.alt, shiftKey: !!o.shift
    });
    Object.defineProperty(ev, 'keyCode', { get: () => o.keyCode });
    Object.defineProperty(ev, 'which', { get: () => o.keyCode });
    target.dispatchEvent(ev);
  }

  function press(target, o) {
    sendKey(target, 'keydown', o);
    sendKey(target, 'keyup', o);
  }

  function clickEl(el) {
    ['mouseover', 'mouseenter', 'mousedown', 'mouseup', 'click'].forEach((t) =>
      el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }))
    );
  }

  // ---------- Find bar ----------
  const findInput = () => {
    const el = document.querySelector('input[aria-label="Find in document"]') ||
               document.querySelector('input.docs-findinput-input');
    return visible(el) ? el : null;
  };

  // Reads "1 of 3" / "No results" from the find bar, whatever its class names are.
  function findState(inp) {
    let n = inp;
    for (let k = 0; k < 3; k++) {
      n = n && n.parentElement;
      if (!n) break;
      const t = (n.textContent || '').replace(/\s+/g, ' ');
      if (t.length > 400) break;
      if (/no\s+(results|matches)/i.test(t)) return { none: true };
      const m = t.match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
      if (m) return { cur: +m[1], total: +m[2], none: +m[2] === 0 };
    }
    return null;
  }

  // A signature of where the current text selection is drawn on screen.
  function selSig() {
    const els = [...document.querySelectorAll('.kix-selection-overlay')];
    if (!els.length) return null;
    return els.map((e) => {
      const r = e.getBoundingClientRect();
      return [r.left | 0, r.top | 0, r.width | 0, r.height | 0].join(',');
    }).join(';');
  }

  const norm = (t) => (t || '').toLowerCase()
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ').trim();

  // Docs keeps the currently selected text in its hidden editing frame.
  function selectedText() {
    const d = editorFrameDoc();
    if (!d) return '';
    let t = '';
    try { t = d.getSelection ? d.getSelection().toString() : ''; } catch (e) {}
    if (!t && d.body) t = d.body.innerText || d.body.textContent || '';
    return t;
  }

  // Closes the find bar (Esc, then its close button) so the match stays selected.
  async function closeBar(inp) {
    press(inp, { key: 'Escape', code: 'Escape', keyCode: 27 });
    await sleep(T.afterClose);
    if (findInput()) {
      closeFindBar(inp);
      await sleep(T.afterClose);
    }
    if (findInput()) {
      toast('Press Esc yourself to close the find bar (the match stays selected)...');
      await waitFor(() => !findInput(), T.manualWait);
      await sleep(200);
    }
  }

  // Returns 'ok', 'nomatch' or 'nobar'. Does a fresh Ctrl+F every time.
  async function selectText(text) {
    // 1. Start clean: close any find bar left open from last time.
    let inp = findInput();
    if (inp) await closeBar(inp);

    // 2. Fresh Ctrl+F.
    press(docTarget(), { key: 'f', code: 'KeyF', keyCode: 70, ctrl: true });
    inp = await waitFor(findInput, 1500);
    if (!inp) {
      toast('The script could not press Ctrl+F. Press Ctrl+F yourself in the doc (waiting)...');
      inp = await waitFor(findInput, T.manualWait);
    }
    if (!inp) return 'nobar';

    // 3. Type the phrase.
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    inp.focus();
    setter.call(inp, '');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(120);
    setter.call(inp, text);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    sendKey(inp, 'keyup', { key: 'End', code: 'End', keyCode: 35 });
    await sleep(T.afterFind);

    const st = findState(inp);
    console.log('[DeadChild] find state for "' + text + '":', st);
    if (st && st.none) { await closeBar(inp); return 'nomatch'; }

    // 4. Close the bar; the match stays selected in the doc.
    await closeBar(inp);
    await sleep(150);
    return 'ok';
  }

  // ---------- Comment box ----------
  function closeFindBar(inp) {
    let n = inp;
    for (let k = 0; k < 8 && n; k++) {
      n = n.parentElement;
      if (!n) break;
      const b = [...n.querySelectorAll('[aria-label^="Close"]')].find(visible);
      if (b) { clickEl(b); return true; }
    }
    return false;
  }

  function findCommentButton() {
    return [...document.querySelectorAll(
      '[aria-label^="Add comment"], [data-tooltip^="Add comment"], [aria-label^="Insert comment"]'
    )].find(visible) || null;
  }

  // Opens the comment box by clicking the toolbar button or Insert > Comment,
  // and only falls back to the Ctrl+Alt+M keystroke.
  async function openCommentUI() {
    const tb = findCommentButton();
    if (tb) { clickEl(tb); return 'toolbar'; }
    const menu = document.querySelector('#docs-insert-menu');
    if (menu) {
      clickEl(menu);
      await sleep(450);
      const item = [...document.querySelectorAll('[role="menuitem"]')].filter(visible)
        .find((el) => /^\s*(add\s+)?comment\b/i.test((el.getAttribute('aria-label') || el.textContent).trim()));
      if (item) { clickEl(item); return 'menu'; }
      press(document.body, { key: 'Escape', code: 'Escape', keyCode: 27 });
    }
    press(docTarget(), { key: 'm', code: 'KeyM', keyCode: 77, ctrl: true, alt: true });
    return 'key';
  }

  function diagnose() {
    const checks = {
      'find field': !!findInput(),
      'editor iframe': !!editorFrameDoc(),
      'toolbar comment button': !!findCommentButton(),
      'Insert menu': !!document.querySelector('#docs-insert-menu'),
      'comment box open': !!commentBox()
    };
    toast(Object.entries(checks).map(([k, v]) => k + ': ' + (v ? 'yes' : 'NO')).join(' | ') +
      ' | selected text read: "' + selectedText().slice(0, 40) + '"');
    console.log('[DeadChild] diagnose', checks);
  }


  function commentBox() {
    const list = [...document.querySelectorAll(
      '[aria-label="Comment draft"], .docos-input-textarea, .docos-input-contenteditable, .docos-input [contenteditable="true"]'
    )].filter(visible);
    return list.length ? list[list.length - 1] : null;
  }

  async function addComment(text) {
    const how = await openCommentUI();
    let box = await waitFor(commentBox, T.boxWait);
    if (!box && how !== 'key') {
      press(docTarget(), { key: 'm', code: 'KeyM', keyCode: 77, ctrl: true, alt: true });
      box = await waitFor(commentBox, T.boxWait);
    }
    if (!box) {
      toast('Comment box did not open. Press Ctrl+Alt+M yourself (text is still selected)...');
      box = await waitFor(commentBox, T.manualWait);
      if (!box) return false;
    }

    box.focus();
    document.execCommand('insertText', false, text);
    if (!box.textContent || box.textContent.indexOf(text.slice(0, 15)) === -1) {
      box.textContent = text;
      box.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await sleep(250);

    const btn = [...document.querySelectorAll('.docos-input-post, div[role="button"], button')]
      .filter(visible)
      .find((b) => /^comment$/i.test((b.getAttribute('aria-label') || b.textContent).trim()));
    if (btn) {
      clickEl(btn);
    } else {
      press(box, { key: 'Enter', code: 'Enter', keyCode: 13, ctrl: true });
    }
    await waitFor(() => !commentBox(), 2500, 80);
    await sleep(T.afterPost);
    return true;
  }

  // ---------- Runner ----------
  let lastSig = null;
  let overlaysSeen = false;

  async function runOne(i) {
    const [find, comment] = ITEMS[i];
    toast('(' + (i + 1) + '/' + ITEMS.length + ') Finding: ' + find);
    let r = await selectText(find);
    if (r === 'nobar') {
      toast('Could not open the find bar. Click in the doc, press Ctrl+F yourself, then click Next one again.');
      return 'fail';
    }
    if (r === 'nomatch') {
      skipped.push((i + 1) + ': ' + find);
      console.warn('[DeadChild] not found:', find);
      toast('(' + (i + 1) + ') Not in your doc, skipped: ' + find);
      const bar = findInput();
      if (bar) { press(bar, { key: 'Escape', code: 'Escape', keyCode: 27 }); await sleep(T.afterClose); }
      return 'skip';
    }

    // Safety check 1: read the selected text straight from Docs.
    const want = norm(find).slice(0, 20);
    let sel = norm(selectedText());
    if (sel && !sel.includes(want)) {
      toast('#' + (i + 1) + ': wrong text selected, retrying...');
      r = await selectText(find);
      sel = norm(selectedText());
      if (sel && !sel.includes(want)) {
        toast('#' + (i + 1) + ': could not select "' + find + '" (got "' + sel.slice(0, 40) + '"). Stopped so it does not comment on the wrong text.');
        return 'fail';
      }
    }

    // Safety check 2 (only if the selected text could not be read): did the highlight move?
    if (!sel) {
      const sig = selSig();
      if (sig) overlaysSeen = true;
      if ((sig && sig === lastSig) || (!sig && overlaysSeen)) {
        toast('#' + (i + 1) + ': the selection did not move, so I stopped instead of commenting on the wrong text.');
        return 'fail';
      }
      lastSig = sig;
    }

    const ok = await addComment(comment);
    if (!ok) toast('Comment box never opened for #' + (i + 1) + '. Select the text, press Ctrl+Alt+M, then click Next one.');
    return ok ? 'ok' : 'fail';
  }

  async function run(count) {
    if (running) return;
    running = true;
    stopFlag = false;
    skipped.length = 0;

    if (nextIndex === 0) {
      press(docTarget(), { key: 'Home', code: 'Home', keyCode: 36, ctrl: true });
      await sleep(300);
    }

    let done = 0;
    while (nextIndex < ITEMS.length && done < count && !stopFlag) {
      const res = await runOne(nextIndex);
      if (res === 'fail') break;
      nextIndex++;
      done++;
      updateLabel();
      if (count > BATCH && done % BATCH === 0 && nextIndex < ITEMS.length && !stopFlag) {
        toast('Paused after ' + done + ' to let Docs catch up. Click Run all to keep going from #' + (nextIndex + 1) + '.');
        break;
      }
    }

    running = false;
    updateLabel();
    if (nextIndex >= ITEMS.length) {
      toast('Finished.' + (skipped.length ? ' Not found: ' + skipped.join(' | ') : ' All comments added.'));
    } else if (!stopFlag && done >= count) {
      toast('Done for now. Next is #' + (nextIndex + 1) + '.');
    }
  }


  // ---------- Assist mode (most reliable) ----------
  // Copies the next comment to the clipboard and tells you what to select.
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.style.cssText = 'position:fixed;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  async function assistNext() {
    if (nextIndex >= ITEMS.length) { toast('All ' + ITEMS.length + ' comments done.'); return; }
    const i = nextIndex;
    const [find, comment] = ITEMS[i];
    const copied = await copyText(comment);
    const inp = findInput();
    if (inp) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(inp, find);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    toast('#' + (i + 1) + ' select: "' + find + '"  ->  Ctrl+Alt+M, Ctrl+V, Ctrl+Enter. ' +
      (copied ? 'Comment copied.' : 'Copy failed, see console.'));
    if (!copied) console.log('[DeadChild] comment text:', comment);
    nextIndex++;
    updateLabel();
  }

  // ---------- Small UI ----------
  let panel, label, msg;

  function toast(t) {
    if (msg) msg.textContent = t;
    console.log('[DeadChild]', t);
  }

  function updateLabel() {
    if (label) label.textContent = 'Next comment: #' + Math.min(nextIndex + 1, ITEMS.length) + ' of ' + ITEMS.length;
  }

  function mkBtn(text, fn) {
    const b = document.createElement('button');
    b.textContent = text;
    b.style.cssText = 'margin:2px;padding:4px 8px;font:12px Arial;cursor:pointer;';
    b.addEventListener('click', fn);
    return b;
  }

  function buildPanel() {
    if (panel) return;
    panel = document.createElement('div');
    panel.style.cssText =
      'position:fixed;right:16px;bottom:16px;z-index:99999;background:#fff;color:#222;' +
      'border:1px solid #888;border-radius:6px;padding:8px;width:330px;font:12px Arial;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.3);';
    const title = document.createElement('div');
    title.textContent = 'The Dead Child comments';
    title.style.cssText = 'font-weight:bold;margin-bottom:4px;';
    label = document.createElement('div');
    msg = document.createElement('div');
    msg.style.cssText = 'margin:4px 0;color:#555;min-height:40px;';
    msg.textContent = 'Click inside the doc first. Hotkey: Alt+Shift+Y';

    panel.append(
      title, label, msg,
      mkBtn('Assist next', assistNext),
      mkBtn('Next one', () => run(1)),
      mkBtn('Run all', () => run(ITEMS.length)),
      mkBtn('Stop', () => { stopFlag = true; }),
      mkBtn('Diagnose', diagnose),
      mkBtn('Set start', () => {
        const v = parseInt(prompt('Start at which comment number (1-' + ITEMS.length + ')?', String(nextIndex + 1)), 10);
        if (v >= 1 && v <= ITEMS.length) { nextIndex = v - 1; updateLabel(); }
      })
    );
    document.body.appendChild(panel);
    updateLabel();
  }

  // ---------- Hotkey ----------
  function onKey(e) {
    if (e.ctrlKey === HOTKEY.ctrl && e.altKey === HOTKEY.alt && e.shiftKey === HOTKEY.shift &&
        e.key.toLowerCase() === HOTKEY.key) {
      e.preventDefault();
      e.stopPropagation();
      run(ITEMS.length);
    }
  }

  function attachHotkeys() {
    window.addEventListener('keydown', onKey, true);
    const d = editorFrameDoc();
    if (d && !d.__deadChildHooked) {
      d.addEventListener('keydown', onKey, true);
      d.__deadChildHooked = true;
    }
  }

  console.log('[DeadChild] script loaded v1.7');
  setInterval(attachHotkeys, 2000);
  // Keep trying until the page body exists, then show the panel.
  const panelTimer = setInterval(() => {
    if (document.body) {
      buildPanel();
      if (panel && document.body.contains(panel)) clearInterval(panelTimer);
    }
  }, 500);
})();