import Link from "next/link";
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <Link href="/">
        <a>
          <img src="/logo.svg" alt="logo" />
        </a>
        </Link>
      </div>
    </header>
  );
}
