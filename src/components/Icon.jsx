const paths = {
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M10 2h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1Z",
  fingerprint: "M4 12a8 8 0 0 1 16 0 M7 14v-2a5 5 0 0 1 10 0v4 M10 19v-7a2 2 0 0 1 4 0v7 M4 15v3 M7 17v5 M17 20v2 M20 15v4",
  key: 'M14 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M10 15l-7 7 M3 18l3 3 M6 15l3 3',
  clock: 'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  circle: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  chevron: 'm9 6 6 6-6 6',
  grid: 'M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z',
  list: 'M8 5h13 M8 12h13 M8 19h13 M3 5h1 M3 12h1 M3 19h1',
  filter: 'M3 6h18 M3 12h18 M3 18h18 M7 3v6 M16 9v6 M9 15v6',
  bank: 'm3 8 9-5 9 5Z M5 10v8 M10 10v8 M15 10v8 M20 10v8 M3 21h18',
  archive: 'M3 3h18v5H3Z M5 8v13h14V8 M9 12h6',
  letter: 'M3 5h18v14H3Z m0 0 9 8 9-8',
  device: 'M3 3h18v13H3Z M8 21h8 M12 16v5',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  user: 'M20 21v-3a8 8 0 0 0-16 0v3 M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  info: 'M12 11v6 M12 7h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  help: 'M9 8a3 3 0 1 1 6 0c0 2-3 2-3 5 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  home: "m3 10 9-7 9 7v10H3Z M9 20v-7h6v7",
  vault: "M4 3h16v18H4Z M4 7h16 M8 11h8 M8 15h5",
  family:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  lock: "M5 10h14v11H5Z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z m-4 9 3 3 5-6",
  plus: "M12 5v14 M5 12h14",
  arrow: "M4 12h16 m-6-6 6 6-6 6",
  search: "M21 21l-5-5 M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16",
  close: "m6 6 12 12 M6 18 18 6",
  check: "m5 12 4 4L19 6",
  download: "M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5",
  refresh: "M20 7a9 9 0 1 0 1 8 M20 3v5h-5",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  logout: "M9 3H3v18h6 M9 12h12 m-5-5 5 5-5 5",
  file: "M14 2H4v20h16V8Z M14 2v6h6 M8 12h8 M8 16h5",
};
export default function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.file} />
    </svg>
  );
}
