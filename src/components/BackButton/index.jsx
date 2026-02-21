import Link from "next/link";
import styles from "./backButton.module.css";

export default function BackButton({ href = "/" }) {
  return (
    <Link href={href} className={styles.backButton}>
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
    </Link>
  )
}