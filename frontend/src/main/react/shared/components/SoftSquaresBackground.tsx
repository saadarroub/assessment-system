import React from "react";

const TOKENS = {
  grey:  "#808080",
  steel: "#56768f",
  navy:  "#264555",
  sand:  "#d2c9b9",
};

export function SoftSquaresBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-24 -left-20 h-64 w-64 rounded-[26px]"
        style={{ backgroundColor: TOKENS.grey, opacity: 0.12 }}
      />
      <div
        className="absolute -top-10 right-10 h-40 w-40 rounded-[20px]"
        style={{ backgroundColor: TOKENS.steel, opacity: 0.16 }}
      />
      <div
        className="absolute bottom-[-3rem] left-16 h-52 w-52 rounded-[24px]"
        style={{ backgroundColor: TOKENS.navy, opacity: 0.14 }}
      />
      <div
        className="absolute bottom-0 right-24 h-44 w-44 rounded-[22px]"
        style={{ backgroundColor: TOKENS.sand, opacity: 0.18 }}
      />
    </div>
  );
}
