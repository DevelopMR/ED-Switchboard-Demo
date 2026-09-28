import * as React from "react";

export interface SectionBandProps {
  title: string;
  subtitle?: string;
}

export function SectionBand(props: SectionBandProps): JSX.Element {
  return (
    <div className="swSectionBand">
      <strong>{props.title}</strong>
      {props.subtitle ? <span> {props.subtitle}</span> : null}
    </div>
  );
}
