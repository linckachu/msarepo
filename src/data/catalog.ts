export type CatalogKind = "film" | "dizi";

export type CatalogItem = {
  id: number;
  title: string;
  originalTitle: string;
  year: number;
  score: number;
  duration: string;
  kind: CatalogKind;
  genres: string[];
  description: string;
  palette: [string, string];
  label?: string;
  posterUrl?: string;
  sourceUrl?: string;
};

export const catalog: CatalogItem[] = [
  {
    id: 1,
    title: "Gece Hattı",
    originalTitle: "Night Line",
    year: 2026,
    score: 8.7,
    duration: "2 sa 18 dk",
    kind: "film",
    genres: ["Gerilim", "Suç"],
    description:
      "Şehrin son treninde kesişen üç yabancı, gün doğmadan önce aynı sırrın peşine düşer.",
    palette: ["#264653", "#e76f51"],
    label: "Öne çıkan",
  },
  {
    id: 2,
    title: "Son Sinyal",
    originalTitle: "The Last Signal",
    year: 2025,
    score: 8.3,
    duration: "1 sa 56 dk",
    kind: "film",
    genres: ["Bilim Kurgu", "Gizem"],
    description: "Terk edilmiş bir istasyondan gelen yayın, yıllardır kayıp olan bir ekibin izini taşır.",
    palette: ["#14213d", "#fca311"],
    label: "Yeni",
  },
  {
    id: 3,
    title: "Kuzey Odası",
    originalTitle: "The Northern Room",
    year: 2024,
    score: 7.9,
    duration: "8 bölüm",
    kind: "dizi",
    genres: ["Dram", "Gizem"],
    description: "Eski bir otelin kapalı katında bulunan oda, kasabanın unuttuğu hikâyeleri uyandırır.",
    palette: ["#3d405b", "#81b29a"],
  },
  {
    id: 4,
    title: "Kırık Pusula",
    originalTitle: "Broken Compass",
    year: 2025,
    score: 8.1,
    duration: "10 bölüm",
    kind: "dizi",
    genres: ["Macera", "Dram"],
    description: "Bir arama kurtarma ekibi, haritalarda görünmeyen bir rotanın ardındaki gerçeği arar.",
    palette: ["#2b2d42", "#ef8354"],
    label: "Popüler",
  },
  {
    id: 5,
    title: "Sessiz Liman",
    originalTitle: "Silent Harbor",
    year: 2023,
    score: 7.7,
    duration: "2 sa 04 dk",
    kind: "film",
    genres: ["Dram", "Suç"],
    description: "Sahil kasabasına dönen bir gazeteci, çocukluğundan kalan dosyanın hâlâ kapanmadığını görür.",
    palette: ["#003049", "#669bbc"],
  },
  {
    id: 6,
    title: "Dördüncü Kat",
    originalTitle: "Fourth Floor",
    year: 2026,
    score: 8.5,
    duration: "6 bölüm",
    kind: "dizi",
    genres: ["Gerilim", "Polisiye"],
    description: "Aynı binada yaşayan altı kişi, kayıp komşularıyla ilgili birbirinden farklı ifadeler verir.",
    palette: ["#432818", "#bb9457"],
    label: "Yeni bölüm",
  },
  {
    id: 7,
    title: "Yörünge",
    originalTitle: "Orbit",
    year: 2025,
    score: 8.0,
    duration: "1 sa 48 dk",
    kind: "film",
    genres: ["Bilim Kurgu", "Macera"],
    description: "Dünya ile iletişimi kesilen bir araştırmacı, istasyondaki tek kişinin kendisi olmadığını fark eder.",
    palette: ["#10002b", "#7b2cbf"],
  },
  {
    id: 8,
    title: "İnce Buz",
    originalTitle: "Thin Ice",
    year: 2024,
    score: 7.8,
    duration: "12 bölüm",
    kind: "dizi",
    genres: ["Suç", "Gerilim"],
    description: "Başkomiser Ada, çözülen her dosyanın aynı isme çıktığı bir kışın içinde sıkışır.",
    palette: ["#1d3557", "#a8dadc"],
  },
];
