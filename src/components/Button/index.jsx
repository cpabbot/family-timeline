import Link from "next/link";
import styles from "./button.module.css";

export default function Button({ text = "", onClick, children, actionButton = false }) {
  return (
    <button className={`${styles.btn} ${actionButton ? styles.actionButton : ""}`} onClick={onClick}>
      {text || children}
    </button>
  )
}
