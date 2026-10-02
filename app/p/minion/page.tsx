import CaseStudyLayout from '@/components/case-study/layout';
import { CaseStudySection, CaseStudyText, CaseStudyHighlight } from '@/components/case-study/section';
import { CaseStudyPlaceholder } from '@/components/case-study/placeholder';
import { projects } from '@/content/projects';

export default function MinionCaseStudy() {
  return (
    <CaseStudyLayout project={projects.minion} intro={
      <CaseStudySection>
        <CaseStudyText>
          Minion is a personal assistant I text like a friend. It started in July 2026 as a small
          bridge between <CaseStudyHighlight>iMessage and Claude</CaseStudyHighlight>, and grew into
          something that keeps track of what I&apos;ve asked for, does research, sets reminders, and
          notices useful next steps on its own.
        </CaseStudyText>
        <CaseStudyText>
          The idea is that an assistant should live where people already are. No new app, no new
          device, just a text thread. Under the hood it&apos;s about <CaseStudyHighlight>20k lines of
          Python</CaseStudyHighlight> and one SQLite database, running as a single service on a VPS.
        </CaseStudyText>
      </CaseStudySection>
    }>
      <CaseStudyPlaceholder
        label="screenshot: a normal text conversation with Minion"
        aspectRatio="phone"
        caption="A typical exchange. Short replies, and it asks before doing anything that can't be undone."
      />

      <CaseStudySection title="Architecture">
        <CaseStudyText>
          Every interaction follows the same path: <CaseStudyHighlight>select context, run tools,
          verify the outcome, deliver</CaseStudyHighlight>. Python owns execution and delivery. Claude
          handles interpretation and bounded reasoning, but it never gets a general shell, and it
          can&apos;t give itself new permissions by editing a workflow.
        </CaseStudyText>
        <CaseStudyText>
          Texts come in through a messaging transport, become conversation turns, and turn into tasks.
          Tasks own their outcome, evidence, budget, and wake-up times. Account events and scheduled
          checks create tasks the same way, so a new email and a text from me go through one system.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudyPlaceholder
        label="diagram: texts → conversation → tasks → workflow engine → capabilities → attention policy → texts"
        caption="High-level architecture. Memory sits beside tasks, and every outcome is reviewed before the loop closes."
      />

      <CaseStudySection title="Workflows as data">
        <CaseStudyText>
          Compound work runs as <CaseStudyHighlight>JSON workflows versioned in Git</CaseStudyHighlight>.
          A workflow is a graph of three kinds of steps: <em>action</em> (call a capability like Gmail,
          Calendar, Notion, or web research), <em>reason</em> (a scoped model call that has to return
          validated output), and <em>wait</em> (for a time, a reply, or an event).
        </CaseStudyText>
        <CaseStudyText>
          Steps are leased, so a crash mid-run doesn&apos;t double-execute anything. Each run pins the
          Git commit it started on and keeps step results across restarts, which means a reminder set on
          Monday still fires on Friday after three redeploys. The model can compose new workflows
          through typed MCP tools, and every definition is validated before it&apos;s activated.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudyPlaceholder
        label="screenshot: a workflow definition and its run history"
        caption="One workflow and its step-by-step run log."
      />

      <CaseStudySection title="Memory">
        <CaseStudyText>
          Memory is split into three layers on purpose: a bounded recent conversation for continuity,
          selected durable facts like preferences, people, projects, and decisions, and the full original
          transcript for exact older wording (&ldquo;what exactly did I say last month?&rdquo;).
          Ordinary messages don&apos;t become permanent memory.
        </CaseStudyText>
        <CaseStudyText>
          Facts carry scope, aliases, and domains, and retrieval happens again after every read, so a
          calendar result can pull in a relevant preference the original message never mentioned.
          Everything lives in <CaseStudyHighlight>SQLite with full revision history and
          provenance</CaseStudyHighlight>, exported daily as a browsable Git snapshot.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudySection title="Being proactive without being annoying">
        <CaseStudyText>
          The hardest part is deciding when to text. Background checks watch connected accounts, and
          every finding records its source, revision, and an expiry time. An <CaseStudyHighlight>attention
          policy</CaseStudyHighlight> dedupes findings across workflows, drops stale ones, and caps how
          often non-urgent updates go out. Reminders I asked for skip the queue.
        </CaseStudyText>
        <CaseStudyText>
          Scheduled checks that find nothing finish silently from their execution receipts, without
          another model call. Task budgets, daily model limits, and timeouts keep automatic work bounded.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudyPlaceholder
        label="screenshot: a proactive alert (e.g. a calendar change or important email)"
        aspectRatio="phone"
        caption="A proactive text. Minion noticed something and decided it was worth interrupting for."
      />

      <CaseStudySection title="A browser of its own">
        <CaseStudyText>
          For sites without an API, Minion drives a <CaseStudyHighlight>headed Chromium browser on a
          separate sandboxed machine</CaseStudyHighlight> with persistent profiles. It can click, fill
          forms, and handle routine reversible actions on its own. Anything consequential, like paying,
          sending, or deleting, needs my explicit approval over text.
        </CaseStudyText>
        <CaseStudyText>
          Passwords and verification codes never pass through the model. When a site needs one, Minion
          texts me a one-time private link bound to that exact login field, and the browser fills it in
          directly. Submitting it wakes the original task back up.
        </CaseStudyText>
      </CaseStudySection>

      <CaseStudyPlaceholder
        label="screenshot: browser flow (login handoff with private input link)"
        caption="Minion hits a login page, texts a private input link, and continues once it's filled."
      />

      <CaseStudySection title="Reliability">
        <CaseStudyText>
          Each chat owns a persisted Claude session. If a call gets interrupted, the retry resumes that
          session with a snapshot of its plan and the tool results it already has, so it picks up where it
          left off instead of redoing the whole request. Web answers have to cite a fresh source with the
          exact supporting excerpt.
        </CaseStudyText>
        <CaseStudyText>
          Minion can also propose changes to its own code. Proposals are persisted, reviewed, and shipped
          by a deploy helper that lives outside the app, so a restart mid-deploy doesn&apos;t lose anything.
        </CaseStudyText>
      </CaseStudySection>
    </CaseStudyLayout>
  );
}
