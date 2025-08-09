
export function AppLogo() {
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white p-2">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M4 4H8V20H4V4Z"
          className="fill-current text-[#0096FF]"
          fillOpacity="0.6"
        />
        <path
          d="M10 10H14V20H10V10Z"
          className="fill-current text-[#0096FF]"
          fillOpacity="0.8"
        />
        <path
          d="M16 14H20V20H16V14Z"
          className="fill-current text-[#0096FF]"
        />
        <path
            d="M4 8L10 3L16 9L20 5"
            stroke="#1E40AF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
