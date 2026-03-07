"use client";

import Button from "@/components/Button";
import styles from "./page.module.css";
import Timeline from "./Timeline";
import { FaGear } from "react-icons/fa6";

// const { Client } = require("@notionhq/client");
// const notion = new Client({ auth: process.env.NOTION_KEY });

// const data = async() => {
//   const test = await notion.databases.query({
//     database_id: process.env.NOTION_PAGE_ID,
//   });
//   console.log(test);
// }

export default function Home() {
  // data();
  return (
    <main>
      <div className={`${styles.header} flex-row`}>
        <h2 className={`${styles.title} grow`}>Family Timeline</h2>
        <Button href="/settings">
          <FaGear /> Settings
        </Button>
      </div>
      <Timeline />
    </main>
  );
}
