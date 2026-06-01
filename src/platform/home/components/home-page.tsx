import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  DatabaseZap,
  FileSpreadsheet,
  FileText,
  Gauge,
  GitBranch,
  HandCoins,
  KeyRound,
  Landmark,
  Layers3,
  LockKeyhole,
  MapPinned,
  Network,
  ReceiptText,
  ScrollText,
  Settings2,
  ShieldCheck,
  UserCog,
  UserRoundCheck,
  UsersRound,
  Workflow,
} from "lucide-react";

const navGroups = [
  { label: "Product", href: "#platform", items: ["Platform", "Workflow", "Analytics", "Integrations"] },
  { label: "Modules", href: "#modules", items: ["HCM", "Expense", "Requisition", "Procurement", "Payroll", "Finance", "Projects"] },
  { label: "Solutions", href: "#roles", items: ["Startups", "Services", "Multi-branch", "Enterprise teams"] },
  { label: "Pricing", href: "#pricing", items: ["Starter", "Professional", "Enterprise"] },
  { label: "Resources", href: "#security", items: ["Docs", "Support", "Security", "Audit"] },
];

const valueCards = [
  {
    title: "One operating system for every department",
    copy: "Bring HR, finance-ready workflows, procurement requests, approvals, and operations into one shared business workspace.",
    icon: Network,
  },
  {
    title: "Subscription-ready SaaS foundation",
    copy: "Run tenant workspaces, module entitlements, plan access, and provisioning from a platform designed for controlled growth.",
    icon: CreditCard,
  },
  {
    title: "Approvals built into the work",
    copy: "Move requests from submission to decision with role-aware routing, status visibility, and captured approval history.",
    icon: Workflow,
  },
  {
    title: "Start lean, expand module by module",
    copy: "Begin with core people, expense, and requisition workflows, then add procurement, payroll, finance, projects, and analytics.",
    icon: Layers3,
  },
];

const platformLayers = [
  {
    eyebrow: "Layer 01",
    title: "SaaS Platform",
    copy: "Tenants, plans, subscriptions, module access, and provisioning give each customer a governed workspace foundation.",
    icon: DatabaseZap,
  },
  {
    eyebrow: "Layer 02",
    title: "Company Foundation",
    copy: "Company identity, users, roles, branches, departments, and cost centres keep business structure consistent across modules.",
    icon: Building2,
  },
  {
    eyebrow: "Layer 03",
    title: "Workflow & Approvals",
    copy: "Request routing, approval queues, notification signals, and audit capture make every operational decision traceable.",
    icon: GitBranch,
  },
  {
    eyebrow: "Layer 04",
    title: "Business Modules",
    copy: "HCM, expenses, requisitions, procurement, payroll, finance-ready operations, projects, invoices, and reporting can expand over time.",
    icon: Boxes,
  },
  {
    eyebrow: "Layer 05",
    title: "Reports & Audit",
    copy: "Dashboards, operational snapshots, usage signals, and audit trails help leaders understand activity before it becomes a bottleneck.",
    icon: BarChart3,
  },
];

const modules = [
  { title: "HCM & Employee Management", value: "Maintain employee records, assignments, and people operations in one governed module.", badge: "Core", icon: UsersRound },
  { title: "Leave & Attendance", value: "Support leave requests, attendance visibility, and manager review workflows.", badge: "Core", icon: Clock3 },
  { title: "Expense Management", value: "Submit claims, capture approval status, and prepare expenses for finance review.", badge: "Core", icon: ReceiptText },
  { title: "Requisitions", value: "Create structured internal requests before procurement or operational action begins.", badge: "Core", icon: ClipboardCheck },
  { title: "Procurement", value: "Extend requisitions into controlled purchase workflows as the company matures.", badge: "Add-on", icon: Boxes },
  { title: "Payroll", value: "Plan for payroll-ready employee and attendance data without overloading the early setup.", badge: "Planned", icon: HandCoins },
  { title: "Projects & Cost Centres", value: "Track work, departments, budgets, and spending context across the company structure.", badge: "Add-on", icon: BriefcaseBusiness },
  { title: "Invoices", value: "Prepare invoice workflows that can connect operational activity with finance teams.", badge: "Planned", icon: FileText },
  { title: "Finance-ready Accounting", value: "Keep approvals, costs, invoices, and audit records ready for deeper accounting workflows.", badge: "Add-on", icon: Landmark },
  { title: "Reports & Analytics", value: "Review operational KPIs, approval queues, tenant health, and module usage patterns.", badge: "Platform", icon: FileSpreadsheet },
  { title: "Workflow & Approvals", value: "Route decisions through role-aware checks with visible status and audit capture.", badge: "Platform", icon: Workflow },
  { title: "Audit & Compliance", value: "Design everyday operations around permissions, history, and controlled access.", badge: "Platform", icon: ShieldCheck },
];

const journeySteps = [
  "Create tenant and company workspace",
  "Choose plan and module access",
  "Provision the workspace foundation",
  "Configure company identity and structure",
  "Invite users and assign roles",
  "Launch workflows and business modules",
  "Track activity through dashboards and audit",
];

const roleBenefits = [
  {
    role: "Founder / CEO",
    outcome: "Visibility and control without forcing every team into separate tools.",
    points: ["Company-wide operating snapshot", "Module adoption and setup progress", "Decision queues that show where work is waiting"],
    icon: Gauge,
  },
  {
    role: "CFO / Finance",
    outcome: "Expense, invoice, cost-centre, and audit readiness before finance workflows become complex.",
    points: ["Approval history for financial requests", "Cost centre and department context", "Finance-ready operational records"],
    icon: CircleDollarSign,
  },
  {
    role: "HR / Admin",
    outcome: "People, leave, attendance, onboarding, and role management connected to the same company structure.",
    points: ["Employee and branch visibility", "Role-aware employee actions", "Controlled setup for growing teams"],
    icon: UserCog,
  },
  {
    role: "Managers",
    outcome: "Practical approval queues and team visibility that reduce informal follow-ups.",
    points: ["Pending approvals by type", "Team requests and status", "Notifications when decisions are needed"],
    icon: UserRoundCheck,
  },
  {
    role: "Operations",
    outcome: "Requisitions, procurement, project tracking, and operational requests organized in one workflow layer.",
    points: ["Structured request intake", "Procurement-ready workflow path", "Project and cost context"],
    icon: MapPinned,
  },
];

const securityControls = [
  { title: "Role-based access control", copy: "Design access around user responsibilities and operational boundaries.", icon: KeyRound },
  { title: "Tenant data isolation", copy: "Keep each customer workspace scoped to its tenant and subscription context.", icon: LockKeyhole },
  { title: "Module-level permissions", copy: "Expose modules and actions according to entitlement and role access.", icon: Settings2 },
  { title: "Approval history", copy: "Capture who acted, what changed, and where the request moved next.", icon: ScrollText },
  { title: "Subscription-based access", copy: "Align feature availability with configured plans, modules, and workspace status.", icon: CreditCard },
  { title: "Future-ready integrations", copy: "Use a platform foundation that can connect to specialist systems over time.", icon: Network },
];

const customizationItems = [
  "Module-based plans",
  "Configurable workflows",
  "Role-based dashboards",
  "Company settings",
  "Branches and departments",
  "Cost centres",
  "Controlled customization",
  "Configuration-first architecture",
];

const plans = [
  {
    name: "Starter",
    fit: "For teams formalizing basic business operations.",
    modules: ["Company setup", "Users and roles", "Expense workflows", "Requisitions"],
    cta: "Request Starter Demo",
  },
  {
    name: "Professional",
    fit: "For growing companies that need stronger approvals and operational visibility.",
    modules: ["Core platform", "HCM", "Approvals", "Procurement-ready workflows", "Analytics"],
    cta: "Talk to Sales",
    featured: true,
  },
  {
    name: "Enterprise",
    fit: "For multi-branch and complex teams that need governed expansion.",
    modules: ["Multi-company structure", "Advanced permissions", "Audit controls", "Integration planning"],
    cta: "Plan Enterprise Rollout",
  },
];

const footerGroups = [
  { title: "Product", links: ["Platform", "Workflow", "Analytics", "Integrations"] },
  { title: "Modules", links: ["HCM", "Expense", "Requisition", "Procurement", "Payroll", "Finance"] },
  { title: "Company", links: ["About", "Contact", "Partners", "Careers"] },
  { title: "Resources", links: ["Docs", "Blog", "Support", "Security"] },
  { title: "Legal", links: ["Privacy", "Terms", "Data processing"] },
];

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 ${className}`}>
      <div className="crosshair crosshair-tl" aria-hidden="true" />
      <div className="crosshair crosshair-br" aria-hidden="true" />
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#176f5c]">{eyebrow}</p>}
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#18241f] sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="mt-4 text-base leading-7 text-[#5e665f] sm:text-lg">{description}</p>
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}

function TechnicalBadge({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "amber" | "green" | "neutral" }) {
  const tones = {
    teal: "border-[#209f84]/25 bg-[#209f84]/10 text-[#176f5c]",
    amber: "border-[#c98232]/30 bg-[#c98232]/15 text-[#8d561a]",
    green: "border-[#74c978]/30 bg-[#74c978]/15 text-[#245c33]",
    neutral: "border-[#203029]/15 bg-[#fffaf0]/60 text-[#26362f]",
  };

  return <span className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${tones[tone]}`}>{children}</span>;
}

function IconStamp({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={`flex h-11 w-11 items-center justify-center border border-[#235a4a]/20 bg-[#e8f6ed]/55 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] ${className}`}>
      <Icon className="h-5 w-5 text-[#16836c]" strokeWidth={1.8} />
    </div>
  );
}

function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#203029]/15 bg-[#f4f1e8]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between border border-[#203029]/15 bg-[#fffaf0]/55 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_12px_40px_rgba(30,45,39,0.06)] sm:px-4" aria-label="Primary navigation">
          <Link href="/" className="flex items-center gap-3" aria-label="ERP Platform home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[linear-gradient(135deg,#f6ead4,#dff5e8)] shadow-[0_0_0_1px_rgba(35,72,60,0.16),0_8px_20px_rgba(45,105,82,0.12)]">
              <Layers3 className="h-5 w-5 text-[#12745f]" />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-[#18241f]">Rama ERP</span>
              <span className="hidden text-xs text-[#5e665f] sm:block">Unified cloud operations</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navGroups.map((group) => (
              <Link key={group.label} href={group.href} className="group relative px-3 py-2 text-sm font-medium text-[#26362f] transition hover:text-[#12745f]">
                {group.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-[#12745f] transition group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/setup" className="hidden rounded-full border border-[#1f463a]/20 px-4 py-2 text-sm font-medium text-[#26362f] transition hover:border-[#12745f]/40 hover:text-[#12745f] sm:inline-flex">
              Login
            </Link>
            <Link href="#demo" className="inline-flex items-center gap-2 rounded-full bg-[#1c352d] px-4 py-2 text-sm font-semibold text-[#fffdf5] shadow-[0_10px_24px_rgba(28,53,45,0.18)] transition hover:bg-[#12745f]">
              Request Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function HeroDashboardMockup() {
  const adoption = [72, 58, 46, 35, 62, 80];

  return (
    <div className="relative mx-auto max-w-2xl lg:mx-0">
      <div className="absolute -left-6 top-10 hidden h-28 w-28 border border-dashed border-[#209f84]/25 bg-[#74c978]/10 lg:block" />
      <div className="absolute -right-4 -top-5 hidden h-20 w-20 border border-dashed border-[#c98232]/30 bg-[#c98232]/10 lg:block" />
      <div className="technical-panel relative overflow-hidden rounded-[10px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#203029]/15 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#176f5c]">SaaS Command View</p>
            <h3 className="mt-1 text-xl font-semibold text-[#18241f]">Operations workspace</h3>
          </div>
          <TechnicalBadge tone="green">Tenant healthy</TechnicalBadge>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Active modules", value: "08", tone: "#209f84" },
            { label: "Approval queue", value: "14", tone: "#c98232" },
            { label: "Setup progress", value: "76%", tone: "#74c978" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-[6px] border border-[#203029]/15 bg-[#fffaf0]/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#5e665f]">{metric.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-semibold text-[#18241f]">{metric.value}</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: metric.tone, boxShadow: `0 0 0 4px ${metric.tone}24` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[6px] border border-[#203029]/15 bg-[#fffaf0]/65 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#18241f]">Module adoption</p>
                <p className="text-xs text-[#5e665f]">Core workflows moving into controlled operations</p>
              </div>
              <TechnicalBadge tone="teal">Live</TechnicalBadge>
            </div>
            <div className="mt-5 flex h-32 items-end gap-2 border-b border-l border-dashed border-[#203029]/15 px-2 pb-2">
              {adoption.map((height, index) => (
                <div key={height} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full bg-[linear-gradient(180deg,#209f84,#74c978)] shadow-[0_0_18px_rgba(32,159,132,0.16)]" style={{ height: `${height}%` }} />
                  <span className="text-[10px] text-[#5e665f]">M{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[6px] border border-[#203029]/15 bg-[#fffaf0]/65 p-4">
            <p className="text-sm font-semibold text-[#18241f]">Approval signal</p>
            <div className="mt-4 space-y-3">
              {[
                ["Expense claim", "Manager review", "amber"],
                ["Laptop requisition", "Procurement ready", "teal"],
                ["Branch setup", "Admin action", "green"],
              ].map(([title, status, tone]) => (
                <div key={title} className="flex items-center justify-between gap-3 border border-dashed border-[#203029]/15 bg-[#fffaf0]/45 px-3 py-2">
                  <span className="text-xs font-medium text-[#26362f]">{title}</span>
                  <TechnicalBadge tone={tone as "teal" | "amber" | "green"}>{status}</TechnicalBadge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[6px] border border-[#203029]/15 bg-[#fffaf0]/65 p-4">
          <div className="grid gap-3 text-xs sm:grid-cols-4">
            {[
              "Tenant created",
              "Modules entitled",
              "Roles assigned",
              "Audit active",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-2 text-[#26362f]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#209f84]/40 bg-[#209f84]/10 text-[10px] font-semibold text-[#176f5c]">{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_35%,rgba(61,142,112,0.13),transparent_34%),radial-gradient(circle_at_70%_60%,rgba(198,143,61,0.10),transparent_38%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="inline-flex items-center gap-2 border border-dashed border-[#a6691c]/55 bg-[#ffd282]/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8d561a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c98232] shadow-[0_0_0_4px_rgba(201,130,50,0.16)]" />
            Modular ERP for growing teams
          </div>
          <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-[#18241f] sm:text-5xl lg:text-7xl">
            Run your growing business from one connected ERP platform.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5e665f] sm:text-xl">
            Unify people, approvals, expenses, requisitions, subscriptions, and business operations in a cloud ERP foundation built to start lean and scale module by module.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#demo" className="inline-flex items-center justify-center gap-2 bg-[#1c352d] px-6 py-3.5 text-sm font-semibold text-[#fffdf5] shadow-[0_10px_24px_rgba(28,53,45,0.18)] transition hover:bg-[#12745f]">
              Request Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#modules" className="inline-flex items-center justify-center gap-2 border-l-[3px] border-l-[#c98232] border-y border-r border-dashed border-[#203029]/20 bg-[#fffaf0]/50 px-6 py-3.5 text-sm font-semibold text-[#26362f] transition hover:text-[#12745f]">
              Explore Modules <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-[#5e665f] sm:grid-cols-2 lg:grid-cols-4">
            {["Secure by design", "Modular access", "Role-aware workflows", "Subscription-ready"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16836c]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <HeroDashboardMockup />
      </div>
    </section>
  );
}

function ValueStrip() {
  return (
    <section className="border-y border-[#203029]/15 bg-[#ede8dc]/70">
      <div className="mx-auto grid max-w-7xl divide-y divide-dashed divide-[#203029]/15 px-4 sm:px-6 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4 lg:px-8">
        {valueCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="p-6 lg:p-8">
              <div className="mb-5 flex h-8 w-8 items-center justify-center border border-transparent bg-[linear-gradient(#f6f0e4,#f6f0e4)_padding-box,linear-gradient(135deg,#229d83,#7fd67c,#d28b3a)_border-box]">
                <Icon className="h-4 w-4 text-[#16836c]" />
              </div>
              <h3 className="text-base font-semibold text-[#18241f]">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5e665f]">{card.copy}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PlatformLayers() {
  return (
    <SectionShell id="platform" eyebrow="Platform overview" title="A layered ERP foundation, not a single disconnected module." description="The platform is organized around tenant provisioning, company setup, workflows, business modules, reporting, and audit so teams can scale without rebuilding their operating model.">
      <div className="grid gap-4 lg:grid-cols-5">
        {platformLayers.map((layer, index) => {
          const Icon = layer.icon;
          return (
            <article key={layer.title} className={`technical-card relative p-5 ${index === 2 ? "lg:-mt-6" : index % 2 === 0 ? "lg:mt-6" : ""}`}>
              <div className="mb-5 flex items-center justify-between">
                <IconStamp icon={Icon} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c98232]">{layer.eyebrow}</span>
              </div>
              <h3 className="text-lg font-semibold text-[#18241f]">{layer.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5e665f]">{layer.copy}</p>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

function ModuleGrid() {
  return (
    <SectionShell id="modules" eyebrow="Module suite" title="Choose the modules you need now, then expand responsibly." description="The landing page presents modules as practical capabilities, not inflated claims. Each module fits into the shared SaaS, workflow, permission, and audit foundation.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const badgeTone = module.badge === "Core" ? "green" : module.badge === "Platform" ? "teal" : module.badge === "Planned" ? "amber" : "neutral";
          return (
            <article key={module.title} className="technical-card group p-5 transition duration-200 hover:-translate-y-1 hover:border-[#209f84]/30 hover:shadow-[0_18px_42px_rgba(32,48,41,0.10)]">
              <div className="flex items-start justify-between gap-4">
                <IconStamp icon={Icon} />
                <TechnicalBadge tone={badgeTone as "teal" | "amber" | "green" | "neutral"}>{module.badge}</TechnicalBadge>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[#18241f]">{module.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5e665f]">{module.value}</p>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

function HowItWorks() {
  return (
    <SectionShell id="how-it-works" eyebrow="How it works" title="From tenant setup to everyday operations in a governed path." description="The product journey follows the platform architecture: Tenant, subscription, module entitlements, provisioning, company setup, users and roles, business modules, then audit and reports.">
      <div className="technical-panel relative overflow-hidden rounded-[8px] p-5 sm:p-8">
        <div className="absolute inset-x-8 top-1/2 hidden border-t border-dashed border-[#209f84]/45 lg:block" aria-hidden="true" />
        <div className="grid gap-4 lg:grid-cols-7">
          {journeySteps.map((step, index) => (
            <div key={step} className="relative rounded-[6px] border border-[#203029]/15 bg-[#fffaf0]/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#209f84]/35 bg-[#209f84]/10 text-sm font-semibold text-[#176f5c]">{index + 1}</span>
                {index < journeySteps.length - 1 && <ArrowRight className="hidden h-4 w-4 text-[#c98232] lg:block" />}
              </div>
              <p className="text-sm font-medium leading-5 text-[#26362f]">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function RoleBenefits() {
  return (
    <SectionShell id="roles" eyebrow="Role-based benefits" title="Every team sees the controls and decisions that matter to them." description="The platform is built around role-aware work: leaders get visibility, managers get approval clarity, and operational teams get structured workflows.">
      <div className="grid gap-4 lg:grid-cols-5">
        {roleBenefits.map((role) => {
          const Icon = role.icon;
          return (
            <article key={role.role} className="technical-card flex flex-col p-5">
              <IconStamp icon={Icon} />
              <h3 className="mt-5 text-lg font-semibold text-[#18241f]">{role.role}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5e665f]">{role.outcome}</p>
              <div className="mt-5 space-y-3 border-l-[3px] border-[#c98232] pl-4">
                {role.points.map((point) => (
                  <p key={point} className="text-xs leading-5 text-[#26362f]">{point}</p>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

function WorkflowSection() {
  const flow = [
    { label: "Request created", detail: "Employee or manager starts a structured request." },
    { label: "Approval routed", detail: "Role and module rules send work to the right queue." },
    { label: "Audit captured", detail: "Decision history is recorded as the request moves." },
    { label: "Status updated", detail: "Teams see progress without informal follow-up." },
    { label: "Notification sent", detail: "Signals are triggered when action is required." },
    { label: "Reporting impact", detail: "Operational records are ready for dashboards and finance review." },
  ];

  return (
    <SectionShell eyebrow="Workflow backbone" title="Approvals are not an afterthought; they are part of the operating fabric." description="Requests, decisions, status changes, notifications, and audit history are connected so routine work can become reliable business process.">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-r-0 border-dashed border-[#203029]/15 lg:border-r lg:pr-8">
          <IconStamp icon={Workflow} />
          <h3 className="mt-5 text-2xl font-semibold text-[#18241f]">Request to decision, with traceability at each step.</h3>
          <p className="mt-4 text-base leading-7 text-[#5e665f]">The workflow layer is designed to help teams replace scattered approvals with consistent routing, visible queues, and captured history that can later support finance, reporting, and operational control.</p>
          <div className="mt-6 border-l-[3px] border-[#c98232] border-y border-r border-dashed border-[#203029]/15 bg-[#fffaf0]/45 p-4 text-sm text-[#26362f]">
            Controlled workflow configuration keeps the MVP practical while leaving room for future business rules and integrations.
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {flow.map((item, index) => (
            <article key={item.label} className="technical-card relative p-5">
              <span className="absolute -left-1 top-6 h-2 w-2 rounded-full bg-[#c98232] shadow-[0_0_0_4px_rgba(201,130,50,0.12)]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#176f5c]">Step {String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-lg font-semibold text-[#18241f]">{item.label}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5e665f]">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function AnalyticsSection() {
  return (
    <SectionShell eyebrow="Analytics and visibility" title="See operational signals before they become management surprises." description="Dashboard views can surface tenant health, module usage, approval queues, expense status, subscription context, audit trails, and operational KPIs.">
      <div className="technical-panel grid gap-5 rounded-[8px] p-5 lg:grid-cols-[1fr_1.2fr] lg:p-8">
        <div className="space-y-4">
          {[
            { label: "Expenses pending approval", value: "14", trend: "Manager queue" },
            { label: "Active subscription modules", value: "08", trend: "Core + add-ons" },
            { label: "Audit events today", value: "32", trend: "Normal activity" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-[6px] border border-[#23372f]/15 bg-[#fffbf1]/80 p-4 shadow-[0_12px_32px_rgba(32,48,41,0.08)]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#5e665f]">{metric.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-4xl font-semibold tracking-[-0.04em] text-[#18241f]">{metric.value}</span>
                <TechnicalBadge tone="amber">{metric.trend}</TechnicalBadge>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[6px] border border-[#203029]/15 bg-[#fffaf0]/65 p-5">
          <div className="flex items-center justify-between border-b border-dashed border-[#203029]/15 pb-4">
            <div>
              <p className="font-semibold text-[#18241f]">Operations snapshot</p>
              <p className="text-sm text-[#5e665f]">Sample dashboard panel for business review</p>
            </div>
            <BellRing className="h-5 w-5 text-[#c98232]" />
          </div>
          <div className="mt-5 grid gap-3">
            {[
              ["Tenant health", "Stable", "teal"],
              ["Module adoption", "Improving", "green"],
              ["Approval bottleneck", "Finance review", "amber"],
              ["Subscription usage", "Within plan", "teal"],
            ].map(([name, status, tone]) => (
              <div key={name} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-dashed border-[#203029]/12 pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-[#26362f]">{name}</span>
                <TechnicalBadge tone={tone as "teal" | "amber" | "green"}>{status}</TechnicalBadge>
              </div>
            ))}
          </div>
          <div className="mt-6 flex h-28 items-end gap-2 border-l border-b border-dashed border-[#203029]/15 px-3 pb-3">
            {[42, 55, 48, 66, 58, 76, 70, 82].map((height, index) => (
              <div key={`${height}-${index}`} className="w-full bg-[#c98232] odd:bg-[#209f84]" style={{ height: `${height}%`, opacity: 0.82 }} />
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function SecurityControlSection() {
  return (
    <SectionShell id="security" eyebrow="Security, control, audit" title="Built with controls for the way business buyers evaluate ERP systems." description="The platform avoids unsupported certification claims while making the control model clear: roles, tenants, permissions, subscriptions, workflow history, and audit trails.">
      <div className="security-panel grid gap-8 rounded-[10px] p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div>
          <IconStamp icon={ShieldCheck} />
          <h3 className="mt-5 text-2xl font-semibold text-[#18241f]">Governed access from tenant to module action.</h3>
          <p className="mt-4 text-base leading-7 text-[#5e665f]">A serious ERP needs more than screens. It needs a control model that understands workspaces, subscriptions, module entitlements, roles, permissions, and approval history.</p>
          <div className="mt-6 overflow-hidden rounded-[6px] border-2 border-transparent bg-[linear-gradient(145deg,rgba(255,252,242,0.94),rgba(232,239,231,0.88))_padding-box,linear-gradient(135deg,#209f84,#7fd67c,#7a69e8,#d28b3a)_border-box] p-4 shadow-[0_18px_50px_rgba(32,48,41,0.14),0_0_28px_rgba(35,160,130,0.16)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d561a]">Control engine</p>
            <div className="mt-4 grid gap-3 text-sm text-[#26362f]">
              {['Tenant scope', 'Subscription entitlement', 'Role permission', 'Audit record'].map((item) => (
                <div key={item} className="flex items-center justify-between border-b border-dashed border-[#203029]/15 pb-2 last:border-0 last:pb-0">
                  <span>{item}</span>
                  <span className="h-2 w-2 rounded-full bg-[#c98232] shadow-[0_0_0_4px_rgba(201,130,50,0.12)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {securityControls.map((control) => {
            const Icon = control.icon;
            return (
              <article key={control.title} className="border-b border-dashed border-[#203029]/15 pb-5">
                <Icon className="h-5 w-5 text-[#16836c]" strokeWidth={1.8} />
                <h3 className="mt-3 text-base font-semibold text-[#18241f]">{control.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5e665f]">{control.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

function CustomizationSection() {
  return (
    <section className="border-y border-[#203029]/15 bg-[#ede8dc]/70 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#176f5c]">Configuration-first architecture</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#18241f] sm:text-4xl">Adapt the ERP with controlled customization, not uncontrolled complexity.</h2>
          <p className="mt-4 text-base leading-7 text-[#5e665f]">Companies should be able to shape plans, workflows, dashboards, settings, branches, departments, and cost centres while still preserving an upgradeable SaaS foundation.</p>
        </div>
        <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(rgba(33,72,61,0.16)_1px,transparent_1px)] [background-size:8px_8px] [mask-image:radial-gradient(circle,black_0%,transparent_72%)]" />
          {customizationItems.map((item) => (
            <div key={item} className="rounded-[7px] border border-[#1f342c]/15 bg-[#fffcf4]/80 px-4 py-3 text-sm font-medium text-[#26362f] shadow-[0_8px_20px_rgba(32,48,41,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <SectionShell id="pricing" eyebrow="Plans preview" title="Pricing can be configured around modules, users, and rollout needs." description="These plan cards are intentionally presented as a preview. Exact pricing can be aligned with selected modules, number of users, implementation scope, and support needs.">
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className={`technical-card flex flex-col p-6 ${plan.featured ? "bg-[linear-gradient(#fffaf0,#fffaf0)_padding-box,linear-gradient(135deg,#25a98b,#7fd67c,#d28b3a)_border-box] border-[1.5px] border-transparent" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-[#18241f]">{plan.name}</h3>
              {plan.featured && <TechnicalBadge tone="amber">Popular path</TechnicalBadge>}
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5e665f]">{plan.fit}</p>
            <div className="mt-6 space-y-3">
              {plan.modules.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-[#26362f]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#16836c]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-dashed border-[#203029]/15 pt-5">
              <Link href="#demo" className="inline-flex w-full items-center justify-center gap-2 bg-[#1c352d] px-5 py-3 text-sm font-semibold text-[#fffdf5] transition hover:bg-[#12745f]">
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function FinalCTA() {
  return (
    <section id="demo" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#ffbd63,#f3a64b_55%,#e69038)] p-8 shadow-[0_24px_70px_rgba(159,94,28,0.22),inset_0_1px_0_rgba(255,255,255,0.45)] sm:p-12 lg:p-16">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-[radial-gradient(rgba(111,63,20,0.18)_1px,transparent_1px)] [background-size:5px_5px] [mask-image:linear-gradient(to_right,black,transparent)]" aria-hidden="true" />
        <div className="absolute -top-24 right-8 h-56 w-56 rounded-full bg-[repeating-conic-gradient(from_180deg,rgba(35,150,122,0.65)_0deg_1deg,transparent_1deg_3deg)] opacity-40 [mask-image:radial-gradient(circle,transparent_42%,black_44%,transparent_72%)]" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <TechnicalBadge tone="neutral">ERP foundation</TechnicalBadge>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#18241f] sm:text-5xl">Build your business on a connected ERP foundation.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#2b332e] sm:text-lg">Start with the workflows your team needs today, then expand into procurement, payroll, finance-ready operations, analytics, and more when the company is ready.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href="mailto:sales@example.com?subject=ERP%20Demo%20Request" className="inline-flex items-center justify-center gap-2 bg-[#1c352d] px-7 py-4 text-sm font-semibold text-[#fffdf5] shadow-[0_10px_24px_rgba(28,53,45,0.18)] transition hover:bg-[#12745f]">
              Request Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/admin/setup" className="inline-flex items-center justify-center gap-2 border-l-[3px] border-l-[#1c352d] border-y border-r border-dashed border-[#203029]/25 bg-[#fffaf0]/45 px-7 py-4 text-sm font-semibold text-[#26362f] transition hover:text-[#12745f]">
              Login to Workspace <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[#203029]/15 bg-[linear-gradient(to_bottom,rgba(244,241,232,0.92),rgba(232,226,213,0.96))] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[18vw] font-semibold leading-none text-transparent opacity-30 [-webkit-text-stroke:1px_rgba(155,103,35,0.22)]" aria-hidden="true">ERP</div>
      <div className="relative mx-auto grid max-w-7xl gap-10 border-t border-dashed border-[#203029]/15 pt-10 lg:grid-cols-[1.5fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[linear-gradient(135deg,#f6ead4,#dff5e8)] shadow-[0_0_0_1px_rgba(35,72,60,0.16),0_8px_20px_rgba(45,105,82,0.12)]">
              <Layers3 className="h-5 w-5 text-[#12745f]" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#18241f]">Rama ERP</p>
              <p className="text-sm text-[#5e665f]">Unified cloud ERP platform for growing companies.</p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-6 text-[#5e665f]">Manage people, approvals, expenses, requisitions, subscriptions, operations, finance-ready workflows, and growth from one connected system.</p>
          <div className="mt-6 flex gap-3">
            {[Network, ShieldCheck, BarChart3].map((Icon, index) => (
              <span key={index} className="flex h-9 w-9 items-center justify-center border border-[#203029]/15 bg-[#fffaf0]/70 shadow-[0_8px_18px_rgba(32,48,41,0.08)]">
                <Icon className="h-4 w-4 text-[#16836c]" />
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {footerGroups.map((group) => (
            <div key={group.title} className="lg:border-l lg:border-dashed lg:border-[#203029]/15 lg:pl-5">
              <h3 className="text-sm font-semibold text-[#18241f]">{group.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-[#5e665f]">
                {group.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="transition hover:text-[#12745f]">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-dashed border-[#203029]/15 pt-6 text-sm text-[#5e665f] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Rama ERP. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/admin/setup" className="hover:text-[#12745f]">Login</Link>
          <Link href="#demo" className="hover:text-[#12745f]">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export function HomePage() {
  return (
    <main className="landing-canvas min-h-screen overflow-hidden text-[#18241f]">
      <LandingNavbar />
      <HeroSection />
      <ValueStrip />
      <PlatformLayers />
      <ModuleGrid />
      <HowItWorks />
      <RoleBenefits />
      <WorkflowSection />
      <AnalyticsSection />
      <SecurityControlSection />
      <CustomizationSection />
      <PricingPreview />
      <FinalCTA />
      <LandingFooter />
    </main>
  );
}
