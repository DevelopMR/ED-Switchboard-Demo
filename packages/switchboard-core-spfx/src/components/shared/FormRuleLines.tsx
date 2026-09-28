import * as React from "react";

export interface FormRuleLinesProps {
  lines: number;
}

export function FormRuleLines(props: FormRuleLinesProps): JSX.Element {
  return (
    <div className="swRuleLines" aria-hidden="true">
      {Array.from({ length: props.lines }, (_, index) => (
        <div className="swRuleLine" key={index} />
      ))}
    </div>
  );
}
