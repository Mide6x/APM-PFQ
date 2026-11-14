import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="page-footer">
      <nav aria-label="Privacy and data">
        <Link href="/privacy">Privacy and your data</Link>
        <Link href="/cookies">Cookie settings</Link>
        <Link href="/privacy#requests">Access, correct or delete your data</Link>
      </nav>
      <p>Independent study companion. Not affiliated with or endorsed by the Association for Project Management.</p>
    </footer>
  );
}
