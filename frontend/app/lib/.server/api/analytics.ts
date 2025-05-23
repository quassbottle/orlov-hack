import axios from "axios";

const client = axios.create({ baseURL: `http://5.129.202.165:8000` });

interface SimilarityItem {
  similarity_count: number;
  similarities: string[];
  original_text: string;
  problem: string;
  threshold: number;
}

interface SimilaritiesData {
  [key: string]: SimilarityItem;
}

export async function getFireMessageIds() {
  const response = await client.get<SimilaritiesData>("/similarities/all");
  const { data } = response;

  const entries = Object.entries(data);

  return entries
    .filter(([, value]) => value.similarity_count >= 2)
    .map(([key]) => key);
}
