import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./button.module.css";

export default function Button({ text = "", onClick, children, actionButton = false, href }) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button className={`${styles.btn} ${actionButton ? styles.actionButton : ""}`} onClick={handleClick}>
      {text || children}
    </button>
  )
}
