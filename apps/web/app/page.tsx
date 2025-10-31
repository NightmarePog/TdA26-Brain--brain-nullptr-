import Image from "next/image";
import { API_URL } from "@/utils/url";
import styles from "./page.module.css";

const fetchUsers = async () => {
  // cache: "no-store" is used to prevent prerendering during build time
  const response = await fetch(`${API_URL}/api/users`, { cache: "no-store" });
  return response.json();
};

export default async function Home() {
  return (
    <main className={styles.page}>
      <Image src="/tda.png" alt="Tour de App 2026" width={100} height={100} />
      <section>
        <h1>Hello TdA</h1>
      </section>
      <blockquote>
        <p>This is a response from the API server running on port 3000</p>
      </blockquote>
    </main>
  );
}
