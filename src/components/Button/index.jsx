import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./button.module.css";

export default function Button({ text = "", onClick, children, type, buttonType, href }) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button className={`${styles.btn} ${styles[type]}`} onClick={handleClick} type={buttonType}>
      {text || children}
    </button>
  )
}
